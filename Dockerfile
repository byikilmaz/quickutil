FROM python:3.9-slim

# Install system dependencies including Ghostscript
RUN apt-get update && apt-get install -y \
    ghostscript \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY pdf_compressor_pro.py .
COPY pdf_api_server.py .

# Create directories for file processing
RUN mkdir -p temp_uploads

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV FLASK_ENV=production

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Start the API server
CMD ["python", "pdf_api_server.py"] 