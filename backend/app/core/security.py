import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
import bcrypt
from jose import jwt, JWTError
from app.core.config import settings

def get_password_hash(password: str) -> str:
    """
    Bcrypt use karke plain password ko secure 60-char hash me convert karta hai.
    Safe 72-byte truncation included.
    """
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    User ke dale hue password ko database ke hash se verify karta hai.
    """
    try:
        pwd_bytes = plain_password.encode("utf-8")[:72]
        hashed_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
    except Exception:
        return False

def generate_strong_password(length: int = 12) -> str:
    """
    Agar user khud strong password nahi bana pata, toh yeh function
    cryptographically strong random password auto-generate karta hai.
    Guarantees: 1 Uppercase, 1 Lowercase, 1 Number, 1 Special character.
    """
    length = max(length, 10)
    uppercase = secrets.choice(string.ascii_uppercase)
    lowercase = secrets.choice(string.ascii_lowercase)
    digit = secrets.choice(string.digits)
    special = secrets.choice("@$!%*?&#")

    all_allowed = string.ascii_letters + string.digits + "@$!%*?&#"
    remaining = [secrets.choice(all_allowed) for _ in range(length - 4)]

    password_chars = [uppercase, lowercase, digit, special] + remaining
    secrets.SystemRandom().shuffle(password_chars)
    return "".join(password_chars)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    User login hone par secure JWT token banata hai (SECRET_KEY se digitally signed).
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Incoming request ka JWT token decode aur verify karta hai.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
