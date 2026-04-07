# ml/Dockerfile
# Used for deploying the FastAPI AI server to Hugging Face Spaces (free)
# Build: docker build -t plant-disease-api .
# Run:   docker run -p 8000:7860 plant-disease-api

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libglib2.0-0 libsm6 libxext6 libxrender-dev libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 7860

CMD ["uvicorn", "serve:app", "--host", "0.0.0.0", "--port", "7860"]
