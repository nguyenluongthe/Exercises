"""
Proxy tương thích ngược cho app.user_routes.
"""
from app.api.v1.endpoints.users import router

__all__ = ["router"]