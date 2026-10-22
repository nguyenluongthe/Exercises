"""
Proxy tương thích ngược cho app.admin_routes.
"""
from app.api.v1.endpoints.admin import router

__all__ = ["router"]