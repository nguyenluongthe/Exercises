"""
Mô hình User trong Database (kèm thông tin hồ sơ thể lực Onboarding).
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=True)
    role = Column(String, default="user", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Hồ sơ thể lực người dùng (FR-002, FR-004 SRS)
    age = Column(Integer, nullable=True)
    gender = Column(String, default="male", nullable=True)
    height = Column(Float, nullable=True)  # cm
    weight = Column(Float, nullable=True)  # kg
    fitness_goal = Column(String, default="muscle_gain", nullable=True)  # muscle_gain, weight_loss, endurance, recovery
    experience_level = Column(String, default="beginner", nullable=True)  # beginner, intermediate, advanced
    available_equipment = Column(String, default="dumbbell", nullable=True)  # body_weight, dumbbell, full_gym, bands
    avoid_injury = Column(String, default="none", nullable=True)  # none, knee, lower_back, shoulder, wrist
    fitness_score = Column(Integer, default=70, nullable=True)  # Baseline FitnessScore™
    onboarding_completed = Column(Boolean, default=False, nullable=False)

    # Quan hệ
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    workout_logs = relationship("WorkoutLog", back_populates="user", cascade="all, delete-orphan")
