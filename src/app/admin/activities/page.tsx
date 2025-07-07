'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { AdminAnalytics, UserActivity } from '@/lib/adminAnalytics';
import {
  ClockIcon,
  ArrowLeftIcon,
  FunnelIcon,
  DocumentIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export default function AdminActivities() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<UserActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'error' | 'processing'>('all');
  const [filterFeature, setFilterFeature] = useState<string>('all');
  const [uniqueFeatures, setUniqueFeatures] = useState<string[]>([]);

  // Admin kontrolü
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/admin');
      return;
    }
  }, [user, isAdmin, loading, router]);

  // Aktiviteleri yükle
  useEffect(() => {
    const loadActivities = async () => {
      if (!isAdmin) return;
      
      try {
        setActivitiesLoading(true);
        const data = await AdminAnalytics.getRecentActivities(200);
        setActivities(data);
        setFilteredActivities(data);
        
        // Unique features'ları çıkar
        const features = Array.from(new Set(data.map(a => a.type)));
        setUniqueFeatures(features);
      } catch (error) {
        console.error('Activities loading error:', error);
      } finally {
        setActivitiesLoading(false);
      }
    };

    if (isAdmin) {
      loadActivities();
    }
  }, [isAdmin]);

  // Filtreleme
  useEffect(() => {
    let filtered = activities;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(activity => activity.status === filterStatus);
    }

    if (filterFeature !== 'all') {
      filtered = filtered.filter(activity => activity.type === filterFeature);
    }

    setFilteredActivities(filtered);
  }, [activities, filterStatus, filterFeature]);

  // Loading state
  if (loading || activitiesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Status icon helper
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <DocumentIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    const classes = {
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      processing: 'bg-yellow-100 text-yellow-800'
    };

    const labels = {
      success: 'Başarılı',
      error: 'Hata',
      processing: 'İşleniyor'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  // File size formatter
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/admin')}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              <ClockIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Aktivite Logları</h1>
            </div>
            <div className="text-sm text-gray-500">
              {filteredActivities.length} / {activities.length} aktivite
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <div className="flex flex-wrap gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'success' | 'error' | 'processing')}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tümü</option>
                  <option value="success">Başarılı</option>
                  <option value="error">Hata</option>
                  <option value="processing">İşleniyor</option>
                </select>
              </div>

              {/* Feature Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Özellik</label>
                <select
                  value={filterFeature}
                  onChange={(e) => setFilterFeature(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tümü</option>
                  {uniqueFeatures.map(feature => (
                    <option key={feature} value={feature}>{feature}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Activities List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zaman
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dosya
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Süre
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredActivities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.timestamp.toLocaleString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {activity.userEmail || 'Anonim'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {activity.userId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(activity.status)}
                        <span className="ml-2 text-sm font-medium text-gray-900">
                          {activity.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {activity.fileName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatFileSize(activity.fileSize)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(activity.status)}
                      {activity.errorMessage && (
                        <div className="text-xs text-red-600 mt-1 max-w-xs truncate">
                          {activity.errorMessage}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.processingTime ? `${activity.processingTime}ms` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredActivities.length === 0 && (
            <div className="text-center py-12">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {activities.length === 0 ? 'Henüz aktivite yok' : 'Filtrelere uygun aktivite bulunamadı'}
              </p>
            </div>
          )}
        </div>

        {/* Real-time Update Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Yenile
          </button>
        </div>
      </div>
    </div>
  );
} 