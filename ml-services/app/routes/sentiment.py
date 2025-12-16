"""
Sentiment analysis API routes
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.models.sentiment import sentiment_analyzer

router = APIRouter()

class SentimentRequest(BaseModel):
    text: str

class SentimentResponse(BaseModel):
    sentiment: str
    polarity: float
    subjectivity: float
    urgency: str
    urgency_score: float
    emotion: str
    confidence: float

@router.post("/sentiment", response_model=SentimentResponse)
async def analyze_sentiment(request: SentimentRequest):
    """
    Analyze sentiment and urgency of complaint text
    """
    if not request.text or len(request.text.strip()) < 5:
        raise HTTPException(
            status_code=400,
            detail="Text must be at least 5 characters"
        )
    
    try:
        result = sentiment_analyzer.analyze(request.text)
        return SentimentResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Sentiment analysis failed: {str(e)}"
        )
