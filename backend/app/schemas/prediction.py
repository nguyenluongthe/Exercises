"""
Pydantic Schemas cho dự đoán nhóm cơ AI (Predict DTOs).
"""
from typing import List
from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    text: str = Field(..., min_length=3, description="Mô tả bằng ngôn ngữ tự nhiên, ví dụ: 'tôi muốn tập cơ ngực với tạ đơn'")


class LabelScore(BaseModel):
    body_part: str
    confidence: float


class PredictResponse(BaseModel):
    input_text: str
    predicted_body_part: str
    confidence: float
    confidence_level: str = "medium"  # "high" (>= 0.70), "medium" (0.45 - 0.70), "low" (< 0.45)
    interpreted_keywords: List[str] = []
    clarification_needed: bool = False
    top_3: List[LabelScore]
