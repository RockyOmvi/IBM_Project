# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /code

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the app code
COPY ./app ./app

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Expose the port
EXPOSE 8080

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
