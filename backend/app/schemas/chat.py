from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator, model_validator

class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str

class ChatRequest(BaseModel):
    """
    Multilingual Citizen Query Schema
    """
    message: str = Field(..., min_length=2, max_length=1000, description="Citizen ka sawaal", examples=["Dadi ki umar 65 saal hai aur BPL card hai, kya unhe koi pension milegi?"])
    language: Optional[str] = Field("auto", description="Preferred language: auto, hi, en, bn, te, mr, ta", examples=["hi"])
    citizen_id: Optional[int] = Field(None, description="Optional Citizen ID for personalized answers")
    conversation_history: Optional[List[ChatMessage]] = Field(default=[], description="Past messages for context")

    @field_validator("message")
    @classmethod
    def clean_message(cls, v: str) -> str:
        cleaned = v.strip()
        if len(cleaned) < 2:
            raise ValueError("Sawaal me kam se kam 2 akshar hone chahiye.")
        return cleaned


class ChatResponse(BaseModel):
    """
    RAG Verified Conversational Response
    """
    response: str
    answer: Optional[str] = None
    detected_language: str
    matched_scheme: Optional[str] = None
    confidence_score: float
    source_guidelines: List[str]
    suggested_action: Optional[str] = None

    @model_validator(mode="after")
    def sync_answer(self):
        if not self.answer:
            self.answer = self.response
        return self

class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000, description="Text to convert into speech")
    voice_id: Optional[str] = Field(None, description="Optional ElevenLabs voice ID")
