import logging
from typing import Generator
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

logger = logging.getLogger(__name__)

# Connection Arguments (High Traffic Settings)
connect_args = {}
if settings.sync_database_url.startswith("sqlite"):
    connect_args = {
        "check_same_thread": False,  # Multiple threads handle karne ke liye
        "timeout": 30                 # 30 seconds wait karega agar traffic jam ho, crash nahi hoga
    }

# Engine Creation with Health Check
engine = create_engine(
    settings.sync_database_url,
    connect_args=connect_args,
    pool_pre_ping=True,  # Broken connection auto-detect & auto-reconnect
    echo=False
)

# SQLite Event Listener (WAL Mode & Foreign Keys ON)
# Ye SQLite ko 10x-50x fast aur concurrent bana deta hai
@event.listens_for(engine, "connect")
def configure_sqlite_connection(dbapi_connection, connection_record):
    if settings.sync_database_url.startswith("sqlite"):
        cursor = dbapi_connection.cursor()
        # WAL Mode: Readers aur Writers ek dusre ko block nahi karte
        cursor.execute("PRAGMA journal_mode=WAL;")
        # Synchronous NORMAL: Faster write speed
        cursor.execute("PRAGMA synchronous=NORMAL;")
        # Foreign Key check on: Data kabhi corrupt nahi hoga
        cursor.execute("PRAGMA foreign_keys=ON;")
        cursor.close()

# Session Maker
SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine
)

# Bulletproof get_db Dependency
def get_db() -> Generator[Session, None, None]:
    """
    FastAPI Endpoints ke liye safe Database Session Provider
    Agar beech me koi error aati hai toh safely rollback karega.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()  # Kisi bhi crash/error par data clean rollback
        logger.error(f"Database session error: {e}")
        raise
    finally:
        db.close()     # Connection hamesha safely close hoga (No memory leaks)
