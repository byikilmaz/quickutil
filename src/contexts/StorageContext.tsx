'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { StorageUtils, StorageFile, UploadResult } from '@/lib/storageUtils';

interface StorageContextType {
  files: StorageFile[];
  quota: {
    used: number;
    limit: number;
    percentage: number;
  };
  loading: boolean;
  error: string | null;
  uploadFile: (file: File, category?: 'pdf' | 'image' | 'document', customFileName?: string) => Promise<UploadResult>;
  deleteFile: (filePath: string) => Promise<void>;
  refreshFiles: () => Promise<void>;
  refreshQuota: () => Promise<void>;
  cleanupExpiredFiles: () => Promise<number>;
}

const StorageContext = createContext<StorageContextType | null>(null);

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
};

interface StorageProviderProps {
  children: React.ReactNode;
}

export const StorageProvider: React.FC<StorageProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [quota, setQuota] = useState({
    used: 0,
    limit: 5 * 1024 * 1024 * 1024, // 5GB
    percentage: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dosyaları yükle
  const loadFiles = useCallback(async () => {
    if (!user) {
      setFiles([]);
      return;
    }

    try {
      setError(null);
      const userFiles = await StorageUtils.listUserFiles(user.uid);
      setFiles(userFiles);
    } catch (err) {
      console.error('Error loading files:', err);
      setError('Dosyalar yüklenirken hata oluştu');
      setFiles([]);
    }
  }, [user]);

  // Quota bilgisini yükle
  const loadQuota = useCallback(async () => {
    if (!user) {
      setQuota({
        used: 0,
        limit: 5 * 1024 * 1024 * 1024,
        percentage: 0
      });
      return;
    }

    try {
      const quotaInfo = await StorageUtils.calculateUserQuota(user.uid);
      setQuota(quotaInfo);
    } catch (err) {
      console.error('Error loading quota:', err);
    }
  }, [user]);

  // User değiştiğinde dosyaları ve quota'yı yükle
  useEffect(() => {
    if (user) {
      loadFiles();
      loadQuota();
    } else {
      setFiles([]);
      setQuota({
        used: 0,
        limit: 5 * 1024 * 1024 * 1024,
        percentage: 0
      });
    }
  }, [user, loadFiles, loadQuota]);

  // Dosya yükle
  const uploadFile = async (
    file: File, 
    category: 'pdf' | 'image' | 'document' = 'pdf',
    customFileName?: string
  ): Promise<UploadResult> => {
    if (!user) {
      throw new Error('Kullanıcı giriş yapmamış');
    }

    try {
      setError(null);
      setLoading(true);

      const result = await StorageUtils.uploadFile(
        user.uid, 
        file, 
        category, 
        customFileName
      );

      // Dosya listesini yenile
      await loadFiles();
      await loadQuota();

      return result;

    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Dosya yükleme başarısız');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Dosya sil
  const deleteFile = async (filePath: string): Promise<void> => {
    if (!user) {
      throw new Error('Kullanıcı giriş yapmamış');
    }

    try {
      setError(null);
      setLoading(true);

      await StorageUtils.deleteFile(user.uid, filePath);

      // Dosya listesini yenile
      await loadFiles();
      await loadQuota();

    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Dosya silinirken hata oluştu');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Dosyaları yenile
  const refreshFiles = async (): Promise<void> => {
    await loadFiles();
  };

  // Quota'yı yenile
  const refreshQuota = async (): Promise<void> => {
    await loadQuota();
  };

  // Expired dosyaları temizle
  const cleanupExpiredFiles = async (): Promise<number> => {
    if (!user) {
      throw new Error('Kullanıcı giriş yapmamış');
    }

    try {
      setError(null);
      setLoading(true);

      const deletedCount = await StorageUtils.cleanupExpiredFiles(user.uid);

      // Dosya listesini yenile
      await loadFiles();
      await loadQuota();

      return deletedCount;

    } catch (err) {
      console.error('Error cleaning up files:', err);
      setError('Dosya temizleme başarısız');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: StorageContextType = {
    files,
    quota,
    loading,
    error,
    uploadFile,
    deleteFile,
    refreshFiles,
    refreshQuota,
    cleanupExpiredFiles
  };

  return (
    <StorageContext.Provider value={value}>
      {children}
    </StorageContext.Provider>
  );
}; 