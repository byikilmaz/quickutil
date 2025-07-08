'use client';
import { useState, useEffect } from 'react';
import { CubeTransparentIcon, ArrowDownTrayIcon, PhotoIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import Breadcrumb from '@/components/Breadcrumb';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityTracker } from '@/lib/activityTracker';
import { 
  resizeImage,
  getImageDimensions,
  formatFileSize,
  type ConversionResult,
  type ResizeOptions 
} from '@/lib/imageUtils';

type Stage = 'upload' | 'settings' | 'result';
type ResizeMode = 'pixels' | 'percentage';

export default function ImageResize() {
  const [stage, setStage] = useState<Stage>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [percentageValue, setPercentageValue] = useState<number>(100);
  const [resizeMode, setResizeMode] = useState<ResizeMode>('pixels');
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [doNotEnlarge, setDoNotEnlarge] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resizeResult, setResizeResult] = useState<ConversionResult | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const { user } = useAuth();

  const validateFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return 'Lütfen geçerli bir resim dosyası seçin (JPEG, PNG, WebP, GIF)';
    }
    
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return 'Dosya boyutu 50MB\'dan küçük olmalıdır';
    }
    
    return null;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => handleFileSelect(acceptedFiles),
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    multiple: false
  });

  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return;
    
    const selectedFile = files[0];
    const validationError = validateFile(selectedFile);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setFile(selectedFile);
    
    // Create preview URL
    const preview = URL.createObjectURL(selectedFile);
    setPreviewUrl(preview);
    
    // Get original dimensions
    try {
      const dimensions = await getImageDimensions(selectedFile);
      setOriginalDimensions(dimensions);
      setWidth(dimensions.width);
      setHeight(dimensions.height);
      setStage('settings');
    } catch (err) {
      setError('Resim boyutları alınamadı');
    }
  };

  const handleResize = async () => {
    if (!file || !originalDimensions) return;

    let finalWidth: number;
    let finalHeight: number;

    if (resizeMode === 'percentage') {
      finalWidth = Math.round(originalDimensions.width * (percentageValue / 100));
      finalHeight = Math.round(originalDimensions.height * (percentageValue / 100));
    } else {
      finalWidth = width || originalDimensions.width;
      finalHeight = height || originalDimensions.height;
    }

    // Check enlarge restriction
    if (doNotEnlarge && (finalWidth > originalDimensions.width || finalHeight > originalDimensions.height)) {
      setError('Resim büyütme devre dışı. Mevcut boyuttan küçük bir boyut seçin.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const options: ResizeOptions = {
        width: finalWidth,
        height: finalHeight,
        maintainAspectRatio: false // We handle aspect ratio ourselves
      };

      const result = await resizeImage(file, options);
      setResizeResult(result);
      setStage('result');

      // Track activity
      if (user) {
        await ActivityTracker.createActivity(user.uid, {
          type: 'image_resize',
          fileName: result.file.name,
          originalFileName: file.name,
          fileSize: file.size,
          processedSize: result.file.size,
          status: 'success',
          category: 'Image',
          processingTime: Date.now()
        });
      }
    } catch (err) {
      console.error('Resize error:', err);
      setError('Boyutlandırma sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (resizeResult) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(resizeResult.file);
      link.download = resizeResult.file.name;
      link.click();
    }
  };

  const resetForm = () => {
    setStage('upload');
    setFile(null);
    setResizeResult(null);
    setError(null);
    setWidth(undefined);
    setHeight(undefined);
    setPercentageValue(100);
    
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleWidthChange = (value: string) => {
    const newWidth = value ? parseInt(value) : undefined;
    setWidth(newWidth);
    
    if (maintainAspectRatio && newWidth && originalDimensions) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      setHeight(Math.round(newWidth / aspectRatio));
    }
  };

  const handleHeightChange = (value: string) => {
    const newHeight = value ? parseInt(value) : undefined;
    setHeight(newHeight);
    
    if (maintainAspectRatio && newHeight && originalDimensions) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  const handlePercentageChange = (value: string) => {
    const newPercentage = value ? parseFloat(value) : 100;
    setPercentageValue(newPercentage);
  };

  // Cleanup preview URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Upload Stage */}
      {stage === 'upload' && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Breadcrumb />
          
          {/* Simplified Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📐 Resize Image</h1>
            <p className="text-gray-600">Quickly and easily resize your images to any dimension</p>
          </div>

          {/* Upload Area */}
          <div className="max-w-xl mx-auto">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 bg-white ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <PhotoIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isDragActive ? 'Drop your image here' : 'Select image file'}
              </h3>
              <p className="text-gray-600 mb-4">
                JPEG/JPG, PNG, WebP, GIF • Max 50MB
              </p>
              
              <div className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block cursor-pointer">
                Select Image
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700">{error}</p>
                </div>
              )}
            </div>

            {/* Format Support */}
            <div className="mt-6 text-center">
              <div className="flex justify-center items-center space-x-3 text-sm">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">JPEG/JPG</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-medium">PNG</span>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">WebP</span>
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded font-medium">GIF</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Stage - ILoveIMG Style Layout */}
      {stage === 'settings' && file && previewUrl && originalDimensions && (
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CubeTransparentIcon className="w-6 h-6 text-blue-600" />
                  <h1 className="text-xl font-semibold text-gray-900">Resize Image</h1>
                </div>
                <button
                  onClick={resetForm}
                  className="text-gray-600 hover:text-gray-900 px-3 py-1 rounded-lg hover:bg-gray-100"
                >
                  Select New Image
                </button>
              </div>
            </div>
          </div>

          {/* Main Layout - ILoveIMG Style */}
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Left Side - Image Preview */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="bg-gray-50 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-w-full max-h-[400px] object-contain rounded-lg shadow-sm"
                    />
                  </div>
                  <div className="mt-4 text-center text-sm text-gray-600">
                    <p className="font-medium">{file.name}</p>
                    <p>{formatFileSize(file.size)} • {originalDimensions.width}×{originalDimensions.height}</p>
                  </div>
                </div>
              </div>

              {/* Right Side - Resize Options Panel */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Resize options</h2>
                  
                  {/* Resize Mode Toggle */}
                  <div className="mb-6">
                    <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setResizeMode('pixels')}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                          resizeMode === 'pixels'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        By pixels
                      </button>
                      <button
                        onClick={() => setResizeMode('percentage')}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                          resizeMode === 'percentage'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        By percentage
                      </button>
                    </div>
                  </div>

                  {/* Resize Controls */}
                  {resizeMode === 'pixels' ? (
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Width (px):
                        </label>
                        <input
                          type="number"
                          value={width || ''}
                          onChange={(e) => handleWidthChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Width"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Height (px):
                        </label>
                        <input
                          type="number"
                          value={height || ''}
                          onChange={(e) => handleHeightChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Height"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resize to % of original:
                      </label>
                      <input
                        type="number"
                        value={percentageValue}
                        onChange={(e) => handlePercentageChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                        max="500"
                        step="1"
                      />
                    </div>
                  )}

                  {/* Options */}
                  <div className="space-y-3 mb-8">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={maintainAspectRatio}
                        onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Maintain aspect ratio</span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={doNotEnlarge}
                        onChange={(e) => setDoNotEnlarge(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Do not enlarge if smaller</span>
                    </label>
                  </div>

                  {/* Resize Button */}
                  <button
                    onClick={handleResize}
                    disabled={loading || (resizeMode === 'pixels' && !width && !height)}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Resizing...</span>
                      </>
                    ) : (
                      <>
                        <CubeTransparentIcon className="w-5 h-5" />
                        <span>Resize IMAGES</span>
                      </>
                    )}
                  </button>
                  
                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result Stage */}
      {stage === 'result' && resizeResult && (
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b">
            <div className="max-w-4xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  <h1 className="text-xl font-semibold text-gray-900">✅ Resize Complete!</h1>
                </div>
                <button
                  onClick={resetForm}
                  className="text-gray-600 hover:text-gray-900 px-3 py-1 rounded-lg hover:bg-gray-100"
                >
                  Resize Another
                </button>
              </div>
            </div>
          </div>

          {/* Result Content */}
          <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              {/* Success Icon */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">🎉 Image Resized Successfully!</h2>
              <p className="text-gray-600 mb-6">Your image has been resized and is ready for download</p>
              
              {/* Result Preview */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <img
                  src={URL.createObjectURL(resizeResult.file)}
                  alt="Resized image"
                  className="max-w-full max-h-64 object-contain mx-auto rounded-lg"
                />
              </div>
              
              {/* File Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-lg font-semibold text-blue-600">{formatFileSize(resizeResult.file.size)}</p>
                  <p className="text-sm text-gray-600">File Size</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-lg font-semibold text-green-600">
                    {width && height ? `${width}×${height}` : 'Custom'}
                  </p>
                  <p className="text-sm text-gray-600">Dimensions</p>
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                <span>📥 Download Resized Image</span>
              </button>
            </div>

            {/* Another Action */}
            <div className="mt-6 text-center">
              <button
                onClick={resetForm}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Resize Another Image →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
} 