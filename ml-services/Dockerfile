FROM python:3.10-slim

WORKDIR /app
RUN apt-get update && apt-get install -y libgl1 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY ml-services/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY ml-services/ ./
COPY shared/complaint-categories.json ./shared/complaint-categories.json
RUN python scripts/train_categorizer.py \
    --dataset data/training/complaints.csv \
    --taxonomy shared/complaint-categories.json \
    --output data/models/categorizer.joblib

EXPOSE 8000
ENV PORT=8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
