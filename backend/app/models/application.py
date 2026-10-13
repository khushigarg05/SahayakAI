from typing import Optional
from datetime import datetime
from sqlalchemy import Integer, String, Float, Text, ForeignKey, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class Application(Base):
    """
    Welfare Scheme Applications Lifecycle Table:
    Tracks citizen application progress, barrier audits, and 4-stage lifecycle milestones.
    Aligned with CPGRAMS & National Application Tracking standards.
    """
    __tablename__ = "applications"
    __table_args__ = (
        Index("ix_applications_number", "application_number", unique=True),
        Index("ix_applications_citizen", "citizen_id"),
        Index("ix_applications_scheme", "scheme_id"),
        Index("ix_applications_status", "stage_status"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    application_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)  # e.g. APP-PMAY-8921
    
    citizen_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    scheme_id: Mapped[int] = mapped_column(Integer, ForeignKey("schemes.id", ondelete="CASCADE"), index=True, nullable=False)
    kiosk_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("kiosks.id", ondelete="SET NULL"), nullable=True)

    # ML Risk & Barrier snapshot at time of filing
    risk_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(30), default="LOW RISK", nullable=False)

    # 4-Stage Lifecycle Milestone:
    # 1: TOKEN_GENERATED, 2: KIOSK_SLOT_RESERVED, 3: BIOMETRIC_DOCUMENT_SCAN, 4: DIRECTORATE_SANCTION
    current_stage: Mapped[str] = mapped_column(String(50), default="TOKEN_GENERATED", nullable=False)
    stage_status: Mapped[str] = mapped_column(String(40), default="UNDER_REVIEW", nullable=False)  # UNDER_REVIEW, APPROVED, ACTION_REQUIRED, REJECTED
    progress_percentage: Mapped[int] = mapped_column(Integer, default=25, nullable=False)

    # Specific administrative blocker if any
    blocker_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    remedy_action: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    citizen = relationship("User", foreign_keys=[citizen_id], lazy="joined")
    scheme = relationship("Scheme", foreign_keys=[scheme_id], lazy="joined")
    kiosk = relationship("Kiosk", foreign_keys=[kiosk_id], lazy="joined")
