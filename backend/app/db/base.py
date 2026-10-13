from datetime import datetime
from sqlalchemy import MetaData, DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# Naming Convention (PostgreSQL aur SQLite dono ke liye crash-proof rule)
# Isse high concurrency me index ya unique keys kabhi clash nahi hote
POSTGRES_NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}

class Base(DeclarativeBase):
    """
    SahayakAI ka Master Base Model
    Saare Database Models (User, Citizen, Scheme) isi se banenge
    """
    metadata = MetaData(naming_convention=POSTGRES_NAMING_CONVENTION)

    # Har table ko automatically milne wale smart timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now(), 
        nullable=False
    )

    # Model ko fast dictionary me badalne ka helper (High traffic speed booster)
    def to_dict(self) -> dict:
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    # Terminal me clean print (Debugging asan karne ke liye, password hide karta hai)
    def __repr__(self) -> str:
        cols = ", ".join(
            f"{c.name}={getattr(self, c.name)!r}" 
            for c in self.__table__.columns 
            if c.name not in ["hashed_password"]
        )
        return f"<{self.__class__.__name__}({cols})>"
