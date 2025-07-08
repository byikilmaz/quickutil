'use client';
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface QuotaInfo {
  unlimited: boolean; // Artık herkese sınırsız
  storageEnabled: boolean; // Sadece kayıtlı kullanıcılara dosya saklama
  maxFileSize: number; // MB cinsinden
  filesExpireInDays: number; // Dosya saklama süresi
}

interface QuotaContextType {
  quotaInfo: QuotaInfo;
  canUseFeature: (feature: string) => boolean;
  canStoreFiles: () => boolean;
  checkFileSize: (fileSizeInBytes: number) => boolean;
  getMaxFileSize: () => number;
  loading: boolean;
}

const QuotaContext = createContext<QuotaContextType | undefined>(undefined);

interface QuotaProviderProps {
  children: ReactNode;
}

export function QuotaProvider({ children }: QuotaProviderProps) {
  const { user } = useAuth();
  const loading = false; // Static loading state for free model

  // Free model quota info
  const quotaInfo: QuotaInfo = {
    unlimited: true, // Tüm özellikler sınırsız
    storageEnabled: !!user, // Sadece kayıtlı kullanıcılara dosya saklama
    maxFileSize: 100, // 100MB free limit
    filesExpireInDays: 30 // 30 gün saklama
  };

  const canUseFeature = (): boolean => {
    // Tüm özellikler herkes için ücretsiz
    return true;
  };

  const canStoreFiles = (): boolean => {
    // Sadece kayıtlı kullanıcılar dosya saklayabilir
    return !!user;
  };

  const checkFileSize = (fileSizeInBytes: number): boolean => {
    const maxSizeInBytes = quotaInfo.maxFileSize * 1024 * 1024;
    return fileSizeInBytes <= maxSizeInBytes;
  };

  const getMaxFileSize = (): number => {
    return quotaInfo.maxFileSize;
  };

  const value: QuotaContextType = {
    quotaInfo,
    canUseFeature,
    canStoreFiles,
    checkFileSize,
    getMaxFileSize,
    loading
  };

  return (
    <QuotaContext.Provider value={value}>
      {children}
    </QuotaContext.Provider>
  );
}

export function useQuota(): QuotaContextType {
  const context = useContext(QuotaContext);
  if (context === undefined) {
    console.log('useQuota called outside QuotaProvider, returning mock values');
    // Return mock values to prevent errors
    return {
      quotaInfo: {
        unlimited: true,
        storageEnabled: false,
        maxFileSize: 100,
        filesExpireInDays: 30
      },
      canUseFeature: () => true,
      canStoreFiles: () => false,
      checkFileSize: () => true,
      getMaxFileSize: () => 100,
      loading: false
    };
  }
  return context;
} 