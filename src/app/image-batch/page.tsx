'use client';
import { useState, useCallback } from 'react';
import { 
  QueueListIcon, 
  ArrowDownTrayIcon, 
  CogIcon,
  SparklesIcon,
  ArrowPathIcon,
  ScissorsIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import Header from '@/components/Header';
import Breadcrumb from '@/components/Breadcrumb';
import BatchFileUpload, { BatchFile } from '@/components/BatchFileUpload';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BatchProcessor, 
  BatchDownloader, 
  BatchOperations,
  BatchOperation,
  BatchOperationConfig,
  generateFileId 
} from '@/lib/batchProcessor';
import { trackImageBatch } from '@/lib/activityTracker';

export default function ImageBatchPage() {
  const { user } = useAuth();
  
  // State management
  const [batchFiles, setBatchFiles] = useState<BatchFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<BatchOperation>('compress');
  const [operationParams, setOperationParams] = useState<any>(BatchOperations.getDefaultParams('compress'));
  const [showSettings, setShowSettings] = useState(false);
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

  // File operations
  const handleFilesSelect = useCallback((files: File[]) => {
    const newBatchFiles: BatchFile[] = files.map(file => ({
      id: generateFileId(),
      file,
      status: 'pending',
      progress: 0
    }));
    
    setBatchFiles(prev => [...prev, ...newBatchFiles]);
  }, []);

  const handleFileRemove = useCallback((fileId: string) => {
    setBatchFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const handleBatchClear = useCallback(() => {
    setBatchFiles([]);
  }, []);

  // Batch processing
  const handleBatchStart = useCallback(async () => {
    if (batchFiles.length === 0) return;
    
    setIsProcessing(true);
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
      
      processor.setFiles(batchFiles);
      processor.setConfig(config);
      
      // Start processing
      const results = await processor.start();
      
      // Track batch activity
      if (user) {
        const processingTime = Date.now() - startTime;
        const totalOriginalSize = batchFiles.reduce((sum, f) => sum + f.file.size, 0);
        const totalProcessedSize = results
          .filter(r => r.success && r.result?.file)
          .reduce((sum, r) => sum + r.result.file.size, 0);
        
        await trackImageBatch(
          user.uid,
          selectedOperation,
          batchFiles.length,
          totalOriginalSize,
          totalProcessedSize,
          processingTime
        );
      }

    } catch (error) {
      console.error('Batch processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [batchFiles, selectedOperation, operationParams, processor, user]);

  const handleBatchPause = useCallback(() => {
    processor.stop();
    setIsProcessing(false);
  }, [processor]);

  // Download all processed files
  const handleBatchDownload = useCallback(async () => {
    const completedFiles = batchFiles.filter(f => f.status === 'completed' && f.result);
    
    if (completedFiles.length === 0) {
      alert('İndirilecek işlenmiş dosya yok');
      return;
    }

    try {
      const results = completedFiles.map(f => ({
        fileId: f.id,
        success: true,
        result: f.result,
        processingTime: f.processingTime || 0
      }));

      const zipBlob = await BatchDownloader.createZip(results);
      const fileName = `batch_${selectedOperation}_${Date.now()}.zip`;
      BatchDownloader.downloadZip(zipBlob, fileName);
      
    } catch (error) {
      console.error('Download error:', error);
      alert('İndirme sırasında hata oluştu');
    }
  }, [batchFiles, selectedOperation]);

  // Operation parameter handlers
  const handleOperationChange = (operation: BatchOperation) => {
    setSelectedOperation(operation);
    setOperationParams(BatchOperations.getDefaultParams(operation));
  };

  const handleParamChange = (key: string, value: any) => {
    setOperationParams((prev: any) => ({ ...prev, [key]: value }));
  };

  // Get operation info
  const getOperationInfo = (operation: BatchOperation) => {
    switch (operation) {
      case 'compress':
        return {
          name: 'Sıkıştırma',
          description: 'Dosya boyutunu küçültür',
          icon: <PhotoIcon className="w-5 h-5" />
        };
      case 'resize':
        return {
          name: 'Yeniden Boyutlandırma',
          description: 'Görüntü boyutlarını değiştirir',
          icon: <ArrowPathIcon className="w-5 h-5" />
        };
      case 'crop':
        return {
          name: 'Kırpma',
          description: 'Belirli alanı kırpar',
          icon: <ScissorsIcon className="w-5 h-5" />
        };
      case 'rotate':
        return {
          name: 'Döndürme',
          description: 'Görüntüyü döndürür',
          icon: <ArrowPathIcon className="w-5 h-5" />
        };
      case 'filter':
        return {
          name: 'Filtreler',
          description: 'Renk ve efekt filtreleri',
          icon: <SparklesIcon className="w-5 h-5" />
        };
      case 'convert':
        return {
          name: 'Format Dönüştürme',
          description: 'Dosya formatını değiştirir',
          icon: <ArrowPathIcon className="w-5 h-5" />
        };
    }
  };

  const getCompletedCount = () => batchFiles.filter(f => f.status === 'completed').length;
  const getErrorCount = () => batchFiles.filter(f => f.status === 'error').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAuthClick={() => {}} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb />
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 text-white mb-4 shadow-lg">
            <QueueListIcon className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Batch Image Processing
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Birden fazla resim dosyasını aynı anda işleyin. Sıkıştırma, boyutlandırma, kırpma ve daha fazlası.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content - File Upload & List */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* File Upload */}
            <BatchFileUpload
              onFilesSelect={handleFilesSelect}
              onFileRemove={handleFileRemove}
              onBatchStart={handleBatchStart}
              onBatchPause={handleBatchPause}
              onBatchClear={handleBatchClear}
              acceptedTypes={['image/jpeg', 'image/png', 'image/webp', 'image/gif']}
              maxSize={50 * 1024 * 1024} // 50MB
              maxFiles={50}
              title="Batch Image Processing"
              description="Birden fazla resmi aynı anda işlemek için yükleyin"
              batchFiles={batchFiles}
              isProcessing={isProcessing}
              supportedOperations={['Sıkıştırma', 'Boyutlandırma', 'Kırpma', 'Filtreler', 'Döndürme', 'Dönüştürme']}
            />

            {/* Download Results */}
            {getCompletedCount() > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <ArrowDownTrayIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900">İşlem Tamamlandı!</h3>
                      <p className="text-green-700">
                        {getCompletedCount()} dosya başarıyla işlendi
                        {getErrorCount() > 0 && `, ${getErrorCount()} dosyada hata`}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleBatchDownload}
                    className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    <span>Hepsini İndir (ZIP)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Operation Settings */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">İşlem Ayarları</h3>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <CogIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Operation Selection */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    İşlem Türü Seçin
                  </label>
                  <div className="space-y-2">
                    {(['compress', 'resize', 'crop', 'rotate', 'filter', 'convert'] as BatchOperation[]).map((operation) => {
                      const info = getOperationInfo(operation);
                      return (
                        <button
                          key={operation}
                          onClick={() => handleOperationChange(operation)}
                          className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                            selectedOperation === operation
                              ? 'bg-purple-100 border-2 border-purple-200 text-purple-900'
                              : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                          }`}
                        >
                          <div className={`flex-shrink-0 ${
                            selectedOperation === operation ? 'text-purple-600' : 'text-gray-500'
                          }`}>
                            {info.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{info.name}</div>
                            <div className="text-xs text-gray-600">{info.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Operation Parameters */}
                {showSettings && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      {getOperationInfo(selectedOperation).name} Ayarları
                    </h4>
                    
                    {selectedOperation === 'compress' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Kalite</label>
                          <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.1"
                            value={operationParams.quality}
                            onChange={(e) => handleParamChange('quality', parseFloat(e.target.value))}
                            className="w-full"
                          />
                          <div className="text-xs text-gray-500">{Math.round(operationParams.quality * 100)}%</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Format</label>
                          <select
                            value={operationParams.format}
                            onChange={(e) => handleParamChange('format', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="jpeg">JPEG</option>
                            <option value="png">PNG</option>
                            <option value="webp">WebP</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {selectedOperation === 'resize' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Genişlik (px)</label>
                          <input
                            type="number"
                            value={operationParams.width}
                            onChange={(e) => handleParamChange('width', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Yükseklik (px)</label>
                          <input
                            type="number"
                            value={operationParams.height}
                            onChange={(e) => handleParamChange('height', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={operationParams.maintainAspectRatio}
                            onChange={(e) => handleParamChange('maintainAspectRatio', e.target.checked)}
                            className="mr-2"
                          />
                          <label className="text-xs text-gray-600">En-boy oranını koru</label>
                        </div>
                      </div>
                    )}

                    {selectedOperation === 'crop' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">X</label>
                            <input
                              type="number"
                              value={operationParams.x}
                              onChange={(e) => handleParamChange('x', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Y</label>
                            <input
                              type="number"
                              value={operationParams.y}
                              onChange={(e) => handleParamChange('y', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Genişlik</label>
                            <input
                              type="number"
                              value={operationParams.width}
                              onChange={(e) => handleParamChange('width', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Yükseklik</label>
                            <input
                              type="number"
                              value={operationParams.height}
                              onChange={(e) => handleParamChange('height', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedOperation === 'rotate' && (
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Açı (derece)</label>
                        <select
                          value={operationParams.angle}
                          onChange={(e) => handleParamChange('angle', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value={90}>90° (Saat yönünde)</option>
                          <option value={180}>180°</option>
                          <option value={270}>270° (Saat yönünün tersi)</option>
                        </select>
                      </div>
                    )}

                    {selectedOperation === 'filter' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Parlaklık</label>
                          <input
                            type="range"
                            min="-100"
                            max="100"
                            value={operationParams.brightness}
                            onChange={(e) => handleParamChange('brightness', parseInt(e.target.value))}
                            className="w-full"
                          />
                          <div className="text-xs text-gray-500">{operationParams.brightness}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Kontrast</label>
                          <input
                            type="range"
                            min="-100"
                            max="100"
                            value={operationParams.contrast}
                            onChange={(e) => handleParamChange('contrast', parseInt(e.target.value))}
                            className="w-full"
                          />
                          <div className="text-xs text-gray-500">{operationParams.contrast}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Doygunluk</label>
                          <input
                            type="range"
                            min="-100"
                            max="100"
                            value={operationParams.saturation}
                            onChange={(e) => handleParamChange('saturation', parseInt(e.target.value))}
                            className="w-full"
                          />
                          <div className="text-xs text-gray-500">{operationParams.saturation}</div>
                        </div>
                      </div>
                    )}

                    {selectedOperation === 'convert' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Çıktı Formatı</label>
                          <select
                            value={operationParams.format}
                            onChange={(e) => handleParamChange('format', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="png">PNG</option>
                            <option value="jpeg">JPEG</option>
                            <option value="webp">WebP</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Kalite</label>
                          <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.1"
                            value={operationParams.quality}
                            onChange={(e) => handleParamChange('quality', parseFloat(e.target.value))}
                            className="w-full"
                          />
                          <div className="text-xs text-gray-500">{Math.round(operationParams.quality * 100)}%</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 