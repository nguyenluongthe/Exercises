"""
Pydantic Schemas cho Nhật ký tập luyện (WorkoutLog DTOs).
"""
from pydantic import BaseModel, Field


class WorkoutLogCreate(BaseModel):
    exercise_id: str
    exercise_name: str
    sets: int = Field(..., ge=1, le=50)
    reps: int = Field(..., ge=1, le=200)


class WorkoutLogOut(BaseModel):
    id: int
    exercise_id: str
    exercise_name: str
    sets: int
    reps: int
    logged_at: str

    class Config:
        from_attributes = True
