FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# System deps required for psycopg2 and healthcheck
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libpq-dev \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY services/gamification/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Package init file for "services.shared..." imports
COPY services/__init__.py /app/services/__init__.py

# Copy shared service code
COPY services/shared /app/services/shared

# Copy Alembic config and migrations
COPY alembic.ini /app/alembic.ini
COPY alembic /app/alembic

# Copy this service
COPY services/gamification /app/services/gamification

EXPOSE 8012

CMD ["uvicorn", "services.gamification.app:app", "--host", "0.0.0.0", "--port", "8012"]
