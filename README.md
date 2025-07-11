# QuickUtil Image Processing API

Advanced image processing microservice with professional features for the QuickUtil platform.

## Features

### 🖼️ **Image Processing**
- **Compression**: Advanced compression with quality control
- **Format Conversion**: PNG, JPEG, WebP, BMP, TIFF support
- **HEIC Support**: HEIC/HEIF to JPEG conversion
- **Resize**: Smart resizing with aspect ratio control
- **Crop**: Precise image cropping
- **Rotate**: Image rotation with quality preservation
- **Filters**: Professional image filters (brightness, contrast, saturation, blur, sharpness)

### 🚀 **Performance**
- **Fast Processing**: Optimized algorithms with PIL/Pillow
- **Batch Support**: Multiple file processing capabilities
- **Memory Efficient**: Automatic cleanup and optimization
- **Cloud Ready**: Designed for Render.com deployment

### 🔒 **Security**
- **CORS Protection**: Configured for quickutil.app domain
- **File Validation**: Strict file type and size checking
- **Automatic Cleanup**: Temporary file management

## API Endpoints

### **Basic Information**
- `GET /` - API information and available endpoints
- `GET /health` - Health check endpoint

### **Image Processing**
- `POST /compress` - Compress images with quality control
- `POST /convert` - Convert between image formats
- `POST /heic-convert` - Convert HEIC/HEIF to JPEG
- `POST /resize` - Resize images with aspect ratio control
- `POST /crop` - Crop images with precise coordinates
- `POST /rotate` - Rotate images by degrees
- `POST /filters` - Apply image filters

## Usage Examples

### **Image Compression**
```bash
curl -X POST https://your-image-api.onrender.com/compress \
  -F "file=@image.jpg" \
  -F "quality=85" \
  -F "format=jpeg" \
  -F "max_width=1920" \
  -F "max_height=1080"
```

### **Format Conversion**
```bash
curl -X POST https://your-image-api.onrender.com/convert \
  -F "file=@image.png" \
  -F "format=webp" \
  -F "quality=80"
```

### **HEIC Conversion**
```bash
curl -X POST https://your-image-api.onrender.com/heic-convert \
  -F "file=@image.heic" \
  -F "quality=90"
```

### **Image Resize**
```bash
curl -X POST https://your-image-api.onrender.com/resize \
  -F "file=@image.jpg" \
  -F "width=800" \
  -F "height=600" \
  -F "maintain_aspect=true"
```

### **Image Crop**
```bash
curl -X POST https://your-image-api.onrender.com/crop \
  -F "file=@image.jpg" \
  -F "x=100" \
  -F "y=50" \
  -F "width=500" \
  -F "height=400"
```

### **Image Rotation**
```bash
curl -X POST https://your-image-api.onrender.com/rotate \
  -F "file=@image.jpg" \
  -F "angle=90"
```

### **Image Filters**
```bash
curl -X POST https://your-image-api.onrender.com/filters \
  -F "file=@image.jpg" \
  -F "brightness=1.2" \
  -F "contrast=1.1" \
  -F "saturation=1.0" \
  -F "sharpness=1.1" \
  -F "blur=0"
```

## Installation

### **Local Development**
```bash
# Clone repository
git clone https://github.com/byikilmaz/quickutil-image-api.git
cd quickutil-image-api

# Install dependencies
pip install -r requirements.txt

# Run locally
python app.py
```

### **Docker Deployment**
```bash
# Build image
docker build -t quickutil-image-api .

# Run container
docker run -p 5000:5000 quickutil-image-api
```

### **Render.com Deployment**
1. Connect GitHub repository to Render.com
2. Use `render.yaml` for automatic deployment
3. Set environment variables if needed

## Technical Specifications

### **Supported Formats**
- **Input**: PNG, JPEG, GIF, BMP, WebP, TIFF, HEIC, HEIF
- **Output**: PNG, JPEG, WebP, BMP, TIFF

### **File Limits**
- **Max File Size**: 50MB
- **Processing Timeout**: 120 seconds
- **Automatic Cleanup**: 5 minutes

### **Dependencies**
- **Flask**: Web framework
- **Pillow**: Image processing library
- **pillow-heif**: HEIC/HEIF support
- **Flask-CORS**: Cross-origin resource sharing

## Architecture

### **Microservice Design**
- **Separation of Concerns**: Dedicated image processing service
- **Stateless**: No session management, fully stateless
- **RESTful API**: Standard HTTP methods and status codes
- **Error Handling**: Comprehensive error responses

### **Integration with QuickUtil**
- **Frontend**: Next.js application calls image API
- **Authentication**: CORS-based security
- **File Transfer**: Direct file upload/download
- **Response Format**: JSON metadata + binary file response

## Environment Variables

- `PORT`: Server port (default: 5000)
- `PYTHONUNBUFFERED`: Python output buffering (recommended: 1)

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error description"
}
```

HTTP Status Codes:
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `413`: Payload Too Large
- `500`: Internal Server Error
- `501`: Not Implemented (HEIC support unavailable)

## Security

### **CORS Configuration**
- Allowed Origins: `quickutil.app`, `quickutil-d2998.web.app`, `localhost:3000`
- Allowed Methods: `POST`, `OPTIONS`
- Allowed Headers: `Content-Type`, `Authorization`

### **File Validation**
- Extension checking
- MIME type validation
- File size limits
- Content inspection

## Monitoring

### **Health Check**
```bash
curl https://your-image-api.onrender.com/health
```

### **Service Information**
```bash
curl https://your-image-api.onrender.com/
```

## License

This project is part of the QuickUtil platform.

## Support

For issues and feature requests, please contact the QuickUtil team.
