'use client';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  DocumentArrowUpIcon, 
  ExclamationTriangleIcon, 
  CloudArrowUpIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export interface BatchFile {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: any;
  error?: string;
  processingTime?: number;
}

interface BatchFileUploadProps {
  onFilesSelect: (files: File[]) => void;
  onFileRemove: (fileId: string) => void;
  onBatchStart: () => void;
  onBatchPause: () => void;
  onBatchClear: () => void;
  acceptedTypes: string[];
  maxSize: number;
  maxFiles?: number;
  title: string;
  description: string;
  batchFiles: BatchFile[];
  isProcessing: boolean;
  supportedOperations: string[];
}

export default function BatchFileUpload({
  onFilesSelect,
  onFileRemove,
  onBatchStart,
  onBatchPause,
  onBatchClear,
  acceptedTypes,
  maxSize,
  maxFiles = 50,
  title,
  description,
  batchFiles,
  isProcessing,
  supportedOperations
}: BatchFileUploadProps) {
  const [isHovering, setIsHovering] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFilesSelect(acceptedFiles);
    }
  }, [onFilesSelect]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    maxFiles: maxFiles - batchFiles.length,
    onDragEnter: () => setIsHovering(true),
    onDragLeave: () => setIsHovering(false),
    onDropAccepted: () => setIsHovering(false),
    onDropRejected: () => setIsHovering(false),
    disabled: isProcessing
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypesDisplay = () => {
    return acceptedTypes.map(type => {
      switch (type) {
        case 'application/pdf':
          return 'PDF';
        case 'image/jpeg':
          return 'JPEG';
        case 'image/png':
          return 'PNG';
        case 'image/gif':
          return 'GIF';
        case 'image/webp':
          return 'WebP';
        default:
          return type.split('/')[1]?.toUpperCase() || type;
      }
    }).join(', ');
  };

  const getBatchStats = () => {
    const total = batchFiles.length;
    const completed = batchFiles.filter(f => f.status === 'completed').length;
    const processing = batchFiles.filter(f => f.status === 'processing').length;
    const errors = batchFiles.filter(f => f.status === 'error').length;
    const pending = batchFiles.filter(f => f.status === 'pending').length;
    
    const totalSize = batchFiles.reduce((sum, f) => sum + f.file.size, 0);
    const overallProgress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, processing, errors, pending, totalSize, overallProgress };
  };

  const stats = getBatchStats();

  const getStatusIcon = (status: BatchFile['status']) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-4 h-4 text-gray-500" />;
      case 'processing':
        return <ArrowPathIcon className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: BatchFile['status']) => {
    switch (status) {
      case 'pending':
        return 'border-gray-200 bg-gray-50';
      case 'processing':
        return 'border-blue-200 bg-blue-50';
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {(!isProcessing || batchFiles.length === 0) && (
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragActive || isHovering
              ? 'border-blue-500 bg-blue-50 scale-105'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          
          {/* Animated background */}
          {isDragActive && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl animate-pulse"></div>
          )}
          
          <div className="relative flex flex-col items-center space-y-6">
            {/* Icon with animation */}
            <div className={`transition-all duration-300 ${isDragActive ? 'scale-110' : ''}`}>
              {isDragActive ? (
                <CloudArrowUpIcon className="h-16 w-16 text-blue-500" />
              ) : (
                <DocumentArrowUpIcon className="h-16 w-16 text-gray-400" />
              )}
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
              <p className="text-gray-600 max-w-md mx-auto">{description}</p>
            </div>
            
            {/* Upload button and instructions */}
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50"
                  disabled={isProcessing}
                >
                  Dosyalar Seç
                </button>
                <span className="text-gray-500 font-medium">veya</span>
                <span className="text-blue-600 font-medium">
                  {isDragActive ? 'Dosyaları buraya bırakın' : 'sürükleyip bırakın'}
                </span>
              </div>
              
              {/* File requirements */}
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Maksimum boyut:</span>
                  <span className="text-gray-800">{formatFileSize(maxSize)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Desteklenen formatlar:</span>
                  <span className="text-gray-800">{getFileTypesDisplay()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Maksimum dosya sayısı:</span>
                  <span className="text-gray-800">{maxFiles} dosya</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Desteklenen işlemler:</span>
                  <span className="text-gray-800">{supportedOperations.join(', ')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Batch Control Panel */}
      {batchFiles.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Batch İşlem Paneli</h3>
              <p className="text-sm text-gray-600">
                {stats.total} dosya yüklendi • {formatFileSize(stats.totalSize)} toplam boyut
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {!isProcessing ? (
                <>
                  <button
                    onClick={onBatchStart}
                    disabled={stats.total === 0}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <PlayIcon className="w-4 h-4" />
                    <span>İşleme Başla</span>
                  </button>
                  <button
                    onClick={onBatchClear}
                    className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    <span>Temizle</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={onBatchPause}
                  className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <PauseIcon className="w-4 h-4" />
                  <span>Durdur</span>
                </button>
              )}
            </div>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-xs text-gray-600">Toplam</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
              <div className="text-xs text-blue-600">İşleniyor</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-xs text-green-600">Tamamlandı</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
              <div className="text-xs text-red-600">Hata</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-xs text-yellow-600">Bekliyor</div>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Genel İlerleme</span>
              <span className="text-sm text-gray-600">{stats.overallProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-600 to-blue-700 h-3 rounded-full transition-all duration-300"
                style={{ width: `${stats.overallProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* File List */}
      {batchFiles.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-medium text-gray-900 mb-4">Dosya Listesi</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {batchFiles.map((batchFile) => (
              <div
                key={batchFile.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${getStatusColor(batchFile.status)}`}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {getStatusIcon(batchFile.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {batchFile.file.name}
                      </p>
                      <span className="text-xs text-gray-500 ml-2">
                        {formatFileSize(batchFile.file.size)}
                      </span>
                    </div>
                    
                    {/* Progress bar for individual file */}
                    {batchFile.status === 'processing' && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${batchFile.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Error message */}
                    {batchFile.status === 'error' && batchFile.error && (
                      <p className="text-xs text-red-600 mt-1">{batchFile.error}</p>
                    )}
                    
                    {/* Processing time */}
                    {batchFile.status === 'completed' && batchFile.processingTime && (
                      <p className="text-xs text-green-600 mt-1">
                        İşlem süresi: {batchFile.processingTime}ms
                      </p>
                    )}
                  </div>
                </div>

                {/* Remove button */}
                {!isProcessing && batchFile.status !== 'processing' && (
                  <button
                    onClick={() => onFileRemove(batchFile.id)}
                    className="ml-3 p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Rejection Errors */}
      {fileRejections.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
          <div className="flex items-center space-x-2 mb-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            <h4 className="font-medium text-red-900">Bazı Dosyalar Yüklenemedi</h4>
          </div>
          <div className="space-y-2">
            {fileRejections.map(({ file, errors }) => (
              <div key={file.name} className="bg-white rounded-lg p-3 border border-red-200">
                <div className="font-medium text-red-900 mb-1">{file.name}</div>
                <ul className="text-sm text-red-700 space-y-1">
                  {errors.map((error) => (
                    <li key={error.code} className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span>
                        {error.code === 'file-too-large'
                          ? `Dosya çok büyük (${formatFileSize(file.size)}). Maksimum: ${formatFileSize(maxSize)}`
                          : error.code === 'file-invalid-type'
                          ? `Desteklenmeyen dosya formatı. Desteklenen formatlar: ${getFileTypesDisplay()}`
                          : error.code === 'too-many-files'
                          ? `Çok fazla dosya seçildi. Maksimum: ${maxFiles - batchFiles.length} dosya daha ekleyebilirsiniz`
                          : error.message}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 