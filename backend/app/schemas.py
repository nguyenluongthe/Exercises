"""Pydantic schemas — định nghĩa cấu trúc dữ liệu request/response cho API."""
from typing import List, Optional
from pydantic import BaseModel, Field


# ---------- /predict ----------

class PredictRequest(BaseModel):
    text: str = Field(..., min_length=3, description="Mô tả bằng ngôn ngữ tự nhiên, ví dụ: 'tôi muốn tập cơ ngực với tạ đơn'")


class LabelScore(BaseModel):
    body_part: str
    confidence: float


class PredictResponse(BaseModel):
    input_text: str
    predicted_body_part: str
    confidence: float
    top_3: List[LabelScore]


# ---------- Exercise (dùng chung cho /recommend và /exercises) ----------

class ExerciseOut(BaseModel):
    id: str
    name: str
    name_vi: Optional[str] = None
    body_part: str
    equipment: str
    target: str
    muscle_group: str
    secondary_muscles: List[str]
    image: Optional[str] = None
    gif_url: Optional[str] = None
    instructions_en: Optional[str] = None
    instructions_vi: Optional[str] = None

class RecommendedExercise(ExerciseOut):
    similarity_score: float


# ---------- /recommend ----------

class RecommendRequest(BaseModel):
    text: str = Field(..., min_length=3, description="Mô tả nhu cầu tập luyện của người dùng")
    top_k: int = Field(default=5, ge=1, le=20, description="Số lượng bài tập muốn gợi ý")
    equipment: Optional[str] = Field(default=None, description="Lọc theo dụng cụ, ví dụ: 'body weight', 'dumbbell'")
    body_part: Optional[str] = Field(default=None, description="Lọc theo nhóm cơ, ví dụ: 'chest', 'back'")


class RecommendResponse(BaseModel):
    input_text: str
    results: List[RecommendedExercise]


# ---------- /exercises ----------

class ExerciseListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    results: List[ExerciseOut]


# ---------- Lỗi chung ----------

class ErrorResponse(BaseModel):
    detail: str
# ---------- Auth ----------

class UserCreate(BaseModel):
    email: str
    password: str = Field(..., min_length=6, description="Mật khẩu tối thiểu 6 ký tự")
    name: Optional[str] = None


class UserOut(BaseModel):
    id: int
    email: str
    name: Optional[str] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    
    
# ---------- Favorites ----------

class FavoriteCreate(BaseModel):
    exercise_id: str
    exercise_name: str


class FavoriteOut(BaseModel):
    id: int
    exercise_id: str
    exercise_name: str

    class Config:
        from_attributes = True


# ---------- Workout Log ----------

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