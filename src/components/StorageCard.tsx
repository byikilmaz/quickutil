'use client';
import { useState } from 'react';
import { useStorage } from '@/contexts/StorageContext';
import { StorageUtils, StorageFile } from '@/lib/storageUtils';
import { CloudArrowUpIcon, CloudArrowDownIcon, TrashIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function StorageCard() {
  const { files, quota, loading, error, refreshFiles, deleteFile, cleanupExpiredFiles } = useStorage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  const handleDeleteFile = async (filePath: string) => {
    if (confirm('Bu dosyayı silmek istediğinizden emin misiniz?')) {
      try {
        await deleteFile(filePath);
        await refreshFiles();
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleCleanup = async () => {
    if (confirm('30 günden eski dosyalar silinecek. Devam etmek istiyor musunuz?')) {
      setIsCleaningUp(true);
      try {
        const deletedCount = await cleanupExpiredFiles();
        alert(`${deletedCount} adet eski dosya silindi.`);
      } catch (error) {
        console.error('Cleanup error:', error);
        alert('Temizlik işlemi başarısız oldu.');
      } finally {
        setIsCleaningUp(false);
      }
    }
  };

  const handleDownload = (file: StorageFile) => {
    window.open(file.downloadURL, '_blank');
  };

  const formatFileSize = (bytes: number) => {
    return StorageUtils.formatFileSize(bytes);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.includes('pdf')) {
      return (
        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
          <DocumentTextIcon className="h-5 w-5 text-red-600" />
        </div>
      );
    }
    if (contentType.includes('image')) {
      return (
        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
          <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
        <DocumentTextIcon className="h-5 w-5 text-gray-600" />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.017 11.986c-.009-6.373-4.27-8.042-4.27-8.042s-.405 1.062-.018 2.832c.423 1.937 1.712 2.966 1.712 2.966s-.995-.048-2.963-.755c-1.848-.664-3.015-2.52-3.478-4.987-.463-2.467.42-4.994.42-4.994s-.648.06-1.082.525c-.434.465-.648 1.102-.648 1.102s1.155-4.024 4.024-4.024c2.869 0 5.207 2.338 5.207 5.207l.007.037c0 .033.007.066.007.1 0 2.869-2.338 5.207-5.207 5.207l-.037-.007c-.033 0-.066-.007-.1-.007z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Firebase Storage</h3>
            <p className="text-sm text-gray-500">Dosya depolama alanınız</p>
          </div>
        </div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
      </div>

      {/* Storage Info */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Kullanılan Alan</span>
          <span className="text-sm font-medium text-gray-900">
            {formatFileSize(quota.used)} / {formatFileSize(quota.limit)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              quota.percentage > 80 ? 'bg-red-500' : 
              quota.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(quota.percentage, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {quota.percentage.toFixed(1)}% kullanıldı • {files.length} dosya
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => refreshFiles()}
          disabled={loading}
          className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
        >
          {loading ? 'Yükleniyor...' : 'Yenile'}
        </button>
        <button
          onClick={handleCleanup}
          disabled={isCleaningUp || loading}
          className="bg-gray-50 text-gray-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          {isCleaningUp ? 'Temizleniyor...' : 'Temizle'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* File List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">Son Dosyalar</h4>
          {files.length > 3 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {isExpanded ? 'Daha Az' : `+${files.length - 3} Daha`}
            </button>
          )}
        </div>

        <div className="space-y-2">
          {files.length === 0 ? (
            <div className="text-center py-8">
              <CloudArrowUpIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Henüz dosya yok</p>
              <p className="text-xs text-gray-400">PDF işlemleriniz burada görünecek</p>
            </div>
          ) : (
            <>
              {(isExpanded ? files : files.slice(0, 3)).map((file) => (
                <div key={file.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 group">
                  {getFileIcon(file.contentType)}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name.replace(/^(pdf|image|document)_\d+_/, '')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {formatDate(file.timeCreated)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDownload(file)}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                      title="İndir"
                    >
                      <CloudArrowDownIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFile(file.fullPath)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                      title="Sil"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Storage Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Dosyalar 30 gün sonra otomatik silinir</p>
          <p>• 5GB ücretsiz depolama alanı</p>
          <p>• Güvenli Firebase Storage</p>
        </div>
      </div>
    </div>
  );
} 