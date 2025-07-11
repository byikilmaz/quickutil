'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  QueueListIcon,
  PhotoIcon,
  ArrowPathIcon,
  SparklesIcon,
  CogIcon,
  ArrowDownTrayIcon,
  ScissorsIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  DocumentIcon,
  SwatchIcon,
  RectangleGroupIcon,
  AdjustmentsHorizontalIcon,
  PaintBrushIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useDropzone } from 'react-dropzone';
import StructuredData from '@/components/StructuredData';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { useQuota } from '@/contexts/QuotaContext';
import { useStorage } from '@/contexts/StorageContext';
import { getTranslations } from '@/lib/translations';
import BatchProcessor, { 
  BatchOperation, 
  BatchOperationConfig, 
  ProcessingResult,
  generateFileId,
  BatchOperations 
} from '@/lib/batchProcessor';
import { trackImageBatch } from '@/lib/activityTracker';

interface BatchFile {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: ProcessingResult;
  error?: string;
}

interface BatchOperationParams {
  quality?: number;
  format?: string;
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  x?: number;
  y?: number;
  angle?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
}

interface ImageBatchClientProps {
  locale: string;
}

type StepType = 'upload' | 'configure' | 'processing' | 'result';

export default function ImageBatchClient({ locale }: ImageBatchClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { uploadFile } = useStorage();
  
  // Refs for auto-scroll
  const uploadRef = useRef<HTMLDivElement>(null);
  const configureRef = useRef<HTMLDivElement>(null);
  const processingRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // State management
  const [currentStep, setCurrentStep] = useState<StepType>('upload');
  const [batchFiles, setBatchFiles] = useState<BatchFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<BatchOperation>('compress');
  const [operationParams, setOperationParams] = useState<BatchOperationParams>(BatchOperations.getDefaultParams('compress'));
  const [showSettings, setShowSettings] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ProcessingResult[]>([]);

  // Batch processor instance
  const [processor] = useState(() => new BatchProcessor({
    maxConcurrent: 3,
    onProgress: (fileId, progress) => {
      setBatchFiles(prev => 
        prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'processing', progress }
            : f
        )
      );
    },
    onComplete: (fileId, result) => {
      setBatchFiles(prev => 
        prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'completed', result, progress: 100 }
            : f
        )
      );
    },
    onError: (fileId, error) => {
      setBatchFiles(prev => 
        prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'error', error, progress: 0 }
            : f
        )
      );
    }
  }));

  // Translation system
  const translations = getTranslations(locale);
  
  const getText = (key: string, fallback?: string): string => {
    try {
      const result = (translations as any)?.[key];
      return typeof result === 'string' ? result : (fallback || key);
    } catch (error) {
      console.error('getText error:', error);
      return fallback || key;
    }
  };

  // Focus upload area on initial load
  useEffect(() => {
    if (currentStep === 'upload' && uploadRef.current) {
      setTimeout(() => {
        uploadRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        uploadRef.current?.focus();
      }, 500);
    }
  }, [currentStep]);

  // Auto-scroll functionality
  const scrollToStep = (step: StepType) => {
    const refs = {
      upload: uploadRef,
      configure: configureRef,
      processing: processingRef,
      result: resultRef
    };
    
    const targetRef = refs[step];
    if (targetRef?.current) {
      setTimeout(() => {
        targetRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
        // Add focus ring styling and focus
        setTimeout(() => {
          targetRef.current?.focus();
        }, 100);
      }, 500); // Increased timeout for better DOM update waiting
    }
  };

  // File upload with dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleFilesSelect(acceptedFiles);
      }
    },
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    multiple: true,
    maxFiles: 50
  });

  // File operations
  const handleFilesSelect = useCallback((files: File[]) => {
    const newBatchFiles: BatchFile[] = files.map(file => ({
      id: generateFileId(),
      file,
      status: 'pending',
      progress: 0
    }));
    
    setBatchFiles(prev => [...prev, ...newBatchFiles]);
    
    if (newBatchFiles.length > 0) {
      setCurrentStep('configure');
      // Wait for state update and DOM rendering before scrolling
      setTimeout(() => {
        scrollToStep('configure');
      }, 100);
    }
  }, []);

  const handleFileRemove = useCallback((fileId: string) => {
    setBatchFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const handleBatchClear = useCallback(() => {
    setBatchFiles([]);
    setCurrentStep('upload');
    scrollToStep('upload');
  }, []);

  // Start batch processing
  const handleStartProcessing = useCallback(async () => {
    if (batchFiles.length === 0) return;

    setIsProcessing(true);
    setCurrentStep('processing');
    scrollToStep('processing');
    setProgress(0);
    setError(null);
    
    const startTime = Date.now();

    try {
      // Reset file statuses
      setBatchFiles(prev => 
        prev.map(f => ({
          ...f,
          status: 'pending',
          progress: 0,
          error: undefined,
          result: undefined
        }))
      );

      // Configure processor
      const config: BatchOperationConfig = {
        operation: selectedOperation,
        params: operationParams
      };
      
      // Process files
      await processor.processFiles(batchFiles, config, {
        maxConcurrent: 3,
        onProgress: (fileId: string, progress: number) => {
          setBatchFiles(prev => 
            prev.map(f => 
              f.id === fileId 
                ? { ...f, progress }
                : f
            )
          );
          
          // Update overall progress
          const totalProgress = batchFiles.reduce((sum, f) => {
            const fileProgress = f.id === fileId ? progress : f.progress;
            return sum + fileProgress;
          }, 0);
          setProgress(Math.round(totalProgress / batchFiles.length));
        },
        onComplete: (fileId: string, result: ProcessingResult) => {
          setBatchFiles(prev => 
            prev.map(f => 
              f.id === fileId 
                ? { ...f, status: 'completed', result, progress: 100 }
                : f
            )
          );
        },
        onError: (fileId: string, error: string) => {
          setBatchFiles(prev => 
            prev.map(f => 
              f.id === fileId 
                ? { ...f, status: 'error', error, progress: 0 }
                : f
            )
          );
        }
      });
      
      // Track batch activity
      if (user) {
        const processingTime = Date.now() - startTime;
        const totalOriginalSize = batchFiles.reduce((sum, f) => sum + f.file.size, 0);
        const completedFiles = batchFiles.filter(f => f.status === 'completed' && f.result?.file);
        const totalProcessedSize = completedFiles.reduce((sum, f) => sum + f.result!.file!.size, 0);
        
        await trackImageBatch(
          user.uid,
          selectedOperation,
          batchFiles.length,
          totalOriginalSize,
          totalProcessedSize,
          processingTime
        );
      }

      // Move to result step
      const completedFiles = batchFiles.filter(f => f.status === 'completed');
      setResults(completedFiles.map(f => f.result!));
      setCurrentStep('result');
      scrollToStep('result');

    } catch (error) {
      console.error('Batch processing error:', error);
      setError(error instanceof Error ? error.message : 'Processing failed');
    } finally {
      setIsProcessing(false);
    }
  }, [batchFiles, selectedOperation, operationParams, processor, user]);

  // Download all processed files
  const handleBatchDownload = useCallback(async () => {
    const completedFiles = batchFiles.filter(f => f.status === 'completed' && f.result);
    
    if (completedFiles.length === 0) {
      alert(getText('imageBatch.result.noFiles', 'No processed files to download'));
      return;
    }

    try {
      completedFiles.forEach((f, index) => {
        if (f.result?.file) {
          const url = URL.createObjectURL(f.result.file);
          const link = document.createElement('a');
          link.href = url;
          link.download = f.result.file.name || `processed_${index + 1}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      });
      
    } catch (error) {
      console.error('Download error:', error);
      alert(getText('imageBatch.result.downloadError', 'Download failed'));
    }
  }, [batchFiles, getText]);

  // Operation parameter handlers
  const handleOperationChange = (operation: BatchOperation) => {
    setSelectedOperation(operation);
    setOperationParams(BatchOperations.getDefaultParams(operation));
  };

  const handleParamChange = (key: string, value: string | number | boolean) => {
    setOperationParams((prev: BatchOperationParams) => ({ ...prev, [key]: value }));
  };

  // Get operation info
  const getOperationInfo = (operation: BatchOperation) => {
    switch (operation) {
      case 'compress':
        return {
          name: getText('imageBatch.operations.compress.name', 'Compress'),
          description: getText('imageBatch.operations.compress.description', 'Reduce file size'),
          icon: <PhotoIcon className="w-5 h-5" />
        };
      case 'resize':
        return {
          name: getText('imageBatch.operations.resize.name', 'Resize'),
          description: getText('imageBatch.operations.resize.description', 'Change dimensions'),
          icon: <ArrowPathIcon className="w-5 h-5" />
        };
      case 'crop':
        return {
          name: getText('imageBatch.operations.crop.name', 'Crop'),
          description: getText('imageBatch.operations.crop.description', 'Crop specific area'),
          icon: <ScissorsIcon className="w-5 h-5" />
        };
      case 'rotate':
        return {
          name: getText('imageBatch.operations.rotate.name', 'Rotate'),
          description: getText('imageBatch.operations.rotate.description', 'Rotate image'),
          icon: <ArrowPathIcon className="w-5 h-5" />
        };
      case 'filter':
        return {
          name: getText('imageBatch.operations.filter.name', 'Filters'),
          description: getText('imageBatch.operations.filter.description', 'Apply filters'),
          icon: <SparklesIcon className="w-5 h-5" />
        };
      case 'convert':
        return {
          name: getText('imageBatch.operations.convert.name', 'Convert'),
          description: getText('imageBatch.operations.convert.description', 'Change format'),
          icon: <ArrowPathIcon className="w-5 h-5" />
        };
    }
  };

  const getCompletedCount = () => batchFiles.filter(f => f.status === 'completed').length;
  const getErrorCount = () => batchFiles.filter(f => f.status === 'error').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
      {/* Structured Data */}
      <StructuredData type="howto" />

      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{animationDelay: '4s'}}></div>
        
        {/* Floating sparkles */}
        <div className="absolute top-1/4 left-1/4 animate-bounce" style={{animationDelay: '1s'}}>
          <SparklesIcon className="h-6 w-6 text-purple-400" />
        </div>
        <div className="absolute top-3/4 right-1/4 animate-bounce" style={{animationDelay: '3s'}}>
          <SparklesIcon className="h-4 w-4 text-pink-400" />
        </div>
        <div className="absolute top-1/2 left-1/3 animate-bounce" style={{animationDelay: '2s'}}>
          <SparklesIcon className="h-5 w-5 text-purple-300" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* STEP 1: UPLOAD */}
        <div ref={uploadRef} tabIndex={-1} className={`py-16 min-h-screen focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-opacity-50 rounded-xl ${currentStep === 'upload' ? 'animate-fade-in' : ''}`}>
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 text-purple-800 px-6 py-3 rounded-full text-sm font-medium mb-6 shadow-lg backdrop-blur-sm">
              <QueueListIcon className="h-4 w-4 text-purple-600 mr-2" />
              {getText('imageBatch.badge', 'Batch Processing • Multiple Files')}
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {getText('imageBatch.title', 'Batch')}
              </span>
              <br />
              <span className="text-gray-900">
                {getText('imageBatch.subtitle', 'Image Processing')}
              </span>
            </h1>
            
            <p className="text-xl text-gray-800 max-w-3xl mx-auto leading-relaxed">
              {getText('imageBatch.description', 'Process multiple images at once with powerful batch operations. Compress, resize, crop, and transform your images efficiently.')}
            </p>
          </div>

          {/* Upload Section */}
          <div className="max-w-4xl mx-auto">
            <div {...getRootProps()} className={`relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragActive 
                ? 'border-purple-500 bg-purple-50 scale-105' 
                : 'border-purple-300 hover:border-purple-400 hover:bg-purple-50/50'
            }`}>
              <input {...getInputProps()} />
              
              <div className="space-y-6">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl">
                  <CloudArrowUpIcon className="h-12 w-12 text-white" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {getText('imageBatch.upload.title', 'Select Multiple Images')}
                  </h3>
                  <p className="text-gray-800 text-lg">
                    {getText('imageBatch.upload.description', 'Drag and drop your images or click to browse')}
                  </p>
                  <p className="text-sm text-gray-800 mt-2">
                    {getText('imageBatch.upload.formats', 'Supports: JPEG, PNG, WebP, GIF • Max 50 files • 50MB each')}
                  </p>
                </div>
                
                <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                  <PhotoIcon className="h-5 w-5 mr-2" />
                  {getText('imageBatch.upload.chooseFiles', 'Choose Files')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 2: CONFIGURE */}
        {currentStep !== 'upload' && batchFiles.length > 0 && (
          <div ref={configureRef} tabIndex={-1} className={`py-16 min-h-screen focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-opacity-50 rounded-xl ${currentStep === 'configure' ? 'animate-fade-in' : ''}`}>
            <div className="text-center mb-12">
              <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 text-purple-800 px-6 py-3 rounded-full text-sm font-medium mb-6 shadow-lg backdrop-blur-sm">
                <CogIcon className="h-4 w-4 text-purple-600 mr-2" />
                {getText('imageBatch.configure.step', 'Step 2: Configure Operation')}
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {getText('imageBatch.configure.title', 'Configure Batch Operation')}
              </h2>
              <p className="text-xl text-gray-800 max-w-2xl mx-auto">
                {getText('imageBatch.configure.description', 'Choose operation type and configure parameters for all files')}
              </p>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* File List */}
              <div className="lg:col-span-2">
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    {getText('imageBatch.configure.files', 'Selected Files')} ({batchFiles.length})
                  </h3>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {batchFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-4">
                          <PhotoIcon className="h-8 w-8 text-purple-600" />
                          <div>
                            <p className="font-medium text-gray-900">{file.file.name}</p>
                            <p className="text-sm text-gray-800">
                              {(file.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleFileRemove(file.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          {getText('imageBatch.configure.remove', 'Remove')}
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex space-x-4">
                    <button
                      onClick={handleBatchClear}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                    >
                      {getText('imageBatch.configure.clearAll', 'Clear All')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Operation Settings */}
              <div>
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 sticky top-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    {getText('imageBatch.configure.operation', 'Operation Settings')}
                  </h3>

                  {/* Operation Selection */}
                  <div className="space-y-4 mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {getText('imageBatch.configure.selectOperation', 'Select Operation')}
                    </label>
                    
                    <div className="space-y-2">
                      {(['compress', 'resize', 'crop', 'rotate', 'filter', 'convert'] as BatchOperation[]).map((operation) => {
                        const info = getOperationInfo(operation);
                        return (
                          <button
                            key={operation}
                            onClick={() => handleOperationChange(operation)}
                            className={`w-full flex items-center space-x-3 p-3 rounded-xl text-left transition-colors ${
                              selectedOperation === operation
                                ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-200 text-purple-900'
                                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                            }`}
                          >
                            <div className={`flex-shrink-0 ${
                              selectedOperation === operation ? 'text-purple-600' : 'text-gray-800'
                            }`}>
                              {info.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium">{info.name}</div>
                              <div className="text-xs text-gray-800">{info.description}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Start Processing Button */}
                  <button
                    onClick={handleStartProcessing}
                    disabled={isProcessing || batchFiles.length === 0}
                    className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <ArrowPathIcon className={`h-5 w-5 ${isProcessing ? 'animate-spin' : ''}`} />
                    <span>
                      {isProcessing 
                        ? getText('imageBatch.configure.processing', 'Processing...') 
                        : getText('imageBatch.configure.startProcessing', 'Start Batch Processing')
                      }
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PROCESSING */}
        {currentStep === 'processing' && (
          <div ref={processingRef} tabIndex={-1} className="py-8 sm:py-12 lg:py-16 min-h-screen flex items-center justify-center animate-fade-in px-4 focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-opacity-50 rounded-xl">
            <div className="max-w-sm sm:max-w-lg lg:max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 text-purple-800 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8 shadow-lg backdrop-blur-sm">
                <ArrowPathIcon className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 mr-2 animate-spin" />
                {getText('imageBatch.processing.step', 'Step 3: Processing Batch')}
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                {getText('imageBatch.processing.title', 'Processing Your Images')}
              </h2>

              <p className="text-base sm:text-lg lg:text-xl text-gray-800 mb-8 sm:mb-12">
                {getText('imageBatch.processing.description', 'Please wait while we process your batch of images...')}
              </p>

              {/* Processing Animation - Orbital Rings */}
              <div className="relative mb-8 sm:mb-12 flex items-center justify-center">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40">
                  {/* Outer ring */}
                  <div className="absolute inset-0 border-2 sm:border-3 lg:border-4 border-purple-200 rounded-full animate-spin" style={{animationDuration: '3s'}}></div>
                  {/* Middle ring */}
                  <div className="absolute inset-2 sm:inset-3 lg:inset-4 border-2 sm:border-3 lg:border-4 border-pink-300 rounded-full animate-spin" style={{animationDuration: '2s', animationDirection: 'reverse'}}></div>
                  {/* Inner ring */}
                  <div className="absolute inset-4 sm:inset-6 lg:inset-8 border-2 sm:border-3 lg:border-4 border-purple-400 rounded-full animate-spin" style={{animationDuration: '1.5s'}}></div>
                  {/* Center icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <QueueListIcon className="h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="max-w-xs sm:max-w-sm lg:max-w-md mx-auto mb-6 sm:mb-8">
                <div className="bg-purple-100 rounded-full h-3 sm:h-4 overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm sm:text-base lg:text-lg font-semibold text-purple-600 mt-2 sm:mt-4">
                  {progress}% {getText('imageBatch.processing.complete', 'Complete')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: RESULT */}
        {currentStep === 'result' && (
                      <div ref={resultRef} tabIndex={-1} className="py-16 min-h-screen animate-fade-in focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-opacity-50 rounded-xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 text-green-800 px-6 py-3 rounded-full text-sm font-medium mb-6 shadow-lg backdrop-blur-sm">
                <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                {getText('imageBatch.result.step', 'Step 4: Batch Complete!')}
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {getText('imageBatch.result.title', 'Batch Processing Complete!')}
              </h2>
              <p className="text-xl text-gray-800 max-w-2xl mx-auto">
                {getText('imageBatch.result.description', 'All files have been processed successfully')}
              </p>
            </div>

            {/* Results Summary */}
            <div className="max-w-4xl mx-auto space-y-8">
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{getCompletedCount()}</div>
                  <div className="text-gray-800">{getText('imageBatch.result.completed', 'Completed')}</div>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{getErrorCount()}</div>
                  <div className="text-gray-800">{getText('imageBatch.result.errors', 'Errors')}</div>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <QueueListIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{batchFiles.length}</div>
                  <div className="text-gray-800">{getText('imageBatch.result.total', 'Total Files')}</div>
                </div>
              </div>

              {/* Download Button */}
              {getCompletedCount() > 0 && (
                <div className="text-center">
                  <button
                    onClick={handleBatchDownload}
                    className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <ArrowDownTrayIcon className="h-6 w-6" />
                    <span>{getText('imageBatch.result.downloadAll', 'Download All Processed Files')}</span>
                  </button>
                </div>
              )}

              {/* Other Tools Section */}
              <div className="mt-16">
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
                  {getText('imageBatch.otherTools.title', 'Other Image Tools')}
                </h3>
                
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  <Link href={`/${locale}/image-compress`} className="flex flex-col items-center p-4 bg-white/50 backdrop-blur-sm rounded-2xl hover:bg-white/70 transition-all duration-200 hover:scale-110 hover:shadow-md group">
                    <PhotoIcon className="h-8 w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium text-gray-700 text-center">
                      {getText('imageBatch.otherTools.compress', 'Image Compress')}
                    </span>
                  </Link>
                  
                  <Link href={`/${locale}/image-convert`} className="flex flex-col items-center p-4 bg-white/50 backdrop-blur-sm rounded-2xl hover:bg-white/70 transition-all duration-200 hover:scale-110 hover:shadow-md group">
                    <DocumentIcon className="h-8 w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium text-gray-700 text-center">
                      {getText('imageBatch.otherTools.convert', 'Image Convert')}
                    </span>
                  </Link>
                  
                  <Link href={`/${locale}/image-resize`} className="flex flex-col items-center p-4 bg-white/50 backdrop-blur-sm rounded-2xl hover:bg-white/70 transition-all duration-200 hover:scale-110 hover:shadow-md group">
                    <RectangleGroupIcon className="h-8 w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium text-gray-700 text-center">
                      {getText('imageBatch.otherTools.resize', 'Image Resize')}
                    </span>
                  </Link>
                  
                  <Link href={`/${locale}/image-crop`} className="flex flex-col items-center p-4 bg-white/50 backdrop-blur-sm rounded-2xl hover:bg-white/70 transition-all duration-200 hover:scale-110 hover:shadow-md group">
                    <ScissorsIcon className="h-8 w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium text-gray-700 text-center">
                      {getText('imageBatch.otherTools.crop', 'Image Crop')}
                    </span>
                  </Link>
                  
                  <Link href={`/${locale}/image-rotate`} className="flex flex-col items-center p-4 bg-white/50 backdrop-blur-sm rounded-2xl hover:bg-white/70 transition-all duration-200 hover:scale-110 hover:shadow-md group">
                    <ArrowPathIcon className="h-8 w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium text-gray-700 text-center">
                      {getText('imageBatch.otherTools.rotate', 'Image Rotate')}
                    </span>
                  </Link>
                  
                  <Link href={`/${locale}/image-filters`} className="flex flex-col items-center p-4 bg-white/50 backdrop-blur-sm rounded-2xl hover:bg-white/70 transition-all duration-200 hover:scale-110 hover:shadow-md group">
                    <PaintBrushIcon className="h-8 w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium text-gray-700 text-center">
                      {getText('imageBatch.otherTools.filters', 'Image Filters')}
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
} 