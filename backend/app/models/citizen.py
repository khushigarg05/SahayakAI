from sqlalchemy import Integer, String, Boolean, Float, ForeignKey, CheckConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class Citizen(Base):
    """
    Citizen Profiles Table: Demographics & Welfare Scheme Eligibility Criteria
    High-Traffic Optimized for Scheme Matching Queries
    """
    __tablename__ = "citizens"
    __table_args__ = (
        # Sanity Guard: Age aur Income kabhi negative nahi ho sakte
        CheckConstraint("age IS NULL OR age >= 0", name="ck_citizens_positive_age"),
        CheckConstraint("annual_income IS NULL OR annual_income >= 0", name="ck_citizens_positive_income"),
        # Speed Index: State, District aur BPL filtering ko ultra-fast banata hai
        Index("ix_citizens_location", "state", "district"),
        Index("ix_citizens_bpl_income", "bpl_status", "annual_income"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, 
        ForeignKey("users.id", ondelete="CASCADE"), 
        unique=True, 
        nullable=False,
        index=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)
    state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    district: Mapped[str | None] = mapped_column(String(100), nullable=True)
    annual_income: Mapped[float | None] = mapped_column(Float, nullable=True)
    bpl_status: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    caste_category: Mapped[str | None] = mapped_column(String(50), nullable=True)  # General, OBC, SC, ST
    digital_literacy: Mapped[str | None] = mapped_column(String(50), default="Low", nullable=True)  # Low, Medium, High

    # Relationship back to User
    user = relationship("User", back_populates="citizen_profile")
