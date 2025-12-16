# Meri Shikayat ML Services

Python-based microservices for machine learning features.

## Features

- **Auto-Categorization**: Automatically categorize complaints using NLP
- **Image Analysis**: Analyze image quality (blur, brightness, contrast)
- **Sentiment Analysis**: Detect sentiment, urgency, and emotion

## Setup

### 1. Create Virtual Environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Download NLTK Data (for TextBlob)

```bash
python -m textblob.download_corpora
```

### 4. Run Service

```bash
# Development
uvicorn app.main:app --reload --port 8000

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## API Endpoints

### Health Check
```
GET /health
```

### Categorization
```
POST /api/ml/categorize
Body: {"description": "pothole on main street"}
```

### Sentiment Analysis
```
POST /api/ml/sentiment
Body: {"text": "urgent! need immediate help"}
```

### Image Analysis
```
POST /api/ml/analyze-image
Body: multipart/form-data with image file
```

## Integration with Node.js

The Node.js backend calls these endpoints:

```javascript
const response = await axios.post('http://localhost:8000/api/ml/categorize', {
    description: complaintText
});
```

## Model Training

Models are trained with dummy data on first run. To retrain:

1. Add real complaint data to `data/training/`
2. Update training scripts in `app/models/`
3. Restart service

## Environment Variables

Create `.env` file:

```env
SERVICE_PORT=8000
NODE_SERVICE_URL=http://localhost:5000
MODEL_DIR=./data/models
```
