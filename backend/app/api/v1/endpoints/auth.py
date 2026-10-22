"""
Endpoints xử lý xác thực: đăng ký, đăng nhập, lấy thông tin cá nhân.
"""
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import UserCreate, UserOut, Token
from app.services.auth_service import auth_service
from app.api.deps import get_current_user

router = APIRouter(tags=["Auth"])


@router.post("/register", response_model=UserOut, summary="Đăng ký tài khoản mới")
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    return auth_service.register(db, user_in)


@router.post("/login", response_model=Token, summary="Đăng nhập, nhận về JWT access token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth_service.authenticate(db, form_data.username, form_data.password)
    return auth_service.create_user_token(user)


@router.get("/me", response_model=UserOut, summary="Xem thông tin tài khoản hiện tại")
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
