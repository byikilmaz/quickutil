# QuickUtil PDF Compression API

🔥 **Profesyonel PDF Sıkıştırma API** - Ghostscript ile %80-90 boyut azaltma

## 🎯 Özellikler

- ⚡ **Ghostscript Powered**: Profesyonel sıkıştırma motoru
- 🎨 **4 Kalite Seviyesi**: Screen, E-book, Printer, Prepress
- 🚀 **Yüksek Performans**: 3-8 saniyede sıkıştırma
- 📊 **%80-90 Boyut Azaltma**: iLovePDF seviyesinde sonuçlar
- 🔒 **Güvenli**: Dosyalar geçici olarak işlenir, silinir
- 🌐 **REST API**: Modern JSON-based API

## 🛠️ Teknoloji Stack

- **Python 3.11** - Modern Python
- **Flask** - Web framework
- **Gunicorn** - Production WSGI server
- **Ghostscript** - PDF compression engine
- **Render.com** - Cloud hosting platform

## 📋 API Endpoints

### Health Check
```
GET /health
```

### Compression Profiles
```
GET /profiles
```

### PDF Compression
```
POST /compress
Content-Type: multipart/form-data

Parameters:
- file: PDF file (max 50MB)
- quality: screen|ebook|printer|prepress
```

## 🚀 Quick Start

### 1. Render.com Deploy

1. Fork this repository
2. Connect to [render.com](https://render.com)
3. Create new Web Service
4. Deploy with these settings:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`

### 2. Local Development

```bash
# Clone repository
git clone https://github.com/username/quickutil-pdf-api.git
cd quickutil-pdf-api

# Install dependencies
pip install -r requirements.txt

# Install Ghostscript
# Linux: sudo apt-get install ghostscript
# macOS: brew install ghostscript

# Run server
python app.py
```

## 📊 Compression Quality

| Quality | DPI | Target Compression | Use Case |
|---------|-----|------------------|----------|
| Screen | 72 | 80-90% | Web viewing |
| E-book | 150 | 60-80% | E-readers |
| Printer | 300 | 40-60% | Standard printing |
| Prepress | 300+ | 20-40% | Professional print |

## 🔧 Environment Variables

```env
PORT=10000
MAX_CONTENT_LENGTH=52428800  # 50MB
UPLOAD_FOLDER=/tmp/uploads
```

## 🧪 API Testing

```bash
# Health check
curl https://your-app.onrender.com/health

# Get profiles
curl https://your-app.onrender.com/profiles

# Compress PDF
curl -X POST \
  -F "file=@document.pdf" \
  -F "quality=screen" \
  https://your-app.onrender.com/compress \
  --output compressed.pdf
```

## 📈 Performance

- **Response Time**: 3-8 seconds (average)
- **File Size Limit**: 50MB
- **Concurrent Requests**: 10-20 (free tier)
- **Compression Ratio**: 80-90% (screen quality)

## 🔒 Security

- Input validation for file types
- File size limits
- Temporary file cleanup
- Process timeout protection
- CORS configuration

## 🚨 Error Handling

All errors return JSON with error message:

```json
{
  "error": "Error description"
}
```

Common errors:
- `400`: Invalid file or parameters
- `413`: File too large
- `500`: Server processing error
- `503`: Service unavailable

## 📞 Support

- �� **Issues**: GitHub Issues
- 📧 **Email**: hello@quickutil.app
- 🌐 **Website**: https://quickutil.app

## 📄 License

MIT License - See LICENSE file for details

---

**Powered by QuickUtil.app** 🚀
