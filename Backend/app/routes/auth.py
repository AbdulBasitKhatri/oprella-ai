import json
import base64
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Header, UploadFile, File, Form
from pydantic import BaseModel, EmailStr, Field
from bson import ObjectId
import jwt

from app.database import get_database
from app.auth_utils import hash_password, verify_password, create_access_token
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

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

class OnboardingPayload(BaseModel):
    companyName: Optional[str] = None
    industry: Optional[str] = None
    useCase: Optional[str] = None
    additionalDetails: Optional[dict] = Field(default_factory=dict)

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

# --------------------------------------------------------------------------
# Authentication & Onboarding Routes
# --------------------------------------------------------------------------

@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: UserSignup):
    db = get_database()
    
    # Check if email already exists
    existing_user = await db["users"].find_one({"email": payload.email.lower()})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Hash password and prepare user document with default onboarding status
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
    
    # Generate JWT token
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
    
    # Guarantee fallback if user document was created before onboarding field existed
    if "is_onboarded" not in user:
        user["is_onboarded"] = False

    token = create_access_token(data={"sub": user["_id"], "email": user["email"]})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/onboarding", status_code=status.HTTP_200_OK)
async def complete_onboarding(
    details: str = Form(...),
    cv: Optional[UploadFile] = File(None),
    authorization: Optional[str] = Header(None)
):
    # 1. Authorization Header Verification
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token required"
        )
    
    token = authorization.split(" ")[1]
    try:
        decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = decoded.get("sub")
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    # 2. Parse and Validate Form Payload
    try:
        details_dict = json.loads(details)
        validated_details = StudentOnboardingSchema(**details_dict)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid onboarding details structure: {str(e)}"
        )

    # 3. Ensure NO empty fields exist
    field_data = validated_details.model_dump()
    for field, val in field_data.items():
        if not val or not str(val).strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"The field '{field}' must be filled out or marked with an applicable option."
            )

    # 4. Handle CV File Processing & Server Validation
    cv_metadata = None
    if cv:
        allowed_extensions = (".pdf", ".doc", ".docx")
        if not cv.filename.lower().endswith(allowed_extensions):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Only PDF, DOC, and DOCX files are allowed."
            )
        
        file_bytes = await cv.read()
        max_file_size = 5 * 1024 * 1024  # 5MB
        if len(file_bytes) > max_file_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CV file size exceeds the 5MB maximum limit."
            )

        # Store file in base64 format for MongoDB or save to disk/S3 as needed
        cv_metadata = {
            "filename": cv.filename,
            "content_type": cv.content_type,
            "size_bytes": len(file_bytes),
            "data_base64": base64.b64encode(file_bytes).decode("utf-8")
        }

    # 5. Database Update
    db = get_database()
    update_data = {
        "is_onboarded": True,
        "onboarding_details": field_data,
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
        "message": "Onboarding completed successfully",
        "is_onboarded": True
    }