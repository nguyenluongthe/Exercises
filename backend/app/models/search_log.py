"""
Mô hình SearchLog (lưu lịch sử tìm kiếm người dùng).
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from app.core.database import Base


class SearchLog(Base):
    __tablename__ = "search_logs"

    id = Column(Integer, primary_key=True, index=True)
    query_text = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
