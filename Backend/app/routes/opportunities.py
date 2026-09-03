import re
from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Header, Query, status

from app.database import get_database
from app.routes.auth import get_authenticated_user_id, get_student_onboarding_details, is_recruiter_role
from app.schemas import OpportunityCreate, OpportunityPage, OpportunityResponse

router = APIRouter(prefix="/opportunities", tags=["Opportunities"])


def build_stipend_value(payload: OpportunityCreate) -> Optional[str]:
    if payload.stipend:
        return payload.stipend

    if payload.stipendAmount is None:
        return None

    currency = payload.stipendCurrency or "PKR"
    period = payload.stipendPeriod or "MONTHLY"
    period_label = period.replace("_", " ").title()
    if period == "ONE_TIME":
        period_label = "One-time"
    if period == "PER_PROJECT":
        period_label = "Per project"

    return f"{currency} {payload.stipendAmount} / {period_label}"


async def get_current_recruiter_user(authorization: Optional[str]):
    user_id = await get_authenticated_user_id(authorization)
    db = get_database()
    user = await db["users"].find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if not is_recruiter_role(user.get("role")):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only recruiter accounts can manage opportunities.",
        )

    return user_id, user, db


def serialize_opportunity(doc: dict) -> dict:
    if not doc:
        return doc
    doc = dict(doc)
    doc["_id"] = str(doc["_id"])
    doc["createdBy"] = str(doc.get("createdBy")) if doc.get("createdBy") else None
    return doc


@router.post("/", response_model=OpportunityResponse, status_code=status.HTTP_201_CREATED)
async def create_opportunity(
    payload: OpportunityCreate,
    authorization: Optional[str] = Header(None),
):
    user_id, user, db = await get_current_recruiter_user(authorization)

    document = payload.model_dump()
    document["organization"] = payload.organization or user.get("companyName") or "Organization"
    document["createdBy"] = str(user_id)
    document["stipend"] = build_stipend_value(payload)
    document["publishedAt"] = payload.publishedAt or __import__("datetime").datetime.utcnow().isoformat()

    result = await db["opportunities"].insert_one(document)
    created_doc = await db["opportunities"].find_one({"_id": result.inserted_id})
    return serialize_opportunity(created_doc)


@router.get("/my", response_model=List[OpportunityResponse])
async def list_my_opportunities(authorization: Optional[str] = Header(None)):
    user_id, user, db = await get_current_recruiter_user(authorization)
    cursor = db["opportunities"].find({"createdBy": str(user_id)}).sort("publishedAt", -1)
    opportunities = []
    async for doc in cursor:
        opportunities.append(serialize_opportunity(doc))
    return opportunities


@router.get("/", response_model=List[OpportunityResponse])
async def list_opportunities():
    db = get_database()
    cursor = db["opportunities"].find().sort("publishedAt", -1)
    opportunities = []
    async for doc in cursor:
        opportunities.append(serialize_opportunity(doc))
    return opportunities


@router.get("/feed", response_model=OpportunityPage)
async def list_opportunity_feed(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    q: Optional[str] = Query(None, max_length=100),
    category: Optional[str] = Query(None, max_length=50),
    authorization: Optional[str] = Header(None),
):
    db = get_database()
    filters = {}
    if authorization:
        user_id = await get_authenticated_user_id(authorization)
        applied = await db["applications"].find({"candidateId": user_id}, {"opportunityId": 1}).to_list(length=None)
        applied_ids = [item["opportunityId"] for item in applied if item.get("opportunityId")]
        if applied_ids:
            filters["_id"] = {"$nin": applied_ids}
    if q and q.strip():
        search_pattern = re.escape(q.strip())
        filters["$or"] = [
            {"title": {"$regex": search_pattern, "$options": "i"}},
            {"organization": {"$regex": search_pattern, "$options": "i"}},
            {"requiredSkills": {"$regex": search_pattern, "$options": "i"}},
        ]
    if category and category.upper() != "ALL":
        filters["category"] = category.upper()

    total = await db["opportunities"].count_documents(filters)
    cursor = (
        db["opportunities"]
        .find(filters)
        .sort("publishedAt", -1)
        .skip((page - 1) * page_size)
        .limit(page_size)
    )
    opportunities = []
    async for doc in cursor:
        opportunities.append(serialize_opportunity(doc))
    return {"items": opportunities, "total": total, "page": page, "pageSize": page_size}


