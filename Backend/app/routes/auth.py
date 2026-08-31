import json
import base64
from typing import Optional, Type, TypeVar
from fastapi import APIRouter, HTTPException, status, Header, UploadFile, File, Form
from pydantic import BaseModel, EmailStr, Field, ValidationError
from bson import ObjectId
import jwt

from app.database import get_database
from app.auth_utils import hash_password, verify_password, create_access_token
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

T = TypeVar("T", bound=BaseModel)

# --------------------------------------------------------------------------
# Pydantic Schemas
# --------------------------------------------------------------------------

class UserSignup(BaseModel):
    fullName: str
    email: EmailStr
    role: Optional[str] = "user"
    password: str
    acceptTerms: bool = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str = Field(..., alias="_id")
    fullName: Optional[str] = None
    email: EmailStr
    role: Optional[str] = "user"
    is_onboarded: bool = False

    class Config:
        populate_by_name = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class StudentOnboardingSchema(BaseModel):
    education: str
    degreeField: str
    semester: str
    skills: str
    interests: str
    location: str
    experience: str
    careerGoals: str

class RecruiterOnboardingSchema(BaseModel):
    companyName: str
    industry: str
    companySize: str
    companyWebsite: Optional[str] = None
    location: str
    contactName: str
    contactEmail: EmailStr
    hiringNeeds: str
    companyDescription: str
    useCase: str
    additionalDetails: Optional[dict] = Field(default_factory=dict)

class RecruiterProfileSchema(BaseModel):
    companyName: str
    industry: Optional[str] = None
    companySize: Optional[str] = None
    companyWebsite: Optional[str] = None
    location: Optional[str] = None
    contactName: Optional[str] = None
    contactEmail: Optional[EmailStr] = None
    hiringNeeds: Optional[str] = None
    companyDescription: Optional[str] = None
    useCase: Optional[str] = None
    additionalDetails: Optional[dict] = Field(default_factory=dict)

class RecentPostingSchema(BaseModel):
    title: str
    type: str
    applicants: int = 0
    status: str = "Active"

class RecruiterDashboardResponse(BaseModel):
    organizationName: str
    email: EmailStr
    industry: Optional[str] = None
    location: Optional[str] = None
    profileComplete: int = 0
    liveListings: int = 0
    applicants: int = 0
    shortlistRate: str = "0%"
    openTasks: int = 0
    recentPostings: list[RecentPostingSchema] = Field(default_factory=list)

# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------


def is_recruiter_role(role: Optional[str]) -> bool:
    if not role:
        return False

    normalized = str(role).strip().lower()
    recruiter_keywords = ("recruiter", "organization", "organisation", "company", "employer")
    return any(keyword in normalized for keyword in recruiter_keywords)


async def get_authenticated_user_id(authorization: Optional[str]) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token required"
        )

    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token required"
        )

    try:
        decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    user_id = decoded.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )

    return str(user_id)


async def validate_onboarding_payload(details: str, schema_cls: Type[T]) -> dict:
    try:
        details_dict = json.loads(details)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid onboarding details JSON: {str(exc)}"
        )

    try:
        validated = schema_cls(**details_dict)
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid onboarding details structure: {exc.errors()}"
        )

    field_data = validated.model_dump()
    for field, value in field_data.items():
        if value is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"The field '{field}' must be filled out."
            )

        if isinstance(value, str) and not value.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"The field '{field}' must be filled out or marked with an applicable option."
            )

    return field_data


async def process_cv_file(cv: Optional[UploadFile]) -> Optional[dict]:
    if not cv:
        return None

    allowed_extensions = (".pdf", ".doc", ".docx")
    filename = (cv.filename or "").lower()
    if not filename.endswith(allowed_extensions):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only PDF, DOC, and DOCX files are allowed."
        )

    file_bytes = await cv.read()
    max_file_size = 5 * 1024 * 1024
    if len(file_bytes) > max_file_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CV file size exceeds the 5MB maximum limit."
        )

    return {
        "filename": cv.filename,
        "content_type": cv.content_type,
        "size_bytes": len(file_bytes),
        "data_base64": base64.b64encode(file_bytes).decode("utf-8")
    }


async def get_recruiter_profile_data(user: dict) -> RecruiterProfileSchema:
    details = user.get("recruiter_onboarding_details") or {}
    payload = {
        "companyName": user.get("companyName") or details.get("companyName") or "",
        "industry": details.get("industry"),
        "companySize": details.get("companySize"),
        "companyWebsite": details.get("companyWebsite"),
        "location": details.get("location"),
        "contactName": details.get("contactName"),
        "contactEmail": details.get("contactEmail") or user.get("email"),
        "hiringNeeds": details.get("hiringNeeds"),
        "companyDescription": details.get("companyDescription"),
        "useCase": details.get("useCase"),
        "additionalDetails": details.get("additionalDetails") or {},
    }
    return RecruiterProfileSchema(**payload)


