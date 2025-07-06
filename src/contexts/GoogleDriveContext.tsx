'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { googleDriveServerClient, GoogleDriveAuth, GoogleDriveFile, GoogleDriveQuota } from '@/lib/googleDriveServerClient';
import { useAuth } from '@/contexts/AuthContext';

interface GoogleDriveContextType {
  // Authentication state (Firebase Auth based)
  auth: GoogleDriveAuth;
  isLoading: boolean;
  error: string | null;
  
  // Actions (simplified for server-side)
  refreshAuth: () => Promise<void>;
  
  // File operations
  uploadFile: (file: File, fileName?: string) => Promise<GoogleDriveFile>;
  listFiles: () => Promise<GoogleDriveFile[]>;
  deleteFile: (fileId: string) => Promise<void>;
  downloadFile: (fileId: string, fileName: string) => Promise<void>;
  
  // Quota info
  quota: GoogleDriveQuota | null;
  refreshQuota: () => Promise<void>;
}

const GoogleDriveContext = createContext<GoogleDriveContextType | undefined>(undefined);

interface GoogleDriveProviderProps {
  children: ReactNode;
}

export const GoogleDriveProvider: React.FC<GoogleDriveProviderProps> = ({ children }) => {
  const { user } = useAuth(); // Firebase Auth user
  
  const [auth, setAuth] = useState<GoogleDriveAuth>({
    isSignedIn: false,
    user: null
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quota, setQuota] = useState<GoogleDriveQuota | null>(null);

  // Firebase Auth durumu değiştiğinde Google Drive auth'u güncelle
  useEffect(() => {
    const updateAuthStatus = async () => {
      if (user) {
        try {
          setIsLoading(true);
          const authStatus = await googleDriveServerClient.checkAuthStatus();
          setAuth(authStatus);
          
          // Quota bilgisini al
          if (authStatus.isSignedIn) {
            await loadQuotaInfo();
          }
        } catch (err) {
          console.error('Error updating auth status:', err);
          setError('Google Drive bağlantısı kurulamadı');
        } finally {
          setIsLoading(false);
        }
      } else {
        // User logged out
        setAuth({
          isSignedIn: false,
          user: null
        });
        setQuota(null);
      }
    };

    updateAuthStatus();
  }, [user]);

  // Load quota information
  const loadQuotaInfo = async () => {
    try {
      const quotaInfo = await googleDriveServerClient.getQuotaInfo();
      setQuota(quotaInfo);
    } catch (err) {
      console.error('Error loading quota info:', err);
    }
  };

  // Refresh authentication status
  const refreshAuth = async () => {
    try {
      setError(null);
      const authStatus = await googleDriveServerClient.checkAuthStatus();
      setAuth(authStatus);
      
      if (authStatus.isSignedIn) {
        await loadQuotaInfo();
      }
      
    } catch (err) {
      console.error('Error refreshing auth:', err);
      setError('Authentication durumu yenilenemedi');
    }
  };

  // Upload file to server (merkezi Google Drive)
  const uploadFile = async (file: File, fileName?: string): Promise<GoogleDriveFile> => {
    try {
      setError(null);
      
      if (!auth.isSignedIn) {
        throw new Error('Kullanıcı giriş yapmamış');
      }
      
      const uploadedFile = await googleDriveServerClient.uploadFile(file, fileName);
      
      // Refresh quota after upload
      await loadQuotaInfo();
      
      return uploadedFile;
      
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Dosya yükleme başarısız');
      throw err;
    }
  };

  // List user files
  const listFiles = async (): Promise<GoogleDriveFile[]> => {
    try {
      setError(null);
      
      if (!auth.isSignedIn) {
        throw new Error('Kullanıcı giriş yapmamış');
      }
      
      const files = await googleDriveServerClient.listFiles();
      return files;
      
    } catch (err) {
      console.error('Error listing files:', err);
      setError('Dosya listesi alınamadı');
      throw err;
    }
  };

  // Delete file
  const deleteFile = async (fileId: string): Promise<void> => {
    try {
      setError(null);
      
      if (!auth.isSignedIn) {
        throw new Error('Kullanıcı giriş yapmamış');
      }
      
      await googleDriveServerClient.deleteFile(fileId);
      
      // Refresh quota after deletion
      await loadQuotaInfo();
      
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Dosya silinirken hata oluştu');
      throw err;
    }
  };

  // Download file
  const downloadFile = async (fileId: string, fileName: string): Promise<void> => {
    try {
      setError(null);
      
      if (!auth.isSignedIn) {
        throw new Error('Kullanıcı giriş yapmamış');
      }
      
      await googleDriveServerClient.downloadFile(fileId, fileName);
      
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Dosya indirilemedi');
      throw err;
    }
  };

  // Refresh quota information
  const refreshQuota = async (): Promise<void> => {
    await loadQuotaInfo();
  };

  const contextValue: GoogleDriveContextType = {
    auth,
    isLoading,
    error,
    refreshAuth,
    uploadFile,
    listFiles,
    deleteFile,
    downloadFile,
    quota,
    refreshQuota
  };

  return (
    <GoogleDriveContext.Provider value={contextValue}>
      {children}
    </GoogleDriveContext.Provider>
  );
};

// Custom hook to use Google Drive context
export const useGoogleDrive = (): GoogleDriveContextType => {
  const context = useContext(GoogleDriveContext);
  if (!context) {
    throw new Error('useGoogleDrive must be used within a GoogleDriveProvider');
  }
  return context;
};

export default GoogleDriveContext; 