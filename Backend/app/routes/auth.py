import json
import base64
from typing import Optional, Type, TypeVar
from fastapi import APIRouter, HTTPException, status, Header, UploadFile, File, Form
from pydantic import BaseModel, EmailStr, Field, ValidationError, field_validator
from bson import ObjectId
import jwt
import httpx
from pypdf import PdfReader
from docx import Document

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

class PasswordChangeSchema(BaseModel):
    currentPassword: str
    newPassword: str = Field(..., min_length=6)
    confirmNewPassword: str

    @field_validator("confirmNewPassword")
    @classmethod
    def passwords_match(cls, value, values):
        if "newPassword" in values.data and value != values.data["newPassword"]:
            raise ValueError("New passwords do not match")
        return value

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

class StudentProfileSchema(BaseModel):
    fullName: Optional[str] = None
    email: Optional[EmailStr] = None
    education: Optional[str] = None
    degreeField: Optional[str] = None
    semester: Optional[str] = None
    skills: Optional[list[str]] = Field(default_factory=list)
    interests: Optional[str] = None
    location: Optional[str] = None
    experience: Optional[str] = None
    careerGoals: Optional[str] = None
    cvFileName: Optional[str] = None

    @field_validator("skills", mode="before")
    @classmethod
    def normalize_skills(cls, value):
        if value is None:
            return []
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]
        return value

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


async def extract_cv_text(cv: UploadFile) -> str:
    file_bytes = await cv.read()
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail='CV file size exceeds the 5MB maximum limit.')
    filename = (cv.filename or '').lower()
    try:
        if filename.endswith('.pdf'):
            from io import BytesIO
            reader = PdfReader(BytesIO(file_bytes))
            return '\n'.join(page.extract_text() or '' for page in reader.pages)[:30000]
        if filename.endswith('.docx'):
            from io import BytesIO
            document = Document(BytesIO(file_bytes))
            return '\n'.join(paragraph.text for paragraph in document.paragraphs)[:30000]
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f'Unable to read CV content: {exc}')
    raise HTTPException(status_code=400, detail='AI import supports PDF and DOCX files. Please use manual entry for DOC files.')


async def parse_cv_with_ai(text: str) -> dict:
    empty = {
        'education': '', 'degreeField': '', 'semester': '', 'skills': '',
        'interests': '', 'location': '', 'experience': '', 'careerGoals': '',
    }
    if not text.strip() or not settings.GEMINI_API_KEY:
        return empty
    prompt = ('Extract a student profile from this CV. Return JSON only with exactly these string keys: '
        'education, degreeField, semester, skills, interests, location, experience, careerGoals. '
        'Use comma-separated skills and interests. Use "Not specified" when the CV does not provide a value. '
        'Keep experience and careerGoals concise. CV TEXT:\n' + text)
    url = f'https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent'
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(url, params={'key': settings.GEMINI_API_KEY}, json={
                'contents': [{'parts': [{'text': prompt}]}],
                'generationConfig': {'responseMimeType': 'application/json'},
            })
            response.raise_for_status()
            raw = response.json()['candidates'][0]['content']['parts'][0]['text']
            parsed = json.loads(raw)
            return {key: str(parsed.get(key) or 'Not specified') for key in empty}
    except Exception:
        return empty


def get_student_onboarding_details(user: dict) -> dict:
    if user.get("student_onboarding_details") is not None:
        return user.get("student_onboarding_details") or {}
    if user.get("onboarding_details") is not None:
        return user.get("onboarding_details") or {}
    return {}


async def get_student_profile_data(user: dict) -> StudentProfileSchema:
    details = get_student_onboarding_details(user)
    cv_data = user.get("cv") or {}
    payload = {
        "fullName": user.get("fullName") or details.get("fullName"),
        "email": user.get("email"),
        "education": details.get("education"),
        "degreeField": details.get("degreeField"),
        "semester": details.get("semester"),
        "skills": details.get("skills") or [],
        "interests": details.get("interests"),
        "location": details.get("location"),
        "experience": details.get("experience"),
        "careerGoals": details.get("careerGoals"),
        "cvFileName": cv_data.get("filename") if isinstance(cv_data, dict) else None,
    }
    return StudentProfileSchema(**payload)


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
            "status": "Active" if str(item.get("status") or "active").lower() == "draft" else str(item.get("status") or "Active").title(),
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
        "onboarding_details": field_data,
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


@router.post('/student-onboarding/import-cv')
async def import_student_cv(cv: UploadFile = File(...), authorization: Optional[str] = Header(None)):
    user_id = await get_authenticated_user_id(authorization)
    db = get_database()
    user = await db['users'].find_one({'_id': ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='User not found')
    if is_recruiter_role(user.get('role')):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='This endpoint is for student accounts only.')
    filename = (cv.filename or '').lower()
    if not filename.endswith(('.pdf', '.docx')):
        raise HTTPException(status_code=400, detail='AI import supports PDF and DOCX files.')
    if cv.size and cv.size > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail='CV file size exceeds the 5MB maximum limit.')
    text = await extract_cv_text(cv)
    return {'fields': await parse_cv_with_ai(text)}


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


