"""
Pydantic Schemas cho bài tập (Exercise DTOs).
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class ExerciseOut(BaseModel):
    id: str
    name: str
    name_vi: Optional[str] = None
    body_part: str
    equipment: str
    target: str
    muscle_group: str
    secondary_muscles: List[str] = []
    image: Optional[str] = None
    gif_url: Optional[str] = None
    instructions_en: Optional[str] = None
    instructions_vi: Optional[str] = None


class RecommendedExercise(ExerciseOut):
    similarity_score: float
    match_score: float = 0.0
    match_level: str = "medium"  # "high", "medium", "low"


class RecommendRequest(BaseModel):
    text: str = Field(..., min_length=3, description="Mô tả nhu cầu tập luyện của người dùng")
    top_k: int = Field(default=5, ge=1, le=20, description="Số lượng bài tập muốn gợi ý")
    equipment: Optional[str] = Field(default=None, description="Lọc theo dụng cụ, ví dụ: 'body weight', 'dumbbell'")
    body_part: Optional[str] = Field(default=None, description="Lọc theo nhóm cơ, ví dụ: 'chest', 'back'")


class RecommendResponse(BaseModel):
    input_text: str
    interpreted_keywords: List[str] = []
    results: List[RecommendedExercise]


class ExerciseListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    results: List[ExerciseOut]


class ExerciseCreate(BaseModel):
    name: str
    body_part: str
    equipment: str
    target: str = ""
    muscle_group: str = ""
    secondary_muscles: List[str] = []
    instructions_en: str = ""
    image: Optional[str] = ""
    gif_url: Optional[str] = ""


class ExerciseUpdate(BaseModel):
    name: Optional[str] = None
    body_part: Optional[str] = None
    equipment: Optional[str] = None
    target: Optional[str] = None
    muscle_group: Optional[str] = None
    secondary_muscles: Optional[List[str]] = None
    instructions_en: Optional[str] = None
    image: Optional[str] = None
    gif_url: Optional[str] = None
