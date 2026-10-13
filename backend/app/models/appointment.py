from typing import Optional
from sqlalchemy import Integer, String, Text, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class Appointment(Base):
    """
    Kiosk Booking Tokens Table:
    Generates unique #SAH-XXXX appointment tokens and stores scannable QR codes.
    """
    __tablename__ = "appointments"
    __table_args__ = (
        Index("ix_appointments_token", "token_number", unique=True),
        Index("ix_appointments_kiosk_date", "kiosk_id", "appointment_date"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    token_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)  # e.g., #SAH-8921
    
    citizen_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    kiosk_id: Mapped[int] = mapped_column(Integer, ForeignKey("kiosks.id", ondelete="CASCADE"), index=True, nullable=False)
    scheme_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("schemes.id", ondelete="SET NULL"), nullable=True)

    appointment_date: Mapped[str] = mapped_column(String(20), index=True, nullable=False)  # YYYY-MM-DD
    appointment_time_slot: Mapped[str] = mapped_column(String(50), nullable=False)         # e.g., 10:30 AM - 11:00 AM
    status: Mapped[str] = mapped_column(String(30), default="BOOKED", index=True, nullable=False)  # BOOKED, COMPLETED, CANCELLED

    # Multilingual tracking
    preferred_language: Mapped[str] = mapped_column(String(10), default="hi", nullable=False)

    # Scannable QR Code stored as Base64 Data URI (Instant load on any phone)
    qr_code_base64: Mapped[str] = mapped_column(Text, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    kiosk = relationship("Kiosk", back_populates="appointments", lazy="joined")
    citizen = relationship("User", foreign_keys=[citizen_id], lazy="joined")
    scheme = relationship("Scheme", foreign_keys=[scheme_id], lazy="joined")
