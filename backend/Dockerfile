FROM python:3.11-slim

WORKDIR /app

# Prevent Python from writing .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Install system dependencies: curl for health checks, tesseract-ocr with Indic language models
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-kan \
    tesseract-ocr-hin \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend codebase
COPY . .

# Expose port
EXPOSE 8000

# Run FastAPI app with dynamic port allocation for Railway
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port "]
