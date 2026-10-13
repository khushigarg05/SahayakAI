from typing import List, Optional
from sqlalchemy import Integer, String, Boolean, Float, Text, Index, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class Scheme(Base):
    """
    Welfare Schemes Catalog Table:
    Optimized for high-speed indexing and multi-criteria rule matching.
    """
    __tablename__ = "schemes"
    __table_args__ = (
        Index("ix_schemes_active_cat", "is_active", "category"),
        Index("ix_schemes_code", "scheme_code", unique=True),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    scheme_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)  # e.g., PMAY-G, PM-KISAN
    name: Mapped[str] = mapped_column(String(200), index=True, nullable=False)
    ministry: Mapped[str] = mapped_column(String(200), index=True, nullable=False)
    category: Mapped[str] = mapped_column(String(100), index=True, nullable=False)  # Housing, Agriculture, Social Security
    description: Mapped[str] = mapped_column(Text, nullable=False)
    benefits_summary: Mapped[str] = mapped_column(Text, nullable=False)

    # Deterministic Rule Engine Eligibility Thresholds
    min_age: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    max_age: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    max_annual_income: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    requires_bpl: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    target_gender: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # All, Female, Male
    target_caste: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)   # All, SC, ST, OBC
    
    # Stored as JSON list of strings (e.g., ["Aadhaar", "Income Certificate", "Bank Passbook"])
    required_documents: Mapped[Optional[dict]] = mapped_column(JSON, default=list, nullable=False)
    
    # Official portal link & application fee
    official_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True, nullable=False)
