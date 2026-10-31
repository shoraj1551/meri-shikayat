import os
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ML_ROOT = ROOT / "ml-services"
sys.path.insert(0, str(ML_ROOT))
sys.path.insert(0, str(ML_ROOT / "scripts"))

from train_categorizer import train

TEMP_DIRECTORY = tempfile.TemporaryDirectory()
MODEL_PATH = Path(TEMP_DIRECTORY.name) / "categorizer.joblib"
TAXONOMY_PATH = ROOT / "shared" / "complaint-categories.json"
train(ML_ROOT / "data" / "training" / "complaints.csv", TAXONOMY_PATH, MODEL_PATH)
os.environ["CATEGORIZATION_MODEL_PATH"] = str(MODEL_PATH)
os.environ["CATEGORY_TAXONOMY_PATH"] = str(TAXONOMY_PATH)

from app.models.categorization import ComplaintCategorizer


class CategorizationArtifactTests(unittest.TestCase):
    def test_artifact_covers_the_complete_canonical_taxonomy(self):
        categorizer = ComplaintCategorizer(MODEL_PATH, TAXONOMY_PATH)
        self.assertEqual(set(categorizer.pipeline.classes_), set(categorizer.categories))
        self.assertEqual(len(categorizer.categories), 9)
        self.assertEqual(categorizer.metadata["training_examples"], 54)

    def test_probability_labels_use_the_trained_class_order(self):
        categorizer = ComplaintCategorizer(MODEL_PATH, TAXONOMY_PATH)
        result = categorizer.predict("The bus stop shelter and timetable are broken")
        self.assertEqual(set(result["all_probabilities"]), set(categorizer.pipeline.classes_))
        self.assertIn(result["category"], categorizer.categories)
        self.assertTrue(all(item in categorizer.categories for item in result["suggestions"]))

    def test_runtime_rejects_taxonomy_drift(self):
        changed_taxonomy = Path(TEMP_DIRECTORY.name) / "changed-taxonomy.json"
        changed_taxonomy.write_text('{"version": 1, "categories": []}', encoding="utf-8")
        with self.assertRaisesRegex(RuntimeError, "different taxonomy"):
            ComplaintCategorizer(MODEL_PATH, changed_taxonomy)


if __name__ == "__main__":
    unittest.main()
