"""
Image analysis API routes
"""

from fastapi import APIRouter, HTTPException, File, UploadFile
from pydantic import BaseModel
from app.models.image_analysis import image_analyzer

router = APIRouter()

@router.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    """
    Analyze image quality
    """
    # Check file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=400,
            detail="File must be an image"
        )
    
    try:
        # Read image bytes
        image_bytes = await file.read()
        
        # Analyze
        result = image_analyzer.analyze(image_bytes)
        
        if not result.get("valid"):
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "Invalid image")
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Image analysis failed: {str(e)}"
        )
