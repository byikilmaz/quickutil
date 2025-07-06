'use client';

import { useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface CacheManagerProps {
  className?: string;
}

export default function CacheManager({ className = '' }: CacheManagerProps) {
  const [isClearing, setIsClearing] = useState(false);

  const clearAllCaches = async () => {
    if (isClearing) return;
    
    setIsClearing(true);
    
    try {
      // Clear browser cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      // Clear service worker cache
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          registration.active?.postMessage({ type: 'CACHE_UPDATE' });
        }
      }
      
      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      
      // Show success message
      alert('Cache temizlendi! Sayfa yeniden yükleniyor...');
      
      // Reload page
      window.location.reload();
      
    } catch (error) {
      console.error('Cache clearing failed:', error);
      alert('Cache temizlenirken hata oluştu.');
    } finally {
      setIsClearing(false);
    }
  };

  const forceRefresh = () => {
    // Force refresh with cache bypass
    window.location.reload();
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Clear Cache Button */}
      <button
        onClick={clearAllCaches}
        disabled={isClearing}
        className="flex items-center space-x-1 px-3 py-1 text-xs bg-red-50 text-red-700 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
        title="Tüm cache'i temizle"
      >
        <ArrowPathIcon 
          className={`w-3 h-3 ${isClearing ? 'animate-spin' : ''}`} 
        />
        <span>{isClearing ? 'Temizleniyor...' : 'Cache Temizle'}</span>
      </button>

      {/* Force Refresh Button */}
      <button
        onClick={forceRefresh}
        className="flex items-center space-x-1 px-3 py-1 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
        title="Sayfayı yeniden yükle"
      >
        <ArrowPathIcon className="w-3 h-3" />
        <span>Yenile</span>
      </button>
    </div>
  );
} 