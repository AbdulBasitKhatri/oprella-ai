from fastapi import APIRouter, HTTPException, status
from app.database import get_database
from app.schemas import OpportunityCreate, OpportunityResponse
from typing import List

router = APIRouter(prefix="/opportunities", tags=["Opportunities"])

@router.post("/", response_model=OpportunityResponse, status_code=status.HTTP_201_CREATED)
async def create_opportunity(payload: OpportunityCreate):
    db = get_database()
    document = payload.model_dump()
    result = await db["opportunities"].insert_one(document)
    
    created_doc = await db["opportunities"].find_one({"_id": result.inserted_id})
    created_doc["_id"] = str(created_doc["_id"])
    return created_doc

@router.get("/", response_model=List[OpportunityResponse])
async def list_opportunities():
    db = get_database()
    cursor = db["opportunities"].find()
    opportunities = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        opportunities.append(doc)
    return opportunities