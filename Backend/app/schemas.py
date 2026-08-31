from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List

# Signup Schema matching frontend payload exactly
class UserSignup(BaseModel):
    fullName: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    role: str
    password: str = Field(..., min_length=6)
    confirmPassword: str
    acceptTerms: bool

    @field_validator("confirmPassword")
    def passwords_match(cls, v, values):
        if "password" in values.data and v != values.data["password"]:
            raise ValueError("Passwords do not match")
        return v

    @field_validator("acceptTerms")
    def terms_must_be_accepted(cls, v):
        if not v:
            raise ValueError("Terms of Service must be accepted")
        return v

# Login Schema
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Response Schema returned on successful signup/login
class UserResponse(BaseModel):
    id: str = Field(..., alias="_id")
    fullName: str
    email: EmailStr
    role: str

    class Config:
        populate_by_name = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class OpportunityCreate(BaseModel):
    title: str
    organization: str
    category: str = "INTERNSHIP"
    type: str = "PAID"
    location: str
    remoteType: Optional[str] = "Hybrid"
    applicationDeadline: Optional[str] = None
    startDate: Optional[str] = None
    startTime: Optional[str] = None
    durationDays: Optional[int] = None
    workDays: Optional[str] = None
    timezone: Optional[str] = "UTC"
    applicationUrl: Optional[str] = None
    description: str
    requiredSkills: List[str] = Field(default_factory=list)
    eligibility: Optional[str] = None
    stipendAmount: Optional[float] = None
    stipendCurrency: str = "PKR"
    stipendPeriod: str = "MONTHLY"
    stipend: Optional[str] = None
    status: str = "draft"
    createdBy: Optional[str] = None
    publishedAt: Optional[str] = None

    @field_validator("category", "type", "stipendCurrency", "stipendPeriod", mode="before")
    @classmethod
    def normalize_enums(cls, value):
        if value is None:
            return value
        return str(value).strip().upper()

    @field_validator("stipend", mode="before")
    @classmethod
    def normalize_stipend(cls, value, info):
        if value is not None:
            return str(value).strip() or None

        amount = info.data.get("stipendAmount")
        currency = info.data.get("stipendCurrency", "PKR")
        period = info.data.get("stipendPeriod", "MONTHLY")

        if amount is None:
            return None

        period_label = period.replace("_", " ").title()
        if period == "ONE_TIME":
            period_label = "One-time"
        if period == "PER_PROJECT":
            period_label = "Per project"

        return f"{currency} {amount} / {period_label}"

    @field_validator("requiredSkills", mode="before")
    @classmethod
    def parse_skills(cls, value):
        if value is None:
            return []
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]
        return value


class OpportunityResponse(OpportunityCreate):
    id: str = Field(..., alias="_id")

    class Config:
        populate_by_name = True