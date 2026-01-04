"""
Sentiment and urgency analysis
"""

from textblob import TextBlob
import re

class SentimentAnalyzer:
    def __init__(self):
        # Urgency keywords
        self.urgency_keywords = {
            "high": ["urgent", "emergency", "immediately", "asap", "critical", 
                    "dangerous", "severe", "serious", "life-threatening"],
            "medium": ["soon", "quickly", "important", "needed", "required"],
            "low": ["whenever", "eventually", "sometime", "if possible"]
        }
    
    def analyze(self, text: str):
        """Analyze sentiment and urgency"""
        # Clean text
        text_lower = text.lower()
        
        # Sentiment analysis using TextBlob
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity  # -1 to 1
        subjectivity = blob.sentiment.subjectivity  # 0 to 1
        
        # Determine sentiment
        if polarity > 0.1:
            sentiment = "positive"
        elif polarity < -0.1:
            sentiment = "negative"
        else:
            sentiment = "neutral"
        
        # Determine urgency
        urgency = "low"
        urgency_score = 0
        
        for level, keywords in self.urgency_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    if level == "high":
                        urgency = "high"
                        urgency_score = max(urgency_score, 0.9)
                    elif level == "medium" and urgency != "high":
                        urgency = "medium"
                        urgency_score = max(urgency_score, 0.6)
        
        # Check for exclamation marks (indicates urgency)
        exclamation_count = text.count('!')
        if exclamation_count >= 2:
            urgency_score = min(urgency_score + 0.2, 1.0)
            if urgency == "low":
                urgency = "medium"
        
        # Determine emotion
        if polarity < -0.5:
            emotion = "angry"
        elif polarity < -0.2:
            emotion = "frustrated"
        elif polarity > 0.5:
            emotion = "satisfied"
        elif polarity > 0.2:
            emotion = "hopeful"
        else:
            emotion = "neutral"
        
        return {
            "sentiment": sentiment,
            "polarity": float(polarity),
            "subjectivity": float(subjectivity),
            "urgency": urgency,
            "urgency_score": float(urgency_score),
            "emotion": emotion,
            "confidence": 0.75  # Dummy confidence
        }

# Global instance
sentiment_analyzer = SentimentAnalyzer()
