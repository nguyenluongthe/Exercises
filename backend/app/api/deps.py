"""
FastAPI Dependencies: xác thực quyền truy cập và kiểm tra trạng thái model.
"""
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import oauth2_scheme, decode_access_token
from app.models.user import User
from app.repositories.user_repo import user_repo
from app.services.ml_service import ml_service


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception

    user = user_repo.get_by_email(db, email)
    if user is None:
        raise credentials_exception
    return user


def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ quản trị viên mới có quyền truy cập chức năng này.",
        )
    return current_user


def ensure_model_loaded():
    if not ml_service.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Model chưa sẵn sàng. Vui lòng chạy `python train_model.py` để tạo "
                "các file model trong thư mục models/ rồi khởi động lại server."
            ),
        )
