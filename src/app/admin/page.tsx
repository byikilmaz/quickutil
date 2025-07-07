'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminAnalytics, AdminMetrics } from '@/lib/adminAnalytics';
import { useRouter } from 'next/navigation';
import {
  ChartBarIcon,
  UsersIcon,
  DocumentIcon,
  ServerIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { ComponentType } from 'react';

export default function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Admin kontrolü
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/');
        return;
      }
      
      if (!isAdmin) {
        router.push('/');
        return;
      }
    }
  }, [user, isAdmin, loading, router]);

  // Metrics yükleme
  useEffect(() => {
    const loadMetrics = async () => {
      if (!isAdmin) return;
      
      try {
        setMetricsLoading(true);
        const data = await AdminAnalytics.getDashboardMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Metrics loading error:', err);
        setError('Veriler yüklenirken hata oluştu');
      } finally {
        setMetricsLoading(false);
      }
    };

    if (isAdmin) {
      loadMetrics();
    }
  }, [isAdmin]);

  // Loading state
  if (loading || metricsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Admin değilse erişim yok
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erişim Reddedildi</h1>
          <p className="text-gray-600">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hata</h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Yeniden Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="text-sm text-gray-500">
              Hoş geldiniz, {user?.email}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {metrics && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <KPICard
                title="Toplam Kullanıcı"
                value={metrics.totalUsers.toLocaleString()}
                icon={UsersIcon}
                color="blue"
              />
              <KPICard
                title="Toplam İşlem"
                value={metrics.totalActivities.toLocaleString()}
                icon={DocumentIcon}
                color="green"
              />
              <KPICard
                title="Bugünkü İşlemler"
                value={metrics.todayActivities.toLocaleString()}
                icon={ClockIcon}
                color="yellow"
              />
              <KPICard
                title="Başarı Oranı"
                value={`${metrics.successRate.toFixed(1)}%`}
                icon={CheckCircleIcon}
                color="green"
              />
            </div>

            {/* Activity Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktivite İstatistikleri</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Bu Hafta</span>
                    <span className="font-semibold text-gray-900">{metrics.weeklyActivities.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Bu Ay</span>
                    <span className="font-semibold text-gray-900">{metrics.monthlyActivities.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Toplam</span>
                    <span className="font-semibold text-gray-900">{metrics.totalActivities.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Popular Features */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Popüler Özellikler</h3>
                <div className="space-y-3">
                  {metrics.popularFeatures.slice(0, 5).map((feature) => (
                    <div key={feature.feature} className="flex justify-between items-center">
                      <span className="text-gray-600">{feature.feature}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{feature.percentage.toFixed(1)}%</span>
                        <span className="font-semibold text-gray-900">{feature.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Errors */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Hatalar</h3>
                <div className="space-y-3">
                  {metrics.recentErrors.length > 0 ? (
                    metrics.recentErrors.slice(0, 5).map((error) => (
                      <div key={error.error} className="border-l-4 border-red-400 pl-3">
                        <p className="text-sm font-medium text-red-800 truncate">
                          {error.error}
                        </p>
                        <p className="text-xs text-red-600">
                          {error.count} kez • {error.lastOccurred.toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Henüz hata kaydı yok</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı Erişim</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickActionButton
                  title="Kullanıcı Listesi"
                  description="Tüm kullanıcıları görüntüle"
                  icon={UsersIcon}
                  onClick={() => router.push('/admin/users')}
                />
                <QuickActionButton
                  title="Aktivite Logları"
                  description="Sistem aktivitelerini izle"
                  icon={ClockIcon}
                  onClick={() => router.push('/admin/activities')}
                />
                <QuickActionButton
                  title="Sistem Durumu"
                  description="Server durumu ve performans"
                  icon={ServerIcon}
                  onClick={() => router.push('/admin/system')}
                />
                <QuickActionButton
                  title="Raporlar"
                  description="Detaylı analiz raporları"
                  icon={ArrowTrendingUpIcon}
                  onClick={() => router.push('/admin/reports')}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// KPI Card Component
interface KPICardProps {
  title: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

function KPICard({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue' 
}: KPICardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

// Quick Action Button Component
interface QuickActionButtonProps {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  onClick: () => void;
}

function QuickActionButton({ 
  title, 
  description, 
  icon: Icon, 
  onClick 
}: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="text-left p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex items-start space-x-3">
        <Icon className="h-6 w-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
        <div>
          <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
            {title}
          </h4>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
} 