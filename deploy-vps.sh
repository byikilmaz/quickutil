#!/bin/bash

# 🔥 QuickUtil PDF Compression Service - VPS Deployment Script
# Cost: $6/month DigitalOcean Droplet = $72/year
# Capacity: UNLIMITED compressions!

set -e

echo "🚀 QuickUtil PDF Compression - VPS Deployment"
echo "=============================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

print_info "Installing system dependencies..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
if ! command -v docker &> /dev/null; then
    print_info "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    print_status "Docker installed"
else
    print_status "Docker already installed"
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_info "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_status "Docker Compose installed"
else
    print_status "Docker Compose already installed"
fi

# Install additional tools
sudo apt install -y curl wget htop nano ufw nginx-utils

print_info "Setting up firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

print_status "Firewall configured"

# Create application directory
APP_DIR="/opt/quickutil-pdf"
print_info "Creating application directory: $APP_DIR"
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Clone or update repository (assuming files are already uploaded)
cd $APP_DIR

print_info "Setting up environment..."

# Create necessary directories
mkdir -p temp_uploads
mkdir -p ssl
mkdir -p logs

# Set correct permissions
chmod 755 temp_uploads
chmod 755 logs

print_info "Building Docker containers..."
docker-compose build

print_info "Starting services..."
docker-compose up -d

# Wait for services to start
sleep 30

# Check if services are running
print_info "Checking service health..."
if docker-compose ps | grep -q "Up"; then
    print_status "Services are running!"
    
    # Test the API
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        print_status "PDF Compression API is healthy!"
    else
        print_warning "API health check failed"
    fi
else
    print_error "Services failed to start"
    docker-compose logs
    exit 1
fi

print_info "Setting up SSL certificate..."
print_warning "Manual step required:"
echo "1. Point your domain to this server's IP"
echo "2. Run: sudo certbot --nginx -d your-domain.com"
echo "3. Update nginx.conf with your domain name"

print_status "Deployment completed!"
echo ""
echo "🎯 Next steps:"
echo "1. Update your domain DNS to point to this server"
echo "2. Configure SSL certificate with Let's Encrypt"
echo "3. Update Firebase Functions with your domain URL"
echo "4. Test PDF compression with large files"
echo ""
echo "💰 Cost analysis:"
echo "   - VPS: $6/month = $72/year"
echo "   - Capacity: UNLIMITED compressions"
echo "   - vs External service: $240+/year for high volume"
echo ""
echo "🔗 Your PDF Compression API will be available at:"
echo "   https://your-domain.com/compress"
echo ""
print_status "QuickUtil PDF Compression Service is ready! 🚀" 