import re
import logging
import hashlib
import asyncio
import httpx
from typing import Optional, List, Dict
from app.core.config import settings

logger = logging.getLogger(__name__)

class ElevenLabsService:
    """
    High-Definition Multilingual Text-to-Speech Service using ElevenLabs.
    Provides natural Hindi and Indian English voice generation for SahayakAI assistant.
    Configured with official Free-Tier Premade voices (zero paid subscription required).
    Includes concurrency locking and in-memory audio caching to prevent HTTP 429 rate limits.
    """

    BASE_URL = "https://api.elevenlabs.io/v1/text-to-speech"
    # Official Free-Tier Premade Voices (Supported without subscription)
    DEFAULT_VOICE_ID = "pNInz6obpgDQGcFmaJgB"  # Adam (authoritative, clear, calm)
    FREE_VOICE_CANDIDATES: List[str] = [
        "pNInz6obpgDQGcFmaJgB",  # Adam
        "Xb7hH8MSUJpSbSDYk0k2",  # Alice
        "EXAVITQu4vr4xnSDxMaL",  # Bella
        "onwK4e9ZLuTAKqWW03F9",  # Daniel
    ]
    MODEL_ID = "eleven_multilingual_v2"

    def __init__(self):
        self._lock = asyncio.Lock()
        self._cache: Dict[str, bytes] = {}
        self._max_cache_size = 50

    @staticmethod
    def clean_text_for_speech(text: str) -> str:
        """Strip markdown, URLs, and formatting so speech sounds 100% natural."""
        if not text:
            return ""
        # Remove markdown bold/italics
        cleaned = re.sub(r"[*_~`]", "", text)
        # Remove markdown links [title](url) -> title
        cleaned = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", cleaned)
        # Remove headers #
        cleaned = re.sub(r"^#+\s*", "", cleaned, flags=re.MULTILINE)
        # Remove bullet symbols
        cleaned = re.sub(r"^[-•*]\s*", "", cleaned, flags=re.MULTILINE)
        # Remove excessive whitespace
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        # Cap to 380 characters for fast responsive voice & quota preservation
        if len(cleaned) > 380:
            last_period = cleaned[:380].rfind(".")
            if last_period > 150:
                cleaned = cleaned[:last_period + 1]
            else:
                cleaned = cleaned[:380] + "..."
        return cleaned

    async def generate_speech(self, text: str, voice_id: Optional[str] = None) -> Optional[bytes]:
        """
        Convert text into MP3 audio stream using ElevenLabs API with free premade voices.
        Thread-safe single-flight concurrency lock + LRU audio caching prevents HTTP 429 errors.
        """
        api_key = settings.ELEVENLABS_API_KEY
        if not api_key:
            logger.warning("ELEVENLABS_API_KEY not configured in settings")
            return None

        clean_text = self.clean_text_for_speech(text)
        if not clean_text:
            return None

        # Determine voice candidate order
        preferred_voice = voice_id or settings.ELEVENLABS_VOICE_ID or self.DEFAULT_VOICE_ID
        cache_key = hashlib.md5(f"{clean_text}_{preferred_voice}".encode("utf-8")).hexdigest()

        # 1. Instant Cache Hit Check (Zero ElevenLabs API calls)
        if cache_key in self._cache:
            logger.info(f"ElevenLabs TTS: Serving audio from in-memory cache ({cache_key[:8]})")
            return self._cache[cache_key]

        voices_to_try = [preferred_voice] + [v for v in self.FREE_VOICE_CANDIDATES if v != preferred_voice]

        headers = {
            "xi-api-key": api_key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg"
        }

        payload = {
            "text": clean_text,
            "model_id": self.MODEL_ID,
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75,
                "style": 0.0,
                "use_speaker_boost": True
            }
        }

        # 2. Strict Concurrency Lock: At most 1 in-flight request to ElevenLabs at any instant
        async with self._lock:
            # Double-check cache inside lock (in case previous request just completed and cached)
            if cache_key in self._cache:
                return self._cache[cache_key]

            async with httpx.AsyncClient(timeout=15.0) as client:
                for current_voice in voices_to_try:
                    url = f"{self.BASE_URL}/{current_voice}"
                    try:
                        response = await client.post(url, json=payload, headers=headers)
                        if response.status_code == 200:
                            audio_bytes = response.content
                            # Manage LRU cache size
                            if len(self._cache) >= self._max_cache_size:
                                oldest_key = next(iter(self._cache))
                                del self._cache[oldest_key]
                            self._cache[cache_key] = audio_bytes
                            return audio_bytes
                        elif response.status_code == 402:
                            logger.warning(f"Voice {current_voice} requires paid plan. Trying next free premade voice...")
                            continue
                        elif response.status_code == 429:
                            logger.warning(f"ElevenLabs concurrency limit (HTTP 429) hit: {response.text}. Stopping retries.")
                            break
                        else:
                            logger.error(f"ElevenLabs TTS failed: HTTP {response.status_code} - {response.text}")
                            break
                    except Exception as e:
                        logger.warning(f"ElevenLabs request error for voice {current_voice}: {e}")
                        break

        return None

elevenlabs_service = ElevenLabsService()
