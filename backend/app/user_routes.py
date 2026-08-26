"""Endpoint cho Favorites, Workout Log, User Profile (Onboarding) & Adaptive Daily Workout."""
from typing import List, Optional, Tuple
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.db_models import User, Favorite, WorkoutLog
from app.schemas import (
    FavoriteCreate, FavoriteOut,
    WorkoutLogCreate, WorkoutLogOut,
    UserProfileUpdate, UserProfileOut,
    DailyAdaptiveWorkout, ExerciseOut
)
from app.auth import get_current_user
from app.ml_service import ml_service

router = APIRouter(tags=["User Data"])


def compute_bmi_and_category(height_cm: Optional[float], weight_kg: Optional[float]) -> Tuple[Optional[float], Optional[str]]:
    if not height_cm or not weight_kg or height_cm <= 0 or weight_kg <= 0:
        return None, None
    height_m = height_cm / 100.0
    bmi = round(weight_kg / (height_m * height_m), 1)
    if bmi < 18.5:
        category = "Gầy / Thiếu cân (Underweight)"
    elif bmi < 24.9:
        category = "Cân đối / Chuẩn (Normal)"
    elif bmi < 29.9:
        category = "Thừa cân (Overweight)"
    else:
        category = "Béo phì (Obese)"
    return bmi, category


# ---------- User Profile & Onboarding (FR-002, FR-004 SRS) ----------

@router.get("/user/profile", response_model=UserProfileOut, summary="Xem hồ sơ thể lực và chỉ số cá nhân")
def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    bmi, bmi_category = compute_bmi_and_category(current_user.height, current_user.weight)
    
    # Tính Daily Readiness Score dựa trên hồ sơ & lịch sử tập gần nhất (FR-010 SRS)
    recent_logs_count = db.query(WorkoutLog).filter(WorkoutLog.user_id == current_user.id).count()
    readiness = min(98, max(60, 85 + (5 if recent_logs_count > 0 else 0) - (2 if (current_user.age or 25) > 50 else 0)))

    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "age": current_user.age,
        "gender": current_user.gender or "male",
        "height": current_user.height,
        "weight": current_user.weight,
        "bmi": bmi,
        "bmi_category": bmi_category,
        "fitness_goal": current_user.fitness_goal or "muscle_gain",
        "experience_level": current_user.experience_level or "beginner",
        "available_equipment": current_user.available_equipment or "dumbbell",
        "avoid_injury": current_user.avoid_injury or "none",
        "fitness_score": current_user.fitness_score or 70,
        "daily_readiness_score": readiness,
        "onboarding_completed": bool(current_user.onboarding_completed),
    }


