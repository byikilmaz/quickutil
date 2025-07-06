'use client';

import React, { useState, useEffect } from 'react';
import { useGoogleDrive } from '@/contexts/GoogleDriveContext';
import { GoogleDriveFile } from '@/lib/googleDriveServerClient';

interface GoogleDriveCardProps {
  className?: string;
}

const GoogleDriveCard: React.FC<GoogleDriveCardProps> = ({ className = '' }) => {
  const { 
    auth, 
    isLoading, 
    error, 
    quota, 
    listFiles, 
    deleteFile, 
    downloadFile 
  } = useGoogleDrive();

  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [showFiles, setShowFiles] = useState(false);

  const loadFiles = React.useCallback(async () => {
    try {
      setFilesLoading(true);
      const fileList = await listFiles();
      setFiles(fileList);
    } catch (err) {
      console.error('Error loading files:', err);
    } finally {
      setFilesLoading(false);
    }
  }, [listFiles]);

  // Load files when showing files section
  useEffect(() => {
    if (showFiles && auth.isSignedIn) {
      loadFiles();
    }
  }, [showFiles, auth.isSignedIn, loadFiles]);

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Bu dosyayı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await deleteFile(fileId);
      setFiles(files.filter(f => f.id !== fileId));
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  };

  const handleDownloadFile = async (fileId: string, fileName: string) => {
    try {
      await downloadFile(fileId, fileName);
    } catch (err) {
      console.error('Error downloading file:', err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getQuotaPercentage = () => {
    if (!quota || quota.limit === 0) return 0;
    return (quota.usage / quota.limit) * 100;
  };

  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('video')) return '🎥';
    if (mimeType.includes('audio')) return '🎵';
    return '📎';
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.5 2.5L20.5 9.5L12.5 16.5L4.5 9.5L12.5 2.5Z"/>
              <path d="M12.5 16.5L20.5 23.5L12.5 30.5L4.5 23.5L12.5 16.5Z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Merkezi Bulut Depolama</h3>
            <p className="text-sm text-gray-600">30 günlük güvenli dosya saklama</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${auth.isSignedIn ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span className="text-sm font-medium text-gray-700">
            {auth.isSignedIn ? 'Bağlı' : 'Bağlı Değil'}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Server-side Google Drive - Always Available for Authenticated Users */}
      {!auth.isSignedIn ? (
        <div className="text-center py-8">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Merkezi Bulut Depolama</h4>
          <p className="text-gray-600 mb-6">
            Hesabınıza giriş yapın ve dosyalarınızı 30 gün boyunca güvenle saklayın.
          </p>
          <p className="text-sm text-blue-600 font-medium">
            Lütfen önce hesabınıza giriş yapın
          </p>
        </div>
      ) : (
        <div>
          {/* User Info */}
          <div className="flex items-center gap-3 mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={auth.user?.picture || '/default-avatar.png'} 
              alt="User"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{auth.user?.name}</p>
              <p className="text-sm text-gray-600">{auth.user?.email}</p>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-700">Aktif</span>
            </div>
          </div>

          {/* Quota Information */}
          {quota && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Depolama Kullanımı</span>
                <span className="text-sm text-gray-600">
                  {formatFileSize(quota.usage)} / {formatFileSize(quota.limit)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(getQuotaPercentage(), 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                %{getQuotaPercentage().toFixed(1)} kullanılmış
              </p>
            </div>
          )}

          {/* Files Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">QuickUtil Dosyaları</h4>
              <button
                onClick={() => setShowFiles(!showFiles)}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                {showFiles ? 'Gizle' : 'Görüntüle'}
              </button>
            </div>

            {showFiles && (
              <div className="space-y-3">
                {filesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : files.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Henüz dosya yüklenmemiş</p>
                  </div>
                ) : (
                  files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getFileTypeIcon(file.mimeType)}</span>
                        <div>
                          <p className="font-medium text-gray-900 truncate max-w-48">{file.name}</p>
                          <p className="text-sm text-gray-600">
                            {formatFileSize(file.size)} • {formatDate(file.createdTime)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownloadFile(file.id, file.name)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="İndir"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Sil"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleDriveCard; 