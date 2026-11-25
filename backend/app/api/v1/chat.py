from typing import List, Dict, Any
from fastapi import APIRouter, status, Response, HTTPException, Request
from app.schemas.chat import ChatRequest, ChatResponse, TTSRequest
from app.services.rag_service import rag_service, SCHEME_KNOWLEDGE_BASE
from app.services.elevenlabs_service import elevenlabs_service
from app.core.rate_limiter import enforce_rate_limit

router = APIRouter()

@router.post(
    "",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Multilingual AI Scheme Chatbot (RAG Powered)",
    description=(
        "Citizen ka welfare scheme se related sawaal puchein (Hindi, English, Bengali, Telugu, Hinglish me). "
        "RAG Architecture official rulebooks se accurate jankari verify karta hai "
        "aur crash-proof asynchronous fallback ke sath response deta hai."
    )
)
async def chat_with_sahayak(request: ChatRequest, http_request: Request) -> ChatResponse:
    """
    High-Concurrency Async RAG Endpoint:
    - 0% Crash Guarantee (Even if Gemini LLM times out or is offline)
    - In-Memory TF-IDF Vector Retrieval (<2ms)
    - Automatic Language Script Detection
    - Query Caching for High-Speed Instant Response
    - Sliding window rate limiting: max 30 chat queries/minute
    """
    enforce_rate_limit(request=http_request, scope="chat", max_requests=30, window_seconds=60)
    response = await rag_service.generate_response(
        query=request.message,
        user_lang=request.language
    )
    return response

@router.post(
    "/tts",
    summary="ElevenLabs Multilingual Text-to-Speech",
    description="Converts assistant responses into natural Hindi / Indian English voice stream."
)
async def generate_speech_audio(payload: TTSRequest, http_request: Request):
    enforce_rate_limit(request=http_request, scope="chat_tts", max_requests=15, window_seconds=60)
    audio_bytes = await elevenlabs_service.generate_speech(
        text=payload.text,
        voice_id=payload.voice_id
    )
    if not audio_bytes:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ElevenLabs voice generation unavailable or permission not enabled."
        )
    return Response(content=audio_bytes, media_type="audio/mpeg")

@router.get(
    "/schemes-knowledge",
    summary="Available Scheme Knowledge Base (Offline Reference)",
    description="Returns summaries of all 5 Indian government schemes indexed in the RAG brain."
)
def get_schemes_knowledge() -> List[Dict[str, Any]]:
    return [
        {
            "scheme_code": item["scheme_code"],
            "scheme_name": item["scheme_name"],
            "category": item["category"],
            "hindi_summary": item["hindi_summary"]
        }
        for item in SCHEME_KNOWLEDGE_BASE
    ]
