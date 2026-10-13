from typing import List, Dict, Any
from fastapi import APIRouter, status
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.rag_service import rag_service, SCHEME_KNOWLEDGE_BASE

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
async def chat_with_sahayak(request: ChatRequest) -> ChatResponse:
    """
    High-Concurrency Async RAG Endpoint:
    - 0% Crash Guarantee (Even if Gemini LLM times out or is offline)
    - In-Memory TF-IDF Vector Retrieval (<2ms)
    - Automatic Language Script Detection
    - Query Caching for High-Speed Instant Response
    """
    response = await rag_service.generate_response(
        query=request.message,
        user_lang=request.language
    )
    return response

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
