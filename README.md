# QuickUtil PDF Compression API

iLovePDF-level PDF compression using Ghostscript backend. Deployed on Render.com.

## Features

- 🚀 **iLovePDF-level compression** using Ghostscript
- 📊 **4 compression levels**: Screen (80-90%), Ebook (60-80%), Printer (40-60%), Prepress (20-40%)
- ⚡ **High performance** with automatic cleanup
- 🔒 **Secure** file handling with UUID-based temporary storage
- 📱 **CORS enabled** for web app integration
- 🧹 **Auto cleanup** of temporary files

## API Endpoints

### GET /health
Health check endpoint

### POST /compress
Compress PDF file
- **file**: PDF file (max 100MB)
- **quality**: screen | ebook | printer | prepress

### GET /download/<file_id>
Download compressed PDF file

## Deployment

### Render.com
1. Connect GitHub repository
2. Auto-deployment with render.yaml
3. Ghostscript pre-installed on Render.com

### Local Development
```bash
pip install -r requirements.txt
python app.py
```

## Compression Quality

- **screen**: Maximum compression (80-90% reduction) - 72 DPI
- **ebook**: High compression (60-80% reduction) - 150 DPI  
- **printer**: Medium compression (40-60% reduction) - 300 DPI
- **prepress**: Light compression (20-40% reduction) - High quality

## Integration

Used by QuickUtil.app Firebase Functions for server-side PDF compression.

## Security

- Secure filename handling
- Automatic file cleanup (1 hour)
- UUID-based file tracking
- Error logging and monitoring
