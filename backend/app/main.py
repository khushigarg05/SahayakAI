from fastapi import FastAPI

app = FastAPI(title="SahayakAI API")


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "SahayakAI Backend"
    }