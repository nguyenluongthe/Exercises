"""
Tổng hợp các Router API v1.
"""
from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, adaptive, exercises, ml, admin

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth")
api_router.include_router(users.router)
api_router.include_router(adaptive.router)
api_router.include_router(exercises.router)
api_router.include_router(ml.router)
api_router.include_router(admin.router)
