from pydantic import BaseModel, Field
from typing import Optional, List

class OpportunityBase(BaseModel):
    title: str
    organization: str
    type: str  # Fellowship, Internship, etc.
    location: str
    tags: List[str] = []

class OpportunityCreate(OpportunityBase):
    pass

class OpportunityResponse(OpportunityBase):
    id: str = Field(..., alias="_id")

    class Config:
        populate_by_name = True