"""
Meri Shikayat ML Services
FastAPI-based microservices for machine learning features
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import categorization, image_analysis, sentiment
from app.config import settings

app = FastAPI(
    title="Meri Shikayat ML Services",
    description="Machine Learning microservices for complaint analysis",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(categorization.router, prefix="/api/ml", tags=["Categorization"])
app.include_router(image_analysis.router, prefix="/api/ml", tags=["Image Analysis"])
app.include_router(sentiment.router, prefix="/api/ml", tags=["Sentiment"])

@app.get("/")
async def root():
    return {
        "service": "Meri Shikayat ML Services",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "categorization": "active",
            "image_analysis": "active",
            "sentiment": "active"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