@router.get("/for-you", response_model=OpportunityPage)
async def list_personalized_opportunities(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    category: Optional[str] = Query(None, max_length=50),
    authorization: Optional[str] = Header(None),
):
    user_id = await get_authenticated_user_id(authorization)
    db = get_database()
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if is_recruiter_role(user.get("role")):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="For You is only available to students")

    details = get_student_onboarding_details(user)
    raw_skills = details.get("skills") or []
    student_skills = {
        str(skill).strip().casefold()
        for skill in (raw_skills.split(",") if isinstance(raw_skills, str) else raw_skills)
        if str(skill).strip()
    }
    profile_fields = [
        details.get("interests"), details.get("careerGoals"), details.get("degreeField"),
        details.get("education"), details.get("experience"), details.get("location"),
    ]
    stop_words = {"and", "the", "for", "with", "from", "this", "that", "have", "your", "want", "into", "years"}
    profile_terms = {
        term.casefold()
        for value in [*profile_fields, *student_skills]
        for term in re.findall(r"[a-zA-Z0-9+#.]+", str(value or ""))
        if len(term) > 2 and term.casefold() not in stop_words
    }
    if not profile_terms:
        return {"items": [], "total": 0, "page": page, "pageSize": page_size}

    filters = {}
    if category and category.upper() != "ALL":
        filters["category"] = category.upper()

    applied = await db["applications"].find({"candidateId": user_id}, {"opportunityId": 1}).to_list(length=None)
    applied_ids = [item["opportunityId"] for item in applied if item.get("opportunityId")]
    if applied_ids:
        filters["_id"] = {"$nin": applied_ids}

    matches = []
    cursor = db["opportunities"].find(filters).sort("publishedAt", -1)
    async for doc in cursor:
        opportunity_skills = {
            str(skill).strip().casefold()
            for skill in (doc.get("requiredSkills") or [])
            if str(skill).strip()
        }
        searchable_text = " ".join(str(doc.get(field) or "") for field in (
            "title", "organization", "description", "eligibility", "location", "category", "requiredSkills"
        )).casefold()
        matching_skills = student_skills.intersection(opportunity_skills)
        matching_terms = {term for term in profile_terms if term in searchable_text}
        if matching_terms:
            score = (len(matching_skills) * 5) + len(matching_terms)
            matches.append((score, doc))

    matches.sort(key=lambda item: item[0], reverse=True)
    total = len(matches)
    start = (page - 1) * page_size
    opportunities = [serialize_opportunity(doc) for _, doc in matches[start:start + page_size]]
    return {"items": opportunities, "total": total, "page": page, "pageSize": page_size}


@router.get("/public/{opportunity_id}", response_model=OpportunityResponse)
async def get_public_opportunity(opportunity_id: str):
    try:
        object_id = ObjectId(opportunity_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid opportunity id")

    db = get_database()
    opportunity = await db["opportunities"].find_one({"_id": object_id})
    if not opportunity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")
    return serialize_opportunity(opportunity)


@router.get("/{opportunity_id}", response_model=OpportunityResponse)
async def get_opportunity(opportunity_id: str, authorization: Optional[str] = Header(None)):
    user_id, user, db = await get_current_recruiter_user(authorization)
    try:
        object_id = ObjectId(opportunity_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid opportunity id")

    doc = await db["opportunities"].find_one({"_id": object_id, "createdBy": str(user_id)})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")
    return serialize_opportunity(doc)


@router.put("/{opportunity_id}", response_model=OpportunityResponse)
async def update_opportunity(
    opportunity_id: str,
    payload: OpportunityCreate,
    authorization: Optional[str] = Header(None),
):
    user_id, user, db = await get_current_recruiter_user(authorization)
    try:
        object_id = ObjectId(opportunity_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid opportunity id")

    existing = await db["opportunities"].find_one({"_id": object_id, "createdBy": str(user_id)})
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")

    update_data = payload.model_dump()
    update_data["organization"] = payload.organization or user.get("companyName") or "Organization"
    update_data["createdBy"] = str(user_id)
    update_data["stipend"] = build_stipend_value(payload)
    update_data["publishedAt"] = payload.publishedAt or existing.get("publishedAt") or __import__("datetime").datetime.utcnow().isoformat()

    await db["opportunities"].update_one({"_id": object_id}, {"$set": update_data})
    updated = await db["opportunities"].find_one({"_id": object_id})
    return serialize_opportunity(updated)


@router.delete("/{opportunity_id}")
async def delete_opportunity(opportunity_id: str, authorization: Optional[str] = Header(None)):
    user_id, user, db = await get_current_recruiter_user(authorization)
    try:
        object_id = ObjectId(opportunity_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid opportunity id")

    result = await db["opportunities"].delete_one({"_id": object_id, "createdBy": str(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")

    await db["users"].update_many(
        {"savedOpportunities": {"$in": [str(opportunity_id), object_id]}},
        {"$pull": {"savedOpportunities": {"$in": [str(opportunity_id), object_id]}}},
    )

    return {"message": "Opportunity deleted successfully"}
