# ==========================================
# SahayakAI Backend - FastAPI & ML Intelligence Engine
# ==========================================
FROM python:3.11-slim

# Set environment settings
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8000

WORKDIR /app

# Install system dependencies (curl for health check, build essentials)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy backend source code & ML artifacts
COPY . .

# Expose backend port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Launch script: seed SQLite database if empty, then run Uvicorn server
CMD ["sh", "-c", "python -m app.db.seed_data && uvicorn main:app --host 0.0.0.0 --port 8000"]
