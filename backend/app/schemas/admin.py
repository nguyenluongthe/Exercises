"""
Pydantic Schemas cho Quản trị viên (Admin DTOs).
"""
from typing import List, Dict, Any
from pydantic import BaseModel


class AdminStats(BaseModel):
    total_users: int
    total_exercises: int
    total_favorites: int
    total_workout_logs: int
    most_favorited_exercises: List[Dict[str, Any]]
    weekly_searches: List[Dict[str, Any]]
    monthly_new_users: List[Dict[str, Any]]
