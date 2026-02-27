FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev && rm -rf /var/lib/apt/lists/*
COPY services/shared/ /app/services/shared/
COPY services/soilscan_ai/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY services/soilscan_ai/ /app/services/soilscan_ai/
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8002/health')" || exit 1
EXPOSE 8002
CMD ["uvicorn", "services.soilscan_ai.app:app", "--host", "0.0.0.0", "--port", "8002"]
