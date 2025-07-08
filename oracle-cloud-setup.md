# 🔥 Oracle Cloud PDF Compression API Setup
**iLovePDF seviyesinde ücretsiz compression service**

## 🎯 Oracle Cloud Always Free Benefits

- ✅ **2x AMD EPYC Compute instances** (Octa-core processors)
- ✅ **Up to 24GB RAM total** (12GB per instance) 
- ✅ **200GB Block Volume storage**
- ✅ **10GB Object Storage**
- ✅ **10TB outbound data transfer/month**
- ✅ **2 Public IPs**
- ✅ **1 Load Balancer (10Mbps)**
- ✅ **Always Free - No time limits**

## 🚀 Step-by-Step Deployment

### Step 1: Oracle Cloud Account Setup

1. **Create Account**: https://cloud.oracle.com/en_US/tryit
2. **Verify Identity**: Credit card needed (not charged for Always Free)
3. **Choose Home Region**: Select closest region (e.g., Frankfurt, London)
4. **Wait for Activation**: Usually takes 5-10 minutes

### Step 2: Create Compute Instance

```bash
# Instance Configuration
Name: pdf-compressor-api
Image: Ubuntu 22.04 LTS
Shape: VM.Standard.E2.1.Micro (Always Free)
  - 1 OCPU (Octa-core AMD EPYC)
  - 1GB RAM
  - Always Free eligible

# Networking
VCN: Create new VCN with default settings
Subnet: Public subnet (auto-created)
Public IP: Assign public IP address

# SSH Keys
Upload your SSH public key or generate new pair
```

### Step 3: Security Group Rules

```bash
# Open necessary ports in Security List
Ingress Rules:
- Port 22 (SSH): Source 0.0.0.0/0
- Port 80 (HTTP): Source 0.0.0.0/0  
- Port 443 (HTTPS): Source 0.0.0.0/0
- Port 5000 (Flask): Source 0.0.0.0/0 (development only)

# Ubuntu firewall setup
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Step 4: Instance Initial Setup

```bash
# Connect to instance
ssh -i your-key.pem ubuntu@YOUR_PUBLIC_IP

# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y \
  python3 \
  python3-pip \
  python3-venv \
  ghostscript \
  nginx \
  git \
  htop \
  curl \
  certbot \
  python3-certbot-nginx

# Verify Ghostscript
gs --version
```

### Step 5: Deploy PDF Compression Service

```bash
# Clone repository (or upload files)
git clone https://github.com/byikilmaz/quickutil.git
cd quickutil

# Create Python virtual environment
python3 -m venv pdf-compressor-env
source pdf-compressor-env/bin/activate

# Install dependencies
pip install Flask==3.0.0 Flask-CORS==4.0.0 Werkzeug==3.0.1 gunicorn==21.2.0

# Test compression engine
python3 pdf_compressor_focused.py

# Test Flask API
python3 flask_pdf_api.py &
curl http://localhost:5000/health
```

### Step 6: Production Configuration

```bash
# Create systemd service
sudo nano /etc/systemd/system/pdf-compressor.service
```

```ini
[Unit]
Description=PDF Compression API
After=network.target

[Service]
Type=notify
User=ubuntu
WorkingDirectory=/home/ubuntu/quickutil
Environment=PATH=/home/ubuntu/quickutil/pdf-compressor-env/bin
ExecStart=/home/ubuntu/quickutil/pdf-compressor-env/bin/gunicorn --workers 2 --bind 127.0.0.1:5000 flask_pdf_api:app
ExecReload=/bin/kill -s HUP $MAINPID
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable pdf-compressor
sudo systemctl start pdf-compressor
sudo systemctl status pdf-compressor
```

### Step 7: Nginx Reverse Proxy

```bash
# Configure nginx
sudo nano /etc/nginx/sites-available/pdf-compressor
```

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    location / {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # File upload settings
        client_max_body_size 100M;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:5000/health;
        access_log off;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/pdf-compressor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 8: SSL Certificate (Optional)

```bash
# Get free SSL certificate with Let's Encrypt
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

### Step 9: Monitoring & Maintenance

```bash
# Check service status
sudo systemctl status pdf-compressor
sudo systemctl status nginx

# View logs
sudo journalctl -u pdf-compressor -f
sudo tail -f /var/log/nginx/access.log

# Monitor resources
htop
df -h
free -h

# Test API
curl -X POST \
  -F "file=@test.pdf" \
  -F "quality=/screen" \
  http://YOUR_DOMAIN/compress
```

## 🔗 QuickUtil.app Integration

### Environment Variables

```typescript
// .env.local
NEXT_PUBLIC_PYTHON_COMPRESSION_API=https://your-oracle-domain.com
```

### Firebase Functions Integration

