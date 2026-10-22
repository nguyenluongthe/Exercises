"""
Endpoints dành cho Quản trị viên: Thống kê hệ thống & CRUD bài tập.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.schemas.admin import AdminStats
from app.schemas.exercise import ExerciseCreate, ExerciseUpdate, ExerciseOut
from app.services.admin_service import admin_service
from app.repositories.exercise_repo import exercise_repo
from app.api.deps import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats", response_model=AdminStats, summary="Thống kê tổng quan hệ thống")
def get_stats(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return admin_service.get_stats(db)


@router.post("/exercises", response_model=ExerciseOut, summary="Thêm bài tập mới")
def create_exercise(
    exercise_in: ExerciseCreate,
    current_admin: User = Depends(get_current_admin),
):
    return exercise_repo.add_exercise(exercise_in.model_dump())


@router.put("/exercises/{exercise_id}", response_model=ExerciseOut, summary="Cập nhật thông tin bài tập")
def update_exercise(
    exercise_id: str,
    updates: ExerciseUpdate,
    current_admin: User = Depends(get_current_admin),
):
    updated = exercise_repo.update_exercise(exercise_id, updates.model_dump(exclude_unset=True))
    if updated is None:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy bài tập với id={exercise_id}")
    return updated


@router.delete("/exercises/{exercise_id}", summary="Xóa bài tập khỏi hệ thống")
def delete_exercise(
    exercise_id: str,
    current_admin: User = Depends(get_current_admin),
):
    success = exercise_repo.delete_exercise(exercise_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy bài tập với id={exercise_id}")
    return {"detail": f"Đã xóa bài tập id={exercise_id}"}
