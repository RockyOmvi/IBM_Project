FROM python:3.11-slim

WORKDIR /code

# Copy requirements from backend directory
COPY backend/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the app code
COPY backend/app ./app

# Copy static files and templates
COPY static /static
COPY index.html /index.html
COPY chat.html /chat.html

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Expose the port
EXPOSE 8080

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
