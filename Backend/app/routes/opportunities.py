from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Header, status

from app.database import get_database
from app.routes.auth import get_authenticated_user_id, is_recruiter_role
from app.schemas import OpportunityCreate, OpportunityResponse

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

    return {"message": "Opportunity deleted successfully"}