```typescript
// functions/src/index.ts
const ORACLE_API_URL = process.env.ORACLE_COMPRESSION_API;

export const compressPDFOracle = functions.https.onCall(async (data, context) => {
  try {
    // Download file from Firebase Storage
    const tempInput = await downloadFromStorage(data.fileUrl);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(tempInput));
    formData.append('quality', data.quality || '/screen');
    
    // Call Oracle Cloud API
    const response = await fetch(`${ORACLE_API_URL}/compress`, {
      method: 'POST',
      body: formData,
      timeout: 300000 // 5 minutes
    });
    
    if (!response.ok) {
      throw new Error(`Oracle API error: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Download compressed file
    const compressedResponse = await fetch(`${ORACLE_API_URL}${result.download_url}`);
    const compressedBuffer = await compressedResponse.arrayBuffer();
    
    // Upload to Firebase Storage
    const compressedUrl = await uploadToStorage(
      Buffer.from(compressedBuffer),
      `compressed_${Date.now()}.pdf`
    );
    
    return {
      success: true,
      originalSize: result.original_size_formatted,
      compressedSize: result.compressed_size_formatted,
      compressionRatio: result.compression_ratio,
      downloadUrl: compressedUrl,
      executionTime: result.execution_time
    };
    
  } catch (error) {
    console.error('Oracle compression error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

### React Component Integration

```typescript
// src/lib/oracleCompression.ts
export const compressWithOracle = async (file: File, quality: string = '/screen') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('quality', quality);
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_COMPRESSION_API}/compress`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Oracle compression failed');
    }
    
    const result = await response.json();
    
    // Download compressed file
    const downloadResponse = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_COMPRESSION_API}${result.download_url}`);
    const blob = await downloadResponse.blob();
    
    return {
      success: true,
      blob,
      compressionRatio: result.compression_ratio,
      originalSize: result.original_size_formatted,
      compressedSize: result.compressed_size_formatted,
      executionTime: result.execution_time
    };
    
  } catch (error) {
    console.error('Oracle compression error:', error);
    throw error;
  }
};
```

## 📊 Performance Optimization

### Instance Performance Tuning

```bash
# Optimize for PDF processing
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
echo 'vm.vfs_cache_pressure=50' | sudo tee -a /etc/sysctl.conf

# Apply changes
sudo sysctl -p

# Monitor performance
htop
iostat -x 1
iftop
```

### Gunicorn Optimization

```bash
# Optimize worker count for 1GB RAM
# Formula: (2 x CPU cores) + 1 = 2 workers for 1 core
sudo nano /etc/systemd/system/pdf-compressor.service

# Update ExecStart line:
ExecStart=/home/ubuntu/quickutil/pdf-compressor-env/bin/gunicorn \
  --workers 2 \
  --worker-class sync \
  --max-requests 1000 \
  --max-requests-jitter 100 \
  --timeout 300 \
  --keep-alive 2 \
  --bind 127.0.0.1:5000 \
  flask_pdf_api:app
```

### Memory Management

```python
# Add to flask_pdf_api.py
import gc
import psutil

@app.after_request
def cleanup_memory(response):
    """Clean up memory after each request"""
    gc.collect()
    
    # Log memory usage
    memory = psutil.virtual_memory()
    if memory.percent > 80:
        app.logger.warning(f"High memory usage: {memory.percent}%")
    
    return response
```

## 🚀 Expected Performance

### Oracle Cloud Always Free Instance:
- **Single PDF (10MB)**: ~3-8 seconds
- **Concurrent requests**: 2-3 simultaneous 
- **Memory usage**: ~200-400MB per process
- **Daily capacity**: ~500-1000 PDF compressions
- **Monthly traffic**: Up to 10TB (more than enough)

### Compression Results:
- **Small PDFs (1-10MB)**: 80-90% compression
- **Medium PDFs (10-50MB)**: 85-95% compression  
- **Large PDFs (50-100MB)**: 75-85% compression

## 🔧 Troubleshooting

### Common Issues

1. **Out of Memory**:
```bash
# Check memory usage
free -h
# Restart service if needed
sudo systemctl restart pdf-compressor
```

2. **Ghostscript Not Found**:
```bash
# Reinstall Ghostscript
sudo apt remove ghostscript
sudo apt install ghostscript
gs --version
```

3. **API Timeout**:
```bash
# Increase timeout in nginx
sudo nano /etc/nginx/sites-available/pdf-compressor
# Add: proxy_read_timeout 600;
sudo systemctl restart nginx
```

4. **High CPU Usage**:
```bash
# Monitor processes
htop
# Reduce worker count if needed
sudo nano /etc/systemd/system/pdf-compressor.service
```

## 💰 Cost Analysis

### Oracle Always Free vs Alternatives:

| Feature | Oracle Free | DigitalOcean | AWS |
|---------|-------------|--------------|-----|
| **Monthly Cost** | **$0** | $6 | $15+ |
| **Annual Cost** | **$0** | $72 | $180+ |
| **CPU** | 1 OCPU | 1 vCPU | 1 vCPU |
| **RAM** | 1GB | 1GB | 1GB |
| **Storage** | 47GB | 25GB | 8GB |
| **Bandwidth** | 10TB | 1TB | 1GB |
| **Time Limit** | **Forever** | Paid | Paid |

**🎉 Result: Oracle Cloud saves $72-180+ per year!**

---

## ✅ Deployment Checklist

- [ ] Oracle Cloud account created
- [ ] Always Free instance launched
- [ ] Ghostscript installed and tested  
- [ ] Python environment configured
- [ ] PDF compression service deployed
- [ ] Nginx reverse proxy configured
- [ ] SSL certificate installed (optional)
- [ ] API endpoints tested
- [ ] QuickUtil.app integration completed
- [ ] Monitoring setup completed

**🎯 Result: 100% free, unlimited PDF compression at iLovePDF level!** 