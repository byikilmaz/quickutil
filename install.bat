@echo off
:: 🔥 Professional PDF Compressor - Windows Installation Script
:: Automatically installs Python dependencies and guides Ghostscript installation

echo.
echo 🔥 Professional PDF Compressor - Windows Installation Script
echo ============================================================
echo.

:: Check if Python is installed
echo ℹ️ Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo.
    echo 📦 Please install Python 3.6+ first:
    echo    https://www.python.org/downloads/
    echo    ✅ Make sure to check "Add Python to PATH" during installation
    echo.
    pause
    exit /b 1
)

for /f "tokens=2" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo ✅ Python %PYTHON_VERSION% found

:: Check if Ghostscript is installed
echo.
echo ℹ️ Checking Ghostscript installation...
gswin64c --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Ghostscript is already installed
    goto :install_python_deps
)

gswin32c --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Ghostscript is already installed
    goto :install_python_deps
)

gs --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Ghostscript is already installed
    goto :install_python_deps
)

:: Ghostscript not found
echo ❌ Ghostscript not found
echo.
echo 📦 Please install Ghostscript manually:
echo    1. Go to: https://www.ghostscript.com/download/gsdnld.html
echo    2. Download "GPL Ghostscript" for Windows (64-bit recommended)
echo    3. Install with default settings
echo    4. Restart this script after installation
echo.
echo 💡 Alternative: If you have Chocolatey installed:
echo    choco install ghostscript
echo.
pause
exit /b 1

:install_python_deps
echo.
echo ℹ️ Installing Python dependencies...

:: Create virtual environment
echo ℹ️ Creating virtual environment...
python -m venv pdf_compressor_env
if %errorlevel% neq 0 (
    echo ❌ Failed to create virtual environment
    pause
    exit /b 1
)

:: Activate virtual environment
echo ℹ️ Activating virtual environment...
call pdf_compressor_env\Scripts\activate.bat

:: Upgrade pip
echo ℹ️ Upgrading pip...
python -m pip install --upgrade pip

:: Install requirements
if exist requirements.txt (
    echo ℹ️ Installing from requirements.txt...
    pip install -r requirements.txt
) else (
    echo ℹ️ Installing basic requirements...
    pip install Flask==2.3.3 Flask-CORS==4.0.0 Werkzeug==2.3.7
)

if %errorlevel% neq 0 (
    echo ❌ Failed to install Python dependencies
    pause
    exit /b 1
)

echo ✅ Python dependencies installed successfully

:: Test installation
echo.
echo ℹ️ Testing installation...

if exist pdf_compressor_pro.py (
    echo ℹ️ Testing PDF compressor...
    python -c "from pdf_compressor_pro import check_ghostscript_installation; print('✅ PDF Compressor test passed' if check_ghostscript_installation() else '❌ PDF Compressor test failed')"
) else (
    echo ⚠️ pdf_compressor_pro.py not found, skipping compressor test
)

:: Success message
echo.
echo ✅ 🎉 Installation completed successfully!
echo.
echo 📋 Next steps:
echo    1. Activate virtual environment:
echo       pdf_compressor_env\Scripts\activate.bat
echo.
echo    2. Test with a PDF file:
echo       python pdf_compressor_pro.py input.pdf output.pdf screen
echo.
echo    3. Start API server:
echo       python pdf_api_server.py
echo.
echo    4. Run examples:
echo       python example_usage.py
echo.
echo 📚 Documentation: README_PDF_COMPRESSOR.md
echo 🆘 Support: Check troubleshooting section in README
echo.
echo Press any key to exit...
pause >nul 