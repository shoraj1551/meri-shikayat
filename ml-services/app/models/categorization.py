import hashlib
import json
from pathlib import Path

import joblib
import numpy as np

from app.config import settings


class ComplaintCategorizer:
    def __init__(self, model_path=None, taxonomy_path=None):
        self.model_path = Path(model_path or settings.CATEGORIZATION_MODEL_PATH)
        self.taxonomy_path = Path(taxonomy_path or settings.CATEGORY_TAXONOMY_PATH)
        self.pipeline = None
        self.categories = []
        self.metadata = {}
        self.load_model()

    def load_model(self):
        if not self.model_path.is_file():
            raise RuntimeError(f"Categorization model artifact is missing: {self.model_path}")
        if not self.taxonomy_path.is_file():
            raise RuntimeError(f"Category taxonomy is missing: {self.taxonomy_path}")

        taxonomy_bytes = self.taxonomy_path.read_bytes()
        taxonomy = json.loads(taxonomy_bytes.decode("utf-8"))
        artifact = joblib.load(self.model_path)
        expected_hash = hashlib.sha256(taxonomy_bytes).hexdigest()
        if artifact.get("artifact_version") != 1:
            raise RuntimeError("Unsupported categorization artifact version")
        if artifact.get("taxonomy_version") != taxonomy.get("version"):
            raise RuntimeError("Categorization artifact taxonomy version mismatch")
        if artifact.get("taxonomy_sha256") != expected_hash:
            raise RuntimeError("Categorization artifact was trained with a different taxonomy")

        pipeline = artifact.get("pipeline")
        learned_classes = list(pipeline.classes_)
        taxonomy_classes = [item["id"] for item in taxonomy["categories"]]
        if set(learned_classes) != set(taxonomy_classes):
            raise RuntimeError("Categorization artifact classes do not cover the canonical taxonomy")

        self.pipeline = pipeline
        self.categories = taxonomy_classes
        self.metadata = {key: value for key, value in artifact.items() if key != "pipeline"}

    def predict(self, text):
        probabilities = self.pipeline.predict_proba([text])[0]
        classes = list(self.pipeline.classes_)
        ranked_indices = np.argsort(probabilities)[::-1]
        prediction_index = int(ranked_indices[0])
        return {
            "category": classes[prediction_index],
            "confidence": float(probabilities[prediction_index]),
            "suggestions": [classes[index] for index in ranked_indices[:3]],
            "all_probabilities": {
                category: float(probability)
                for category, probability in zip(classes, probabilities)
            }
        }


categorizer = ComplaintCategorizer()
