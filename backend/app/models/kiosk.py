from typing import List, Optional
from sqlalchemy import Integer, String, Boolean, Float, Text, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base

class Kiosk(Base):
    """
    CSC Centers / Jan Seva Kendra Database Table:
    Optimized for high-speed location filtering by State, District, and Pincode.
    """
    __tablename__ = "kiosks"
    __table_args__ = (
        Index("ix_kiosks_location", "state", "district", "pincode"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    center_name: Mapped[str] = mapped_column(String(200), index=True, nullable=False)
    vle_operator_name: Mapped[str] = mapped_column(String(150), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    address: Mapped[str] = mapped_column(Text, nullable=False)
    district: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    state: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    pincode: Mapped[str] = mapped_column(String(10), index=True, nullable=False)

    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    operating_hours: Mapped[str] = mapped_column(String(100), default="09:00 AM - 06:00 PM", nullable=False)
    supported_services: Mapped[str] = mapped_column(String(300), default="Aadhaar, DBT, Schemes, Certificates", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True, nullable=False)

    appointments = relationship("Appointment", back_populates="kiosk", cascade="all, delete-orphan", lazy="selectin")
