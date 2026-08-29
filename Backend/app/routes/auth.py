from fastapi import APIRouter, HTTPException, status
from app.database import get_database
from app.schemas import UserSignup, UserLogin, TokenResponse
from app.auth_utils import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

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
    
    # Hash password and prepare user document
    hashed_pwd = hash_password(payload.password)
    user_doc = {
        "fullName": payload.fullName,
        "email": payload.email.lower(),
        "role": payload.role,
        "password": hashed_pwd,
        "acceptTerms": payload.acceptTerms,
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
    token = create_access_token(data={"sub": user["_id"], "email": user["email"]})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }