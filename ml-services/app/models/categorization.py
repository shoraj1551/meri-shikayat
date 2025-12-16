"""
Auto-categorization model with dummy training data
"""

import joblib
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
import numpy as np

class ComplaintCategorizer:
    def __init__(self):
        self.categories = [
            "roads", "sanitation", "water", "electricity", 
            "drainage", "street_lights", "garbage", "other"
        ]
        self.model = None
        self.pipeline = None
        
        # Try to load existing model, otherwise train new one
        model_path = "./data/models/categorizer.joblib"
        if os.path.exists(model_path):
            self.load_model(model_path)
        else:
            self.train_dummy_model()
    
    def train_dummy_model(self):
        """Train model with dummy data"""
        # Dummy training data
        training_data = [
            # Roads
            ("pothole on main street", "roads"),
            ("road is damaged near market", "roads"),
            ("broken road causing accidents", "roads"),
            ("need road repair urgently", "roads"),
            ("cracks in the highway", "roads"),
            
            # Sanitation
            ("garbage not collected for days", "sanitation"),
            ("dirty streets need cleaning", "sanitation"),
            ("waste disposal issue", "sanitation"),
            ("sanitation workers not coming", "sanitation"),
            ("unhygienic conditions in area", "sanitation"),
            
            # Water
            ("no water supply since morning", "water"),
            ("water pipe leaking badly", "water"),
            ("dirty water coming from tap", "water"),
            ("water shortage in our locality", "water"),
            ("broken water connection", "water"),
            
            # Electricity
            ("power cut for 8 hours", "electricity"),
            ("electricity wire hanging dangerously", "electricity"),
            ("no power supply in area", "electricity"),
            ("transformer not working", "electricity"),
            ("frequent power outages", "electricity"),
            
            # Drainage
            ("drain is overflowing", "drainage"),
            ("blocked drainage causing flooding", "drainage"),
            ("sewage water on road", "drainage"),
            ("drainage system needs repair", "drainage"),
            ("manhole cover missing", "drainage"),
            
            # Street Lights
            ("street lights not working", "street_lights"),
            ("dark streets at night", "street_lights"),
            ("need more street lights", "street_lights"),
            ("broken street lamp", "street_lights"),
            
            # Garbage
            ("garbage dump near residential area", "garbage"),
            ("trash bins overflowing", "garbage"),
            ("illegal dumping of waste", "garbage"),
            ("stray animals in garbage", "garbage"),
        ]
        
        texts, labels = zip(*training_data)
        
        # Create pipeline
        self.pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(max_features=100, ngram_range=(1, 2))),
            ('clf', MultinomialNB())
        ])
        
        # Train
        self.pipeline.fit(texts, labels)
        
        # Save model
        os.makedirs("./data/models", exist_ok=True)
        joblib.dump(self.pipeline, "./data/models/categorizer.joblib")
        
        print("✅ Categorization model trained and saved")
    
    def load_model(self, path):
        """Load pre-trained model"""
        self.pipeline = joblib.load(path)
        print("✅ Categorization model loaded")
    
    def predict(self, text: str):
        """Predict category for given text"""
        if not self.pipeline:
            return {
                "category": "other",
                "confidence": 0.0,
                "suggestions": []
            }
        
        # Predict
        prediction = self.pipeline.predict([text])[0]
        probabilities = self.pipeline.predict_proba([text])[0]
        confidence = float(probabilities.max())
        
        # Get top 3 suggestions
        top_indices = np.argsort(probabilities)[-3:][::-1]
        suggestions = [self.categories[i] if i < len(self.categories) else "other" 
                      for i in top_indices]
        
        return {
            "category": prediction,
            "confidence": confidence,
            "suggestions": suggestions,
            "all_probabilities": {
                cat: float(prob) 
                for cat, prob in zip(self.categories, probabilities)
            }
        }

# Global instance
categorizer = ComplaintCategorizer()
