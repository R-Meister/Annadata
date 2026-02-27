FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY services/kisaan_sahayak/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Package init files for "services.shared..." imports
COPY services/__init__.py /app/services/__init__.py
COPY services/shared/ /app/services/shared/
COPY services/kisaan_sahayak/ /app/services/kisaan_sahayak/

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8006/health')" || exit 1

EXPOSE 8006

CMD ["uvicorn", "services.kisaan_sahayak.app:app", "--host", "0.0.0.0", "--port", "8006"]
