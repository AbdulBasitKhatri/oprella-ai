from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Header, status

from app.database import get_database
from app.routes.auth import get_authenticated_user_id, is_recruiter_role
from app.schemas import OpportunityCreate, OpportunityResponse

router = APIRouter(prefix="/opportunities", tags=["Opportunities"])


@router.post("/", response_model=OpportunityResponse, status_code=status.HTTP_201_CREATED)
async def create_opportunity(
    payload: OpportunityCreate,
    authorization: Optional[str] = Header(None),
):
    user_id = await get_authenticated_user_id(authorization)
    db = get_database()
    user = await db["users"].find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if not is_recruiter_role(user.get("role")):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only recruiter accounts can publish opportunities.",
        )

    document = payload.model_dump()
    document["organization"] = payload.organization or user.get("companyName") or "Organization"
    document["createdBy"] = str(user_id)
    document["publishedAt"] = payload.publishedAt or document.get("publishedAt") or __import__("datetime").datetime.utcnow().isoformat()

    result = await db["opportunities"].insert_one(document)
    created_doc = await db["opportunities"].find_one({"_id": result.inserted_id})
    created_doc["_id"] = str(created_doc["_id"])
    return created_doc


@router.get("/", response_model=List[OpportunityResponse])
async def list_opportunities():
    db = get_database()
    cursor = db["opportunities"].find().sort("publishedAt", -1)
    opportunities = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        opportunities.append(doc)
    return opportunities