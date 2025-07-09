#!/bin/bash

# QuickUtil Image Compression API - Render.com Deploy Script

echo "🚀 Starting QuickUtil Image Compression API deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "🔧 Setting up environment..."

# Create uploads directory if it doesn't exist
mkdir -p uploads

echo "✅ Image Compression API ready for deployment!"
echo "🌍 API will be available at: https://quickutil-image-api.onrender.com"

# Start the application (this will be called by Render)
echo "🎯 Starting Flask application..."
python image_compression_api.py 