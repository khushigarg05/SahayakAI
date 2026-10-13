# SahayakAI Backend

Backend services, ML models, and API for SahayakAI.

## Setup Instructions

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Update variables in .env
   ```

4. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```
