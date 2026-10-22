"""
Pydantic Schemas cho Bài tập yêu thích (Favorite DTOs).
"""
from pydantic import BaseModel


class FavoriteCreate(BaseModel):
    exercise_id: str
    exercise_name: str


class FavoriteOut(BaseModel):
    id: int
    exercise_id: str
    exercise_name: str

    class Config:
        from_attributes = True
