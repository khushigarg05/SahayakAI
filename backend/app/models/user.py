from sqlalchemy import Integer, String, Boolean, CheckConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class User(Base):
    """
    Users Table: High-Concurrency Authentication & Account System
    """
    __tablename__ = "users"
    __table_args__ = (
        # Security Guard: Role sirf citizen ya operator hi ho sakta hai
        CheckConstraint("role IN ('citizen', 'operator', 'admin')", name="ck_users_valid_role"),
        CheckConstraint("length(mobile) >= 10", name="ck_users_mobile_min_length"),
        # Speed Index: Mobile login ko lightning fast banane ke liye
        Index("ix_users_mobile_active", "mobile", "is_active"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    mobile: Mapped[str] = mapped_column(String(15), unique=True, index=True, nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, index=True, nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), default="citizen", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # selectin loading: N+1 query problem khatam karta hai (High traffic performance booster)
    citizen_profile = relationship(
        "Citizen", 
        back_populates="user", 
        uselist=False, 
        cascade="all, delete-orphan",
        lazy="selectin"
    )
