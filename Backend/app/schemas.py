from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional

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