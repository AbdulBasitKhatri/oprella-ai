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