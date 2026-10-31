import argparse
import csv
import hashlib
import json
from collections import Counter
from pathlib import Path

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline


def file_sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def train(dataset_path, taxonomy_path, output_path):
    taxonomy = json.loads(taxonomy_path.read_text(encoding="utf-8"))
    category_ids = {item["id"] for item in taxonomy["categories"]}
    with dataset_path.open(encoding="utf-8", newline="") as source:
        rows = list(csv.DictReader(source))

    labels = [row["category"].strip() for row in rows]
    texts = [row["text"].strip() for row in rows]
    counts = Counter(labels)
    if set(counts) != category_ids:
        raise ValueError(f"Dataset labels {sorted(counts)} do not match taxonomy {sorted(category_ids)}")
    if min(counts.values()) < 5:
        raise ValueError("Every category requires at least five independently labelled examples")
    if any(len(text) < 10 for text in texts):
        raise ValueError("Training examples must contain at least ten characters")

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True, min_df=1)),
        ("classifier", LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42))
    ])
    pipeline.fit(texts, labels)

    artifact = {
        "artifact_version": 1,
        "taxonomy_version": taxonomy["version"],
        "taxonomy_sha256": file_sha256(taxonomy_path),
        "dataset_sha256": file_sha256(dataset_path),
        "training_examples": len(rows),
        "pipeline": pipeline
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(artifact, output_path)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", type=Path, required=True)
    parser.add_argument("--taxonomy", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    train(args.dataset, args.taxonomy, args.output)
