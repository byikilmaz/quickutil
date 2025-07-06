'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { redirect } from 'next/navigation';
import { ActivityTracker } from '@/lib/activityTracker';
import { UserActivity } from '@/types/database';
import StorageCard from '@/components/StorageCard';
import { 
  UserIcon, 
  DocumentIcon, 
  PhotoIcon, 
  ChartBarIcon,
  ClockIcon,
  CloudArrowUpIcon,
  CogIcon,
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PauseCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  BanknotesIcon,
  PlusIcon,
  CreditCardIcon,
  TrashIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface UserStats {
  totalFiles: number;
  totalSizeSaved: number;
  thisMonthFiles: number;
  favoriteFeature: string;
  successRate: number;
  avgProcessingTime: number;
}

interface Subscription {
  id: string;
  planName: string;
  status: 'active' | 'cancelled' | 'paused' | 'past_due';
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'annual';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  features: string[];
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_transfer';
  brand?: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  holderName: string;
  isDefault: boolean;
  createdAt: Date;
}

interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  dueDate: Date;
  paidAt?: Date;
  description: string;
  downloadUrl?: string;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'billing' | 'payment-methods' | 'settings'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock subscription data (static for now, will be replaced with İyzico API)
  const subscription: Subscription | null = {
    id: 'sub_example',
    planName: 'Premium Plan',
    status: 'active',
    price: 10.1,
    currency: 'USD',
    billingPeriod: 'annual',
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    cancelAtPeriodEnd: false,
    features: [
      'Sınırsız PDF işlemleri',
      'Batch processing (50 dosya)',
      '5GB depolama',
      '100MB dosya limiti',
      'Öncelikli destek',
      'Gelişmiş filtreler'
    ]
  };

  // Mock payment methods data (static for now, will be replaced with İyzico API)
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'pm_1',
      type: 'card',
      brand: 'visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2027,
      holderName: 'John Doe',
      isDefault: true,
      createdAt: new Date()
    },
    {
      id: 'pm_2',
      type: 'card',
      brand: 'mastercard',
      last4: '8888',
      expiryMonth: 6,
      expiryYear: 2026,
      holderName: 'John Doe',
      isDefault: false,
      createdAt: new Date()
    }
  ];

  // Mock billing history (static for now, will be replaced with İyzico API)
  const invoices: Invoice[] = [
    {
      id: 'inv_1',
      number: 'QU-2024-001',
      amount: 10.1,
      currency: 'USD',
      status: 'paid',
      dueDate: new Date(),
      paidAt: new Date(),
      description: 'Premium Plan - Annual Subscription',
      downloadUrl: '#'
    },
    {
      id: 'inv_2',
      number: 'QU-2023-012',
      amount: 10.1,
      currency: 'USD',
      status: 'paid',
      dueDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      paidAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      description: 'Premium Plan - Annual Subscription',
      downloadUrl: '#'
    }
  ];

  const loadUserData = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Paralel data loading
      const [activitiesResult, statsResult] = await Promise.all([
        ActivityTracker.getUserActivities(user.uid, { limit: 20 }),
        ActivityTracker.getUserStats(user.uid)
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

    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Veriler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Redirect sadece loading tamamlandığında ve user yoksa
    if (!loading && !user) {
      redirect('/');
      return;
    }

    // User varsa ve loading tamamlandıysa data yükle
    if (user && !loading) {
      loadUserData();
    }
  }, [user, loading, loadUserData]);

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

  const getStatusBadge = (status: Subscription['status']) => {
    const badges = {
      active: { color: 'bg-green-100 text-green-800', text: 'Aktif' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'İptal Edildi' },
      paused: { color: 'bg-yellow-100 text-yellow-800', text: 'Durduruldu' },
      past_due: { color: 'bg-red-100 text-red-800', text: 'Vadesi Geçmiş' }
    };
    const badge = badges[status as keyof typeof badges];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const getCardIcon = (brand: string) => {
    const icons: Record<string, string> = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳'
    };
    return icons[brand] || '💳';
  };

  // Subscription management functions
  const handleCancelSubscription = () => {
    // İyzico cancel subscription API call
    console.log('Cancelling subscription...');
  };

  const handlePauseSubscription = () => {
    // İyzico pause subscription API call
    console.log('Pausing subscription...');
  };

  const handleResumeSubscription = () => {
    // İyzico resume subscription API call
    console.log('Resuming subscription...');
  };

  const handleAddPaymentMethod = () => {
    // İyzico add payment method flow
    console.log('Adding payment method...');
  };

  const handleDeletePaymentMethod = (id: string) => {
    // İyzico delete payment method API call
    console.log('Deleting payment method:', id);
  };

  const handleSetDefaultPaymentMethod = (id: string) => {
    // İyzico set default payment method API call
    console.log('Setting default payment method:', id);
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
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-4 text-sm">
            <Link 
              href="/" 
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              🏠 Ana Sayfa
            </Link>
            <span className="text-gray-400">›</span>
            <span className="text-gray-900 font-medium">Profilim</span>
          </nav>
        </div>
      </div>

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

            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
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
                { id: 'settings', label: 'Ayarlar', icon: CogIcon },
                { id: 'billing', label: 'Faturalama', icon: BuildingOfficeIcon },
                { id: 'payment-methods', label: 'Ödeme Yöntemleri', icon: CreditCardIcon }
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

            {/* Storage Card */}
            <StorageCard />

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
          <div className="space-y-6">
            {/* Storage Integration */}
            <StorageCard />
            
            {/* Recent Activities */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Son İşlenen Dosyalar</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Son işlediğiniz dosyalar ve işlem detayları
                </p>
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
                  activities.map((activity) => (
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

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Profile Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profil Ayarları</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad
                  </label>
                  <input
                    type="text"
                    value={userProfile?.firstName || ''}
                    readOnly
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
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={user.email || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                      <p className="text-sm text-gray-500">
                  Profil düzenleme özelliği yakında eklenecek.
                </p>
              </div>
            </div>

            {/* Storage Settings */}
            <StorageCard />

            {/* Preferences */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tercihler</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium text-gray-900">E-posta Bildirimleri</p>
                    <p className="text-sm text-gray-500">Dosya süresi dolmadan önce uyarı al</p>
                </div>
                  <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium text-gray-900">Otomatik Sıkıştırma</p>
                    <p className="text-sm text-gray-500">PDF dosyalarını otomatik olarak sıkıştır</p>
                </div>
                  <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium text-gray-900">Güvenli Silme</p>
                    <p className="text-sm text-gray-500">Dosya işleminden sonra orijinali güvenle sil</p>
                </div>
                  <input type="checkbox" className="h-4 w-4 text-blue-600" />
                </div>
                </div>
                </div>
                </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-8">
            {/* Current Subscription */}
            {subscription ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Mevcut Abonelik</h3>
                  {getStatusBadge(subscription.status)}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-2xl font-bold text-gray-900">{subscription.planName}</h4>
                      <p className="text-3xl font-bold text-blue-600 mt-2">
                        ${subscription.price}
                        <span className="text-lg font-normal text-gray-500">
                          /{subscription.billingPeriod === 'monthly' ? 'ay' : 'yıl'}
                        </span>
                      </p>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p>Dönem: {subscription.currentPeriodStart.toLocaleDateString('tr-TR')} - {subscription.currentPeriodEnd.toLocaleDateString('tr-TR')}</p>
                      <p>Sonraki faturalama: {subscription.currentPeriodEnd.toLocaleDateString('tr-TR')}</p>
                      {subscription.cancelAtPeriodEnd && (
                        <p className="text-red-600 font-medium">Bu dönem sonunda iptal edilecek</p>
                      )}
                    </div>

                    <div className="pt-4">
                      <h5 className="font-medium text-gray-900 mb-2">Plan Özellikleri:</h5>
                      <ul className="space-y-1">
                        {subscription.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-3">Abonelik Yönetimi</h5>
                      <div className="space-y-3">
                        {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
                          <>
                            <button
                              onClick={handlePauseSubscription}
                              className="w-full flex items-center justify-center px-4 py-2 border border-yellow-300 rounded-lg text-yellow-700 hover:bg-yellow-50 transition-colors"
                            >
                              <PauseCircleIcon className="w-5 h-5 mr-2" />
                              Aboneliği Duraklat
                            </button>
                            <button
                              onClick={handleCancelSubscription}
                              className="w-full flex items-center justify-center px-4 py-2 border border-red-300 rounded-lg text-red-700 hover:bg-red-50 transition-colors"
                            >
                              <XCircleIcon className="w-5 h-5 mr-2" />
                              Aboneliği İptal Et
                            </button>
                          </>
                        )}
                        
                        {subscription.status === 'paused' && (
                          <button
                            onClick={handleResumeSubscription}
                            className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <ArrowPathIcon className="w-5 h-5 mr-2" />
                            Aboneliği Yeniden Başlat
                          </button>
                        )}

                        {subscription.cancelAtPeriodEnd && (
                          <button
                            onClick={handleResumeSubscription}
                            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <ArrowPathIcon className="w-5 h-5 mr-2" />
                            İptali Geri Al
                          </button>
                        )}

                        <Link
                          href="/pricing"
                          className="w-full flex items-center justify-center px-4 py-2 border border-blue-300 rounded-lg text-blue-700 hover:bg-blue-50 transition-colors"
                        >
                          <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                          Plan Değiştir
                        </Link>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-medium text-blue-900 mb-2">💡 İpucu</h5>
                      <p className="text-sm text-blue-700">
                        Aboneliğinizi iptal ederseniz, mevcut dönem sonuna kadar tüm özellikleri kullanmaya devam edebilirsiniz.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aktif Abonelik Yok</h3>
                <p className="text-gray-600 mb-4">
                  Premium özelliklerden yararlanmak için bir plan seçin.
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Planları İncele
                </Link>
              </div>
            )}

            {/* Billing History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Faturalama Geçmişi</h3>
                <BanknotesIcon className="w-5 h-5 text-gray-400" />
              </div>
              <div className="divide-y divide-gray-200">
                {invoices.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Henüz faturalama geçmişi yok</p>
                  </div>
                ) : (
                  invoices.map((invoice) => (
                    <div key={invoice.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-sm font-medium text-gray-900">
                              Fatura #{invoice.number}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              invoice.status === 'paid' 
                                ? 'bg-green-100 text-green-800'
                                : invoice.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {invoice.status === 'paid' ? 'Ödendi' : 
                               invoice.status === 'pending' ? 'Bekliyor' : 'Başarısız'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{invoice.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center">
                              <CalendarIcon className="w-4 h-4 mr-1" />
                              Vade: {invoice.dueDate.toLocaleDateString('tr-TR')}
                            </span>
                            {invoice.paidAt && (
                              <span className="flex items-center">
                                <CheckCircleIcon className="w-4 h-4 mr-1" />
                                Ödendi: {invoice.paidAt.toLocaleDateString('tr-TR')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              ${invoice.amount.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">{invoice.currency}</p>
                          </div>
                          {invoice.downloadUrl && (
                            <button className="p-2 text-blue-600 hover:text-blue-800 transition-colors">
                              <DocumentIcon className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payment-methods' && (
          <div className="space-y-8">
            {/* Add Payment Method */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Ödeme Yöntemleri</h3>
                <button
                  onClick={handleAddPaymentMethod}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Yeni Ekle
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-6">
                Güvenli ödeme işlemleri için kredi kartı veya banka hesabı bilgilerinizi ekleyin.
              </p>

              {/* Payment Methods List */}
              <div className="space-y-4">
                {paymentMethods.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCardIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Henüz ödeme yöntemi eklenmemiş</p>
                    <button
                      onClick={handleAddPaymentMethod}
                      className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      İlk ödeme yönteminizi ekleyin
                    </button>
                  </div>
                ) : (
                  paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {method.type === 'card' ? (
                            <CreditCardIcon className="w-6 h-6 text-gray-600" />
                          ) : (
                            <BanknotesIcon className="w-6 h-6 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900">
                              {method.type === 'card' ? (
                                <>
                                  {getCardIcon(method.brand!)} **** **** **** {method.last4}
                                </>
                              ) : (
                                'Banka Transferi'
                              )}
                            </p>
                            {method.isDefault && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                Varsayılan
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {method.type === 'card' ? (
                              <>
                                {method.holderName} • {method.expiryMonth?.toString().padStart(2, '0')}/{method.expiryYear}
                              </>
                            ) : (
                              method.holderName
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            Eklendi: {method.createdAt.toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!method.isDefault && (
                          <button
                            onClick={() => handleSetDefaultPaymentMethod(method.id)}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Varsayılan Yap
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePaymentMethod(method.id)}
                          className="p-2 text-red-600 hover:text-red-800 transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Security Information */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <CheckCircleIcon className="w-6 h-6 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900 mb-2">Güvenlik Garantisi</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• 256-bit SSL şifrelemesi ile korumalı veri transferi</li>
                    <li>• PCI DSS uyumlu güvenlik standartları</li>
                    <li>• İyzico güvencesi ile güvenli ödeme işlemleri</li>
                    <li>• Kart bilgileriniz sunucularımızda saklanmaz</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Supported Payment Methods */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-medium text-gray-900 mb-4">Desteklenen Ödeme Yöntemleri</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                  <span className="text-2xl">💳</span>
                  <span className="text-sm text-gray-700">Visa</span>
                </div>
                <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                  <span className="text-2xl">💳</span>
                  <span className="text-sm text-gray-700">MasterCard</span>
                </div>
                <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                  <span className="text-2xl">🏦</span>
                  <span className="text-sm text-gray-700">Banka Transferi</span>
                </div>
                <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                  <span className="text-2xl">📱</span>
                  <span className="text-sm text-gray-700">Mobil Ödeme</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 