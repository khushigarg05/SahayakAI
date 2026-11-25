"""
SahayakAI ASGI Entry Point
Allows running both:
- uvicorn main:app --reload --port 8000
- uvicorn app.main:app --reload --port 8000
- python main.py
"""
import sys
from pathlib import Path

# Add backend directory to path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
