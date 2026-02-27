FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev && rm -rf /var/lib/apt/lists/*
COPY services/shared/ /app/services/shared/
COPY services/fasal_rakshak/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY services/fasal_rakshak/ /app/services/fasal_rakshak/
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8003/health')" || exit 1
EXPOSE 8003
CMD ["uvicorn", "services.fasal_rakshak.app:app", "--host", "0.0.0.0", "--port", "8003"]
