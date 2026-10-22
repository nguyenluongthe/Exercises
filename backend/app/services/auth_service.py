"""
Auth Service - Quản lý đăng ký, đăng nhập và xác thực tài khoản.
"""
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.auth import UserCreate, Token
from app.repositories.user_repo import user_repo
from app.core.security import hash_password, verify_password, create_access_token


class AuthService:
    def register(self, db: Session, user_in: UserCreate) -> User:
        existing = user_repo.get_by_email(db, user_in.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email đã được sử dụng")

        new_user = User(
            email=user_in.email,
            hashed_password=hash_password(user_in.password),
            name=user_in.name,
        )
        return user_repo.create(db, new_user)

    def authenticate(self, db: Session, email: str, password: str) -> User:
        user = user_repo.get_by_email(db, email)
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email hoặc mật khẩu không đúng",
            )
        return user

    def create_user_token(self, user: User) -> Token:
        access_token = create_access_token(data={"sub": user.email})
        return Token(access_token=access_token, token_type="bearer")


auth_service = AuthService()
