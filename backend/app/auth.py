"""
Proxy tương thích ngược cho app.auth.
"""
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    oauth2_scheme,
)
from app.api.deps import (
    get_current_user,
    get_current_admin,
)

__all__ = [
    "hash_password",
    "verify_password",
    "create_access_token",
    "oauth2_scheme",
    "get_current_user",
    "get_current_admin",
]