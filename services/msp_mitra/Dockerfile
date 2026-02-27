FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# System deps required by numpy/scipy/prophet
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY services/msp_mitra/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy shared service code
COPY services/shared /app/services/shared
COPY services/__init__.py /app/services/__init__.py 2>/dev/null || true

# Copy this service
COPY services/msp_mitra /app/services/msp_mitra

# Copy legacy backend modules that this service wraps
COPY msp_mitra/backend /app/msp_mitra/backend

# Copy data directory (price CSVs etc.) if present
COPY data /app/data

EXPOSE 8001

CMD ["uvicorn", "services.msp_mitra.app:app", "--host", "0.0.0.0", "--port", "8001"]