@router.put("/user/profile", response_model=UserProfileOut, summary="Cập nhật hồ sơ thể lực (Onboarding & Sửa)")
def update_user_profile(
    profile_in: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if profile_in.name is not None:
        current_user.name = profile_in.name
    if profile_in.age is not None:
        current_user.age = profile_in.age
    if profile_in.gender is not None:
        current_user.gender = profile_in.gender
    if profile_in.height is not None:
        current_user.height = profile_in.height
    if profile_in.weight is not None:
        current_user.weight = profile_in.weight
    if profile_in.fitness_goal is not None:
        current_user.fitness_goal = profile_in.fitness_goal
    if profile_in.experience_level is not None:
        current_user.experience_level = profile_in.experience_level
    if profile_in.available_equipment is not None:
        current_user.available_equipment = profile_in.available_equipment
    if profile_in.avoid_injury is not None:
        current_user.avoid_injury = profile_in.avoid_injury
    if profile_in.onboarding_completed is not None:
        current_user.onboarding_completed = profile_in.onboarding_completed

    # Tính toán Baseline FitnessScore™ (FR-004 SRS)
    bmi, bmi_category = compute_bmi_and_category(current_user.height, current_user.weight)
    base_score = 75
    if bmi:
        deviation = abs(bmi - 22.0)
        base_score = max(50, int(base_score - deviation * 1.5))
    if current_user.experience_level == "intermediate":
        base_score += 8
    elif current_user.experience_level == "advanced":
        base_score += 15
    current_user.fitness_score = min(98, max(50, base_score))

    db.commit()
    db.refresh(current_user)

    return get_user_profile(current_user=current_user, db=db)


# ---------- AI Adaptive Daily Workout (FR-005, FR-006 SRS) ----------

@router.get("/adaptive/daily-workout", response_model=DailyAdaptiveWorkout, summary="Tạo buổi tập đề xuất thích nghi hôm nay")
def get_daily_adaptive_workout(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    goal = current_user.fitness_goal or "muscle_gain"
    equipment = (current_user.available_equipment or "dumbbell").lower()
    injury = (current_user.avoid_injury or "none").lower()

    # Xác định nhóm cơ mục tiêu theo mục tiêu tập luyện
    if goal == "weight_loss":
        routine_title = "Fat Burn & Full Body Tone"
        routine_title_vi = "Đốt Mỡ & Săn Chắc Toàn Thân"
        target_body_parts = ["cardio", "waist", "upper legs"]
    elif goal == "endurance":
        routine_title = "Cardio & Core Endurance"
        routine_title_vi = "Sức Bền & Thể Lực Tim Mạch"
        target_body_parts = ["cardio", "waist", "back"]
    elif goal == "recovery":
        routine_title = "Active Recovery & Mobility"
        routine_title_vi = "Phục Hồi Chủ Động & Giãn Cơ"
        target_body_parts = ["back", "waist", "neck"]
    else:  # muscle_gain / strength
        routine_title = "Chest, Arms & Core Hypertrophy"
        routine_title_vi = "Tăng Cơ Ngực, Tay & Cơ Lõi"
        target_body_parts = ["chest", "upper arms", "waist"]

    # Lọc bài tập từ Dataset
    df = ml_service.exercises_df.copy() if ml_service.is_loaded else None
    exercises = []

    if df is not None and not df.empty:
        # Lọc theo nhóm cơ mục tiêu
        filtered = df[df["body_part"].isin(target_body_parts)].copy()

        # Lọc theo dụng cụ nếu người dùng chỉ có body weight hoặc dumbbell
        if equipment in ["body_weight", "body weight"]:
            filtered = filtered[filtered["equipment"].isin(["body weight", "body only", "assisted"])]
        elif equipment in ["dumbbell"]:
            filtered = filtered[filtered["equipment"].isin(["dumbbell", "body weight"])]
        elif equipment in ["band", "bands"]:
            filtered = filtered[filtered["equipment"].isin(["band", "body weight"])]

        # Loại bỏ vùng chấn thương
        if injury == "knee":
            filtered = filtered[~filtered["target"].str.contains("quads|knee", case=False, na=False)]
        elif injury == "lower_back":
            filtered = filtered[~filtered["target"].str.contains("lower back|spine", case=False, na=False)]
        elif injury == "shoulder":
            filtered = filtered[~filtered["body_part"].str.contains("shoulder", case=False, na=False)]

        if filtered.empty:
            filtered = df.head(5)

        # Lấy 5 bài tập phân bổ đều các nhóm cơ
        sample_df = filtered.sample(n=min(5, len(filtered)), random_state=42) if len(filtered) > 5 else filtered

        for _, row in sample_df.iterrows():
            exercises.append({
                "id": row["id"],
                "name": row["name"],
                "name_vi": row["name_vi"],
                "body_part": row["body_part"],
                "equipment": row["equipment"],
                "target": row["target"],
                "muscle_group": row["muscle_group"],
                "secondary_muscles": row["secondary_muscles"],
                "image": row["image"],
                "gif_url": row["gif_url"],
                "instructions_en": row["instructions_en"],
                "instructions_vi": row["instructions_vi"],
            })

    return {
        "routine_title": routine_title,
        "routine_title_vi": routine_title_vi,
        "focus_goal": goal,
        "target_body_parts": target_body_parts,
        "readiness_score": 88,
        "readiness_status": "Optimal for Training",
        "readiness_status_vi": "Thể trạng tối ưu sẵn sàng tập luyện",
        "exercises": exercises,
    }


# ---------- Favorites ----------

@router.post("/favorites", response_model=FavoriteOut, summary="Lưu 1 bài tập vào danh sách yêu thích")
def add_favorite(
    fav_in: FavoriteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.exercise_id == fav_in.exercise_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bài tập này đã có trong danh sách yêu thích")

    new_fav = Favorite(
        user_id=current_user.id,
        exercise_id=fav_in.exercise_id,
        exercise_name=fav_in.exercise_name,
    )
    db.add(new_fav)
    db.commit()
    db.refresh(new_fav)
    return new_fav


@router.get("/favorites", response_model=List[FavoriteOut], summary="Xem danh sách bài tập yêu thích")
def list_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Favorite).filter(Favorite.user_id == current_user.id).all()


@router.delete("/favorites/{exercise_id}", summary="Bỏ yêu thích 1 bài tập")
def remove_favorite(
    exercise_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    fav = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.exercise_id == exercise_id,
    ).first()
    if not fav:
        raise HTTPException(status_code=404, detail="Không tìm thấy trong danh sách yêu thích")

    db.delete(fav)
    db.commit()
    return {"detail": "Đã xóa khỏi danh sách yêu thích"}


# ---------- Workout Log ----------

@router.post("/workout-logs", response_model=WorkoutLogOut, summary="Ghi lại 1 lần tập luyện")
def add_workout_log(
    log_in: WorkoutLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_log = WorkoutLog(
        user_id=current_user.id,
        exercise_id=log_in.exercise_id,
        exercise_name=log_in.exercise_name,
        sets=log_in.sets,
        reps=log_in.reps,
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return {
        "id": new_log.id,
        "exercise_id": new_log.exercise_id,
        "exercise_name": new_log.exercise_name,
        "sets": new_log.sets,
        "reps": new_log.reps,
        "logged_at": new_log.logged_at.strftime("%Y-%m-%d %H:%M") if new_log.logged_at else "",
    }


@router.get("/workout-logs", response_model=List[WorkoutLogOut], summary="Xem lịch sử tập luyện")
def list_workout_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    logs = (
        db.query(WorkoutLog)
        .filter(WorkoutLog.user_id == current_user.id)
        .order_by(WorkoutLog.logged_at.desc())
        .all()
    )
    # Chuyển datetime thành string để khớp schema (tránh lỗi serialize)
    return [
        {
            "id": log.id,
            "exercise_id": log.exercise_id,
            "exercise_name": log.exercise_name,
            "sets": log.sets,
            "reps": log.reps,
            "logged_at": log.logged_at.strftime("%Y-%m-%d %H:%M"),
        }
        for log in logs
    ]