"""
Services Package.
"""
from app.services.auth_service import auth_service, AuthService
from app.services.user_service import user_service, UserService
from app.services.adaptive_service import adaptive_service, AdaptiveWorkoutService
from app.services.ml_service import ml_service, MLService
from app.services.admin_service import admin_service, AdminService

__all__ = [
    "auth_service", "AuthService",
    "user_service", "UserService",
    "adaptive_service", "AdaptiveWorkoutService",
    "ml_service", "MLService",
    "admin_service", "AdminService",
]
