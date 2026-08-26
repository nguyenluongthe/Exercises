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
    confidence_level: str = "medium"  # "high" (>= 0.70), "medium" (0.45 - 0.70), "low" (< 0.45)
    interpreted_keywords: List[str] = []
    clarification_needed: bool = False
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
    match_score: float = 0.0
    match_level: str = "medium"  # "high", "medium", "low"


# ---------- /recommend ----------

class RecommendRequest(BaseModel):
    text: str = Field(..., min_length=3, description="Mô tả nhu cầu tập luyện của người dùng")
    top_k: int = Field(default=5, ge=1, le=20, description="Số lượng bài tập muốn gợi ý")
    equipment: Optional[str] = Field(default=None, description="Lọc theo dụng cụ, ví dụ: 'body weight', 'dumbbell'")
    body_part: Optional[str] = Field(default=None, description="Lọc theo nhóm cơ, ví dụ: 'chest', 'back'")


class RecommendResponse(BaseModel):
    input_text: str
    interpreted_keywords: List[str] = []
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


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = Field(default=None, ge=10, le=100)
    gender: Optional[str] = "male"
    height: Optional[float] = Field(default=None, ge=50, le=250)
    weight: Optional[float] = Field(default=None, ge=20, le=300)
    fitness_goal: Optional[str] = "muscle_gain"  # muscle_gain, weight_loss, endurance, recovery
    experience_level: Optional[str] = "beginner"  # beginner, intermediate, advanced
    available_equipment: Optional[str] = "dumbbell"  # body_weight, dumbbell, full_gym, bands
    avoid_injury: Optional[str] = "none"  # none, knee, lower_back, shoulder, wrist
    onboarding_completed: Optional[bool] = True


class UserProfileOut(BaseModel):
    user_id: int
    email: str
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = "male"
    height: Optional[float] = None
    weight: Optional[float] = None
    bmi: Optional[float] = None
    bmi_category: Optional[str] = None
    fitness_goal: str = "muscle_gain"
    experience_level: str = "beginner"
    available_equipment: str = "dumbbell"
    avoid_injury: str = "none"
    fitness_score: int = 70
    daily_readiness_score: int = 85
    onboarding_completed: bool = False


class DailyAdaptiveWorkout(BaseModel):
    routine_title: str
    routine_title_vi: str
    focus_goal: str
    target_body_parts: List[str]
    readiness_score: int
    readiness_status: str
    readiness_status_vi: str
    exercises: List[ExerciseOut]


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
        # ---------- Admin ----------

class AdminStats(BaseModel):
    total_users: int
    total_exercises: int
    total_favorites: int
    total_workout_logs: int
    most_favorited_exercises: List[dict]
    weekly_searches: List[dict]
    monthly_new_users: List[dict]

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