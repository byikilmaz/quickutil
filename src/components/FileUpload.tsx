'use client';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentArrowUpIcon, ExclamationTriangleIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedTypes: string[];
  maxSize: number;
  title: string;
  description: string;
}

export default function FileUpload({
  onFileSelect,
  acceptedTypes,
  maxSize,
  title,
  description
}: FileUploadProps) {
  const [isHovering, setIsHovering] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('FileUpload onDrop called:', acceptedFiles);
    if (acceptedFiles.length > 0) {
      console.log('Calling onFileSelect with:', acceptedFiles[0]);
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    maxFiles: 1,
    onDragEnter: () => setIsHovering(true),
    onDragLeave: () => setIsHovering(false),
    onDropAccepted: () => setIsHovering(false),
    onDropRejected: () => setIsHovering(false)
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

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive || isHovering
            ? 'border-blue-500 bg-blue-50 scale-105'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
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
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                Dosya Seç
              </button>
              <span className="text-gray-500 font-medium">veya</span>
              <span className="text-blue-600 font-medium">
                {isDragActive ? 'Dosyayı buraya bırakın' : 'sürükleyip bırakın'}
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
            </div>
          </div>
        </div>
      </div>

      {/* File Rejection Errors */}
      {fileRejections.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
          <div className="flex items-center space-x-2 mb-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            <h4 className="font-medium text-red-900">Dosya Yüklenemedi</h4>
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