@router.get("/student/profile", response_model=StudentProfileSchema)
async def student_profile(authorization: Optional[str] = Header(None)):
    user_id = await get_authenticated_user_id(authorization)
    db = get_database()
    user = await db["users"].find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if is_recruiter_role(user.get("role")):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Student profile is only available to student accounts."
        )

    return await get_student_profile_data(user)


@router.put("/student/profile", response_model=StudentProfileSchema)
async def update_student_profile(
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
            detail="Access denied. Student profile is only available to student accounts."
        )

    try:
        details_dict = json.loads(details)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid student profile JSON: {str(exc)}"
        )

    payload = StudentProfileSchema.model_validate(details_dict)
    cv_metadata = await process_cv_file(cv)

    student_details = {
        "education": payload.education,
        "degreeField": payload.degreeField,
        "semester": payload.semester,
        "skills": payload.skills or [],
        "interests": payload.interests,
        "location": payload.location,
        "experience": payload.experience,
        "careerGoals": payload.careerGoals,
    }

    update_data = {
        "fullName": payload.fullName or user.get("fullName"),
        "email": payload.email.lower() if payload.email else user.get("email"),
        "student_onboarding_details": student_details,
        "onboarding_details": student_details,
    }

    if cv_metadata:
        update_data["cv"] = cv_metadata

    await db["users"].update_one({"_id": ObjectId(user_id)}, {"$set": update_data})

    response_payload = {
        "fullName": payload.fullName or user.get("fullName"),
        "email": payload.email or user.get("email"),
        "education": payload.education,
        "degreeField": payload.degreeField,
        "semester": payload.semester,
        "skills": payload.skills or [],
        "interests": payload.interests,
        "location": payload.location,
        "experience": payload.experience,
        "careerGoals": payload.careerGoals,
        "cvFileName": cv_metadata.get("filename") if cv_metadata else (user.get("cv") or {}).get("filename"),
    }
    return StudentProfileSchema(**response_payload)


@router.get("/student/saved-opportunities")
async def get_student_saved_opportunities(authorization: Optional[str] = Header(None)):
    user_id = await get_authenticated_user_id(authorization)
    db = get_database()
    user = await db["users"].find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if is_recruiter_role(user.get("role")):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Saved opportunities are only available to student accounts."
        )

    saved = user.get("savedOpportunities") or []
    return {"savedOpportunityIds": [str(item) for item in saved]}


@router.post("/student/saved-opportunities/{opportunity_id}")
async def save_student_opportunity(opportunity_id: str, authorization: Optional[str] = Header(None)):
    user_id = await get_authenticated_user_id(authorization)
    db = get_database()
    user = await db["users"].find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if is_recruiter_role(user.get("role")):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Saved opportunities are only available to student accounts."
        )

    saved = user.get("savedOpportunities") or []
    item_id = str(opportunity_id)
    if item_id not in saved:
        saved.append(item_id)
        await db["users"].update_one({"_id": ObjectId(user_id)}, {"$set": {"savedOpportunities": saved}})

    return {"savedOpportunityIds": [str(item) for item in saved]}


@router.delete("/student/saved-opportunities/{opportunity_id}")
async def unsave_student_opportunity(opportunity_id: str, authorization: Optional[str] = Header(None)):
    user_id = await get_authenticated_user_id(authorization)
    db = get_database()
    user = await db["users"].find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if is_recruiter_role(user.get("role")):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Saved opportunities are only available to student accounts."
        )

    saved = [str(item) for item in (user.get("savedOpportunities") or [])]
    item_id = str(opportunity_id)
    updated = [item for item in saved if item != item_id]
    await db["users"].update_one({"_id": ObjectId(user_id)}, {"$set": {"savedOpportunities": updated}})
    return {"savedOpportunityIds": updated}


@router.delete("/student/delete-account")
async def delete_student_account(authorization: Optional[str] = Header(None)):
    user_id = await get_authenticated_user_id(authorization)
    db = get_database()
    user = await db["users"].find_one({"_id": ObjectId(user_id)})

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if is_recruiter_role(user.get("role")):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Student account deletion is only for student accounts."
        )

    await db["users"].delete_one({"_id": ObjectId(user_id)})
    return {"message": "Student account deleted successfully"}


@router.delete("/recruiter/delete-account")
async def delete_recruiter_account(authorization: Optional[str] = Header(None)):
    user_id = await get_authenticated_user_id(authorization)
    db = get_database()
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if not is_recruiter_role(user.get("role")):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account deletion is only available to recruiter accounts.")
    await db["opportunities"].delete_many({"createdBy": user_id})
    await db["applications"].delete_many({"recruiterId": user_id})
    await db["users"].delete_one({"_id": ObjectId(user_id)})
    return {"message": "Recruiter account deleted successfully"}


@router.put("/change-password")
async def change_password(payload: PasswordChangeSchema, authorization: Optional[str] = Header(None)):
    user_id = await get_authenticated_user_id(authorization)
    db = get_database()
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if not verify_password(payload.currentPassword, user.get("password", "")):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect.")
    if payload.currentPassword == payload.newPassword:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password must be different from the current password.")
    await db["users"].update_one({"_id": ObjectId(user_id)}, {"$set": {"password": hash_password(payload.newPassword)}})
    return {"message": "Password changed successfully"}


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