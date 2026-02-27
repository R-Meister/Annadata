FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY services/harvest_to_cart/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY services/__init__.py /app/services/__init__.py
COPY services/shared/ /app/services/shared/
COPY services/harvest_to_cart/ /app/services/harvest_to_cart/

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8009/health')" || exit 1

EXPOSE 8009

CMD ["uvicorn", "services.harvest_to_cart.app:app", "--host", "0.0.0.0", "--port", "8009"]
