"""Endpoint dành riêng cho quản trị viên — quản lý bài tập, xem thống kê hệ thống."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.db_models import User
from app.schemas import (
    ExerciseCreate, ExerciseUpdate, ExerciseOut, AdminStats,
)
from app.auth import get_current_admin
from app.ml_service import ml_service

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats", response_model=AdminStats, summary="Thống kê tổng quan hệ thống")
def get_stats(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return ml_service.get_admin_stats(db)


@router.post("/exercises", response_model=ExerciseOut, summary="Thêm bài tập mới")
def create_exercise(
    exercise_in: ExerciseCreate,
    current_admin: User = Depends(get_current_admin),
):
    new_exercise = ml_service.add_exercise(exercise_in.model_dump())
    return new_exercise


@router.put("/exercises/{exercise_id}", response_model=ExerciseOut, summary="Sửa bài tập")
def update_exercise(
    exercise_id: str,
    updates: ExerciseUpdate,
    current_admin: User = Depends(get_current_admin),
):
    updated = ml_service.update_exercise(exercise_id, updates.model_dump(exclude_unset=True))
    if updated is None:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy bài tập với id={exercise_id}")
    return updated


@router.delete("/exercises/{exercise_id}", summary="Xóa bài tập")
def delete_exercise(
    exercise_id: str,
    current_admin: User = Depends(get_current_admin),
):
    success = ml_service.delete_exercise(exercise_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy bài tập với id={exercise_id}")
    return {"detail": f"Đã xóa bài tập id={exercise_id}"}