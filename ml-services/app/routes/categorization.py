"""
Categorization API routes
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.models.categorization import categorizer

router = APIRouter()

class CategorizationRequest(BaseModel):
    description: str

class CategorizationResponse(BaseModel):
    category: str
    confidence: float
    suggestions: list
    all_probabilities: dict = None

@router.post("/categorize", response_model=CategorizationResponse)
async def categorize_complaint(request: CategorizationRequest):
    """
    Auto-categorize complaint based on description
    """
    if not request.description or len(request.description.strip()) < 10:
        raise HTTPException(
            status_code=400,
            detail="Description must be at least 10 characters"
        )
    
    try:
        result = categorizer.predict(request.description)
        return CategorizationResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Categorization failed: {str(e)}"
        )

@router.get("/categories")
async def get_categories():
    """
    Get list of available categories
    """
    return {
        "categories": categorizer.categories,
        "count": len(categorizer.categories)
    }
