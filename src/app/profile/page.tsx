'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { redirect } from 'next/navigation';
import { ActivityTracker } from '@/lib/activityTracker';
import { GoogleDriveService } from '@/lib/googleDriveApi';
import { UserActivity } from '@/types/database';
import { 
  UserIcon, 
  DocumentIcon, 
  PhotoIcon, 
  ChartBarIcon,
  ClockIcon,
  CloudArrowUpIcon,
  CogIcon,
  BellIcon,
  LinkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface UserStats {
  totalFiles: number;
  totalSizeSaved: number;
  thisMonthFiles: number;
  favoriteFeature: string;
  successRate: number;
  avgProcessingTime: number;
}

interface GoogleDriveStatus {
  isConnected: boolean;
  isActive: boolean;
  quotaUsed: number;
  quotaLimit: number;
  errorCount: number;
  lastError?: string;
}

export default function ProfilePage() {
  const { user, userProfile, loading } = useAuth();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalFiles: 0,
    totalSizeSaved: 0,
    thisMonthFiles: 0,
    favoriteFeature: 'PDF Sıkıştırma',
    successRate: 0,
    avgProcessingTime: 0
  });
  const [googleDriveStatus, setGoogleDriveStatus] = useState<GoogleDriveStatus>({
    isConnected: false,
    isActive: false,
    quotaUsed: 0,
    quotaLimit: 0,
    errorCount: 0
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'settings'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      redirect('/');
      return;
    }

    if (user) {
      loadUserData();
    }
  }, [user, loading]);

  const loadUserData = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Paralel data loading
      const [activitiesResult, statsResult, driveStatus] = await Promise.all([
        ActivityTracker.getUserActivities(user.uid, { limit: 20 }),
        ActivityTracker.getUserStats(user.uid),
        GoogleDriveService.checkIntegrationStatus(user.uid)
      ]);

      // Activities
      if (activitiesResult.success && activitiesResult.data) {
        setActivities(activitiesResult.data.items);
      } else {
        console.error('Error loading activities:', activitiesResult.error);
      }

      // Statistics
      if (statsResult.success && statsResult.data) {
        const data = statsResult.data;
        setStats({
          totalFiles: data.totalFiles,
          totalSizeSaved: data.totalSizeSaved,
          thisMonthFiles: data.thisMonthFiles,
          favoriteFeature: getFeatureName(data.favoriteFeature),
          successRate: data.successRate,
          avgProcessingTime: data.avgProcessingTime
        });
      } else {
        console.error('Error loading stats:', statsResult.error);
      }

      // Google Drive Status
      setGoogleDriveStatus(driveStatus);

    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Veriler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const handleGoogleDriveConnect = async () => {
    if (!user) return;

    try {
      // Authorization URL'e yönlendir
      window.location.href = `/api/auth/google-drive/authorize?userId=${user.uid}`;
    } catch (error) {
      console.error('Google Drive bağlantı hatası:', error);
      setError('Google Drive bağlantısı kurulamadı');
    }
  };

  const handleGoogleDriveDisconnect = async () => {
    if (!user) return;

    try {
      const result = await GoogleDriveService.disconnectIntegration(user.uid);
      if (result.success) {
        setGoogleDriveStatus(prev => ({ ...prev, isConnected: false, isActive: false }));
      } else {
        setError('Google Drive bağlantısı kesilemedi');
      }
    } catch (error) {
      console.error('Google Drive bağlantı kesme hatası:', error);
      setError('Bir hata oluştu');
    }
  };

  const getFeatureName = (type: string): string => {
    const names: Record<string, string> = {
      pdf_compress: 'PDF Sıkıştırma',
      pdf_convert: 'PDF Dönüştürme',
      image_convert: 'Görsel Dönüştürme'
    };
    return names[type] || 'PDF Sıkıştırma';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'pdf_compress':
      case 'pdf_convert':
        return <DocumentIcon className="w-5 h-5 text-red-500" />;
      case 'image_convert':
        return <PhotoIcon className="w-5 h-5 text-green-500" />;
      default:
        return <DocumentIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityName = (type: string) => {
    const names: Record<string, string> = {
      pdf_compress: 'PDF Sıkıştırma',
      pdf_convert: 'PDF Dönüştürme',
      image_convert: 'Görsel Dönüştürme'
    };
    return names[type] || type;
  };

  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Az önce';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} gün önce`;
    return `${Math.floor(diffInHours / 168)} hafta önce`;
  };

  const formatExpirationTime = (expiresAt: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 0) return 'Süresi dolmuş';
    if (diffInHours < 24) return `${diffInHours} saat kaldı`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} gün kaldı`;
    return `${Math.floor(diffInHours / 168)} hafta kaldı`;
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {userProfile ? 
                `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}` : 
                'K'
              }
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Kullanıcı'}
              </h1>
              <p className="text-gray-600 mt-1">{user.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                Üye oldu: {userProfile?.createdAt?.toLocaleDateString('tr-TR')}
              </p>
            </div>

            {/* Google Drive Status */}
            <div className="flex items-center space-x-3">
              {googleDriveStatus.isConnected ? (
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                  <CloudArrowUpIcon className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Google Drive Bağlı
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleGoogleDriveConnect}
                  className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors"
                >
                  <LinkIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Google Drive Bağla
                  </span>
                </button>
              )}

              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <BellIcon className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <CogIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-red-800">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="mt-8">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Genel Bakış', icon: ChartBarIcon },
                { id: 'files', label: 'Dosyalarım', icon: CloudArrowUpIcon },
                { id: 'settings', label: 'Ayarlar', icon: CogIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center space-x-2 px-3 py-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Toplam Dosya</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalFiles}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-full">
                    <DocumentIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tasarruf Edilen</p>
                    <p className="text-3xl font-bold text-gray-900">{formatFileSize(stats.totalSizeSaved)}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-full">
                    <ChartBarIcon className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Bu Ay</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.thisMonthFiles}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-full">
                    <ClockIcon className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Başarı Oranı</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.successRate.toFixed(0)}%</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-full">
                    <UserIcon className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Google Drive Status Card */}
            {googleDriveStatus.isConnected && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Google Drive Durumu</h3>
                  {googleDriveStatus.isActive ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Aktif
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                      Pasif
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Kullanılan Alan</p>
                    <p className="text-lg font-semibold">{formatFileSize(googleDriveStatus.quotaUsed)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Toplam Alan</p>
                    <p className="text-lg font-semibold">{formatFileSize(googleDriveStatus.quotaLimit)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Hata Sayısı</p>
                    <p className="text-lg font-semibold">{googleDriveStatus.errorCount}</p>
                  </div>
                </div>

                {googleDriveStatus.lastError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{googleDriveStatus.lastError}</p>
                  </div>
                )}

                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={handleGoogleDriveDisconnect}
                    className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                  >
                    Bağlantıyı Kes
                  </button>
                  <button
                    onClick={loadUserData}
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                  >
                    Yenile
                  </button>
                </div>
              </div>
            )}

            {/* Recent Activities */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Son Aktiviteler</h3>
                <button
                  onClick={loadUserData}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Yenile
                </button>
              </div>
              <div className="divide-y divide-gray-200">
                {isLoading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : activities.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <DocumentIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Henüz hiç dosya işlemi yapılmamış</p>
                    <p className="text-sm">İlk dosyanızı işlemek için ana sayfaya gidin</p>
                  </div>
                ) : (
                  activities.slice(0, 10).map((activity) => (
                    <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-100 rounded-full">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.fileName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {getActivityName(activity.type)} • {formatFileSize(activity.fileSize)}
                            {activity.processedSize && (
                              <span className="text-green-600 ml-2">
                                → {formatFileSize(activity.processedSize)}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Süre: {formatExpirationTime(activity.expiresAt)}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatRelativeTime(activity.timestamp)}
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          activity.status === 'success' 
                            ? 'bg-green-100 text-green-800'
                            : activity.status === 'error'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {activity.status === 'success' ? 'Başarılı' : 
                           activity.status === 'error' ? 'Hata' : 'İşleniyor'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Dosya Yönetimi</h3>
              <p className="text-sm text-gray-600 mt-1">
                {googleDriveStatus.isConnected ? 
                  'Google Drive entegrasyonu aktif! Dosyalarınız güvenle saklanıyor.' :
                  'Google Drive entegrasyonu yakında gelecek! Dosyalarınız 30 gün boyunca güvenle saklanacak.'
                }
              </p>
            </div>
            <div className="p-6 text-center text-gray-500">
              <CloudArrowUpIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-medium mb-2">
                {googleDriveStatus.isConnected ? 'Dosya Listesi' : 'Google Drive Entegrasyonu'}
              </h4>
              <p className="mb-4">
                {googleDriveStatus.isConnected ? 
                  'Dosya listesi özelliği geliştiriliyor' :
                  'Dosyalarınızı Google Drive\'da güvenle saklayacağız'
                }
              </p>
              <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
                <h5 className="font-medium text-blue-900 mb-2">Özellikler:</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 30 gün otomatik saklama</li>
                  <li>• Kategorili dosya organizasyonu</li>
                  <li>• Son gün email uyarısı</li>
                  <li>• Otomatik temizlik</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Hesap Ayarları</h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ad
                    </label>
                    <input
                      type="text"
                      value={userProfile?.firstName || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Soyad
                    </label>
                    <input
                      type="text"
                      value={userProfile?.lastName || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user.email || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Bildirim Ayarları</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Email Bildirimleri</p>
                        <p className="text-sm text-gray-500">Dosya işlem durumu ve süresi dolan dosyalar</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-blue-600 transition-colors duration-200 ease-in-out">
                        <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Dosya Süresi Uyarıları</p>
                        <p className="text-sm text-gray-500">Dosyalar silinmeden 1 gün önce uyarı</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-blue-600 transition-colors duration-200 ease-in-out">
                        <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">İstatistikler</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{stats.totalFiles}</p>
                      <p className="text-sm text-gray-600">Toplam Dosya</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{formatFileSize(stats.totalSizeSaved)}</p>
                      <p className="text-sm text-gray-600">Tasarruf</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{stats.successRate.toFixed(0)}%</p>
                      <p className="text-sm text-gray-600">Başarı Oranı</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{(stats.avgProcessingTime / 1000).toFixed(1)}s</p>
                      <p className="text-sm text-gray-600">Ort. İşlem</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 