FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY services/mausam_chakra/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY services/__init__.py /app/services/__init__.py
COPY services/shared/ /app/services/shared/
COPY services/mausam_chakra/ /app/services/mausam_chakra/

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8011/health')" || exit 1

EXPOSE 8011

CMD ["uvicorn", "services.mausam_chakra.app:app", "--host", "0.0.0.0", "--port", "8011"]