async def get_recruiter_dashboard_data(db, user: dict) -> RecruiterDashboardResponse:
    details = user.get("recruiter_onboarding_details") or {}
    opportunities_cursor = db["opportunities"].find({"createdBy": str(user["_id"])})
    recent_postings = []
    async for item in opportunities_cursor:
        recent_postings.append({
            "title": item.get("title") or "Role Title",
            "type": item.get("type") or item.get("category") or "Internship",
            "applicants": int(item.get("applicants") or 0),
            "status": (item.get("status") or "Active").title(),
        })

    live_listings = len(recent_postings)
    applicants_total = sum(int(item.get("applicants", 0)) for item in recent_postings)
    shortlisted = max(0, round((applicants_total * 0.64) / max(1, live_listings))) if live_listings else 0
    profile_fields = [
        details.get("companyName") or user.get("companyName"),
        details.get("industry"),
        details.get("companySize"),
        details.get("location"),
        details.get("contactName"),
        details.get("contactEmail") or user.get("email"),
        details.get("companyDescription"),
        details.get("useCase"),
    ]
    completed = sum(1 for value in profile_fields if value and str(value).strip())
    profile_complete = min(100, max(0, int((completed / len(profile_fields)) * 100))) if profile_fields else 0

    return RecruiterDashboardResponse(
        organizationName=user.get("companyName") or details.get("companyName") or "Your Organization",
        email=user.get("email"),
        industry=details.get("industry"),
        location=details.get("location"),
        profileComplete=profile_complete,
        liveListings=live_listings,
        applicants=applicants_total,
        shortlistRate=f"{min(99, max(0, shortlisted))}%",
        openTasks=max(0, 5 - min(4, live_listings)),
        recentPostings=[
            RecentPostingSchema(
                title=str(item.get("title") or "Role Title"),
                type=str(item.get("type") or "Internship"),
                applicants=int(item.get("applicants") or 0),
                status=str(item.get("status") or "Active"),
            )
            for item in recent_postings
        ],
    )


# --------------------------------------------------------------------------
# Authentication & Onboarding Routes
# --------------------------------------------------------------------------

@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: UserSignup):
    db = get_database()

    existing_user = await db["users"].find_one({"email": payload.email.lower()})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )

    hashed_pwd = hash_password(payload.password)
    user_doc = {
        "fullName": payload.fullName,
        "email": payload.email.lower(),
        "role": payload.role,
        "password": hashed_pwd,
        "acceptTerms": payload.acceptTerms,
        "is_onboarded": False,
    }

    result = await db["users"].insert_one(user_doc)
    created_user = await db["users"].find_one({"_id": result.inserted_id})
    created_user["_id"] = str(created_user["_id"])

    token = create_access_token(data={"sub": created_user["_id"], "email": created_user["email"]})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": created_user
    }


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin):
    db = get_database()

    user = await db["users"].find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    user["_id"] = str(user["_id"])

    if "is_onboarded" not in user:
        user["is_onboarded"] = False

    token = create_access_token(data={"sub": user["_id"], "email": user["email"]})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/student-onboarding", status_code=status.HTTP_200_OK)
async def complete_student_onboarding(
    details: str = Form(...),
    cv: Optional[UploadFile] = File(None),
    authorization: Optional[str] = Header(None)
):
    user_id = await get_authenticated_user_id(authorization)
    db = get_database()
    user = await db["users"].find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if is_recruiter_role(user.get("role")):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is for student accounts only."
        )

    field_data = await validate_onboarding_payload(details, StudentOnboardingSchema)
    cv_metadata = await process_cv_file(cv)

    update_data = {
        "is_onboarded": True,
        "student_onboarding_details": field_data,
        "role": user.get("role") or "Student / Researcher",
    }
    if cv_metadata:
        update_data["cv"] = cv_metadata

    result = await db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return {
        "message": "Student onboarding completed successfully",
        "is_onboarded": True,
        "role": user.get("role") or "Student / Researcher",
    }


@router.post("/recruiter-onboarding", status_code=status.HTTP_200_OK)
async def complete_recruiter_onboarding(
    details: str = Form(...),
    cv: Optional[UploadFile] = File(None),
    authorization: Optional[str] = Header(None)
):
    user_id = await get_authenticated_user_id(authorization)
    db = get_database()
    user = await db["users"].find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if not is_recruiter_role(user.get("role")):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is for recruiter accounts only."
        )

    field_data = await validate_onboarding_payload(details, RecruiterOnboardingSchema)
    cv_metadata = await process_cv_file(cv)

    update_data = {
        "is_onboarded": True,
        "companyName": field_data.get("companyName"),
        "recruiter_onboarding_details": field_data,
        "role": user.get("role") or "Recruiter / Organization",
    }
    if cv_metadata:
        update_data["cv"] = cv_metadata

    result = await db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return {
        "message": "Recruiter onboarding completed successfully",
        "is_onboarded": True,
        "role": user.get("role") or "Recruiter / Organization",
    }


@router.get("/recruiter/dashboard", response_model=RecruiterDashboardResponse)
async def recruiter_dashboard(authorization: Optional[str] = Header(None)):
    user_id = await get_authenticated_user_id(authorization)
    db = get_database()
    user = await db["users"].find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if not is_recruiter_role(user.get("role")):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Recruiter dashboard is only available to recruiter accounts."
        )

    return await get_recruiter_dashboard_data(db, user)


@router.get("/recruiter/profile", response_model=RecruiterProfileSchema)
async def recruiter_profile(authorization: Optional[str] = Header(None)):
    user_id = await get_authenticated_user_id(authorization)
    db = get_database()
    user = await db["users"].find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if not is_recruiter_role(user.get("role")):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Recruiter profile is only available to recruiter accounts."
        )

    return await get_recruiter_profile_data(user)


@router.put("/recruiter/profile", response_model=RecruiterProfileSchema)
async def update_recruiter_profile(
    payload: RecruiterProfileSchema,
    authorization: Optional[str] = Header(None)
):
    user_id = await get_authenticated_user_id(authorization)
    db = get_database()
    user = await db["users"].find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if not is_recruiter_role(user.get("role")):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Recruiter profile is only available to recruiter accounts."
        )

    profile_payload = payload.model_dump()
    update_data = {
        "companyName": payload.companyName,
        "recruiter_onboarding_details": profile_payload,
    }

    await db["users"].update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
    return payload