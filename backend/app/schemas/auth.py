"""
Pydantic Schemas cho Xác thực & Tài khoản (Auth DTOs).
"""
from typing import Optional
from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    email: str
    password: str = Field(..., min_length=6, description="Mật khẩu tối thiểu 6 ký tự")
    name: Optional[str] = None


class UserOut(BaseModel):
    id: int
    email: str
    name: Optional[str] = None
    role: str = "user"
    age: Optional[int] = None
    gender: Optional[str] = "male"
    height: Optional[float] = None
    weight: Optional[float] = None
    fitness_goal: Optional[str] = "muscle_gain"
    experience_level: Optional[str] = "beginner"
    available_equipment: Optional[str] = "dumbbell"
    avoid_injury: Optional[str] = "none"
    fitness_score: Optional[int] = 70
    onboarding_completed: bool = False

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ErrorResponse(BaseModel):
    detail: str
