#!/bin/bash
# 🔥 Professional PDF Compressor - Easy Installation Script
# Automatically installs Ghostscript and Python dependencies

echo "🔥 Professional PDF Compressor - Installation Script"
echo "====================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# Detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/debian_version ]; then
            OS="ubuntu"
        elif [ -f /etc/redhat-release ]; then
            OS="centos"
        else
            OS="linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        OS="windows"
    else
        OS="unknown"
    fi
}

# Install Ghostscript
install_ghostscript() {
    print_info "Installing Ghostscript..."
    
    case $OS in
        "ubuntu")
            sudo apt-get update
            sudo apt-get install -y ghostscript
            ;;
        "centos")
            sudo yum install -y ghostscript
            ;;
        "macos")
            if command -v brew &> /dev/null; then
                brew install ghostscript
            else
                print_error "Homebrew not found. Please install Homebrew first:"
                print_info "/bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
                exit 1
            fi
            ;;
        "windows")
            print_warning "Windows detected. Please manually download and install Ghostscript:"
            print_info "https://www.ghostscript.com/download/gsdnld.html"
            print_info "After installation, add Ghostscript to your PATH"
            ;;
        *)
            print_error "Unsupported OS. Please install Ghostscript manually."
            exit 1
            ;;
    esac
}

# Check if Ghostscript is installed
check_ghostscript() {
    print_info "Checking Ghostscript installation..."
    
    if command -v gs &> /dev/null; then
        GS_VERSION=$(gs --version 2>/dev/null)
        print_status "Ghostscript is installed (version: $GS_VERSION)"
        return 0
    else
        return 1
    fi
}

# Install Python dependencies
install_python_deps() {
    print_info "Installing Python dependencies..."
    
    # Check if Python 3 is available
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3.6+ first."
        exit 1
    fi
    
    PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
    print_info "Using Python $PYTHON_VERSION"
    
    # Create virtual environment
    print_info "Creating virtual environment..."
    python3 -m venv pdf_compressor_env
    
    # Activate virtual environment
    source pdf_compressor_env/bin/activate
    
    # Upgrade pip
    print_info "Upgrading pip..."
    pip install --upgrade pip
    
    # Install requirements
    if [ -f "requirements.txt" ]; then
        print_info "Installing from requirements.txt..."
        pip install -r requirements.txt
    else
        print_info "Installing basic requirements..."
        pip install Flask==2.3.3 Flask-CORS==4.0.0 Werkzeug==2.3.7
    fi
    
    print_status "Python dependencies installed successfully"
}

# Test installation
test_installation() {
    print_info "Testing installation..."
    
    # Test Ghostscript
    if ! check_ghostscript; then
        print_error "Ghostscript test failed"
        return 1
    fi
    
    # Test Python script (if available)
    if [ -f "pdf_compressor_pro.py" ]; then
        print_info "Testing PDF compressor..."
        source pdf_compressor_env/bin/activate
        python3 -c "
try:
    from pdf_compressor_pro import check_ghostscript_installation
    if check_ghostscript_installation():
        print('✅ PDF Compressor test passed')
    else:
        print('❌ PDF Compressor test failed')
        exit(1)
except ImportError:
    print('⚠️ PDF Compressor script not found, but dependencies are installed')
except Exception as e:
    print(f'❌ Test failed: {e}')
    exit(1)
"
    else
        print_warning "pdf_compressor_pro.py not found, skipping compressor test"
    fi
    
    print_status "Installation test completed successfully"
}

# Main installation process
main() {
    echo
    print_info "Starting installation process..."
    
    # Detect operating system
    detect_os
    print_info "Detected OS: $OS"
    
    # Check if Ghostscript is already installed
    if check_ghostscript; then
        print_info "Ghostscript is already installed, skipping installation"
    else
        print_info "Ghostscript not found, installing..."
        install_ghostscript
        
        # Verify installation
        if ! check_ghostscript; then
            print_error "Ghostscript installation failed"
            exit 1
        fi
    fi
    
    # Install Python dependencies
    install_python_deps
    
    # Test installation
    test_installation
    
    echo
    print_status "🎉 Installation completed successfully!"
    echo
    print_info "📋 Next steps:"
    echo "   1. Activate virtual environment:"
    echo "      source pdf_compressor_env/bin/activate"
    echo
    echo "   2. Test with a PDF file:"
    echo "      python3 pdf_compressor_pro.py input.pdf output.pdf screen"
    echo
    echo "   3. Start API server:"
    echo "      python3 pdf_api_server.py"
    echo
    echo "   4. Run examples:"
    echo "      python3 example_usage.py"
    echo
    print_info "📚 Documentation: README_PDF_COMPRESSOR.md"
    print_info "🆘 Support: Check troubleshooting section in README"
    echo
}

# Run if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 