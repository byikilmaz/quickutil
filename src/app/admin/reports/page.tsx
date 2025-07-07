'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { AdminAnalytics, ActivityTrend } from '@/lib/adminAnalytics';
import {
  ChartBarIcon,
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Add chart data interfaces at the top
interface ChartDataItem {
  date: string;
  total: number;
  [key: string]: string | number;
}

interface FeatureDataItem {
  feature: string;
  count: number;
}

interface PieLabelProps {
  name?: string;
  percent?: number;
}

export default function AdminReports() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [activityTrends, setActivityTrends] = useState<ActivityTrend[]>([]);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Admin kontrolü
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/admin');
      return;
    }
  }, [user, isAdmin, loading, router]);

  // Chart verilerini yükle
  useEffect(() => {
    const loadChartData = async () => {
      if (!isAdmin) return;
      
      try {
        setChartsLoading(true);
        const trends = await AdminAnalytics.getActivityTrends();
        setActivityTrends(trends);
      } catch (error) {
        console.error('Chart data loading error:', error);
      } finally {
        setChartsLoading(false);
      }
    };

    if (isAdmin) {
      loadChartData();
    }
  }, [isAdmin, dateRange]);

  // Chart verilerini hazırla
  const prepareChartData = (): ChartDataItem[] => {
    const dailyData: Record<string, ChartDataItem> = {};
    
    activityTrends.forEach(trend => {
      if (!dailyData[trend.date]) {
        dailyData[trend.date] = { date: trend.date, total: 0 };
      }
      dailyData[trend.date][trend.feature] = trend.count;
      dailyData[trend.date].total += trend.count;
    });

    return Object.values(dailyData).sort((a, b) => 
      a.date.localeCompare(b.date)
    );
  };

  // Feature popularity data
  const prepareFeatureData = (): FeatureDataItem[] => {
    const featureCounts: Record<string, number> = {};
    
    activityTrends.forEach(trend => {
      featureCounts[trend.feature] = (featureCounts[trend.feature] || 0) + trend.count;
    });

    return Object.entries(featureCounts)
      .map(([feature, count]) => ({ feature, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  // Colors for charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  // Loading state
  if (loading || chartsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const chartData = prepareChartData();
  const featureData = prepareFeatureData();

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
              <ChartBarIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Raporlar ve Analizler</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Date Range Selector */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d')}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Son 7 Gün</option>
                <option value="30d">Son 30 Gün</option>
                <option value="90d">Son 90 Gün</option>
              </select>
              
              <button
                onClick={() => {/* Export functionality */}}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Dışa Aktar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          
          {/* Activity Trend Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Aktivite Trendi</h3>
              <div className="flex items-center text-sm text-gray-500">
                <CalendarIcon className="h-4 w-4 mr-1" />
                Son {dateRange === '7d' ? '7' : dateRange === '30d' ? '30' : '90'} gün
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date as string).toLocaleDateString('tr-TR')}
                    formatter={(value: number, name: string) => [value, name]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Feature Popularity Bar Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Popüler Özellikler</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={featureData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="feature" tick={{ fontSize: 12 }} width={100} />
                    <Tooltip formatter={(value: number) => [value, 'Kullanım']} />
                    <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Feature Distribution Pie Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Özellik Dağılımı</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={featureData.slice(0, 6)}
                      dataKey="count"
                      nameKey="feature"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label={(props: PieLabelProps) => {
                        const { name, percent } = props;
                        return `${name || 'Unknown'} (${((percent || 0) * 100).toFixed(1)}%)`;
                      }}
                    >
                      {featureData.slice(0, 6).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Özet İstatistikler</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {chartData.reduce((sum, day) => sum + day.total, 0).toLocaleString()}
                </div>
                <div className="text-gray-600">Toplam İşlem</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {chartData.length > 0 ? Math.round(chartData.reduce((sum, day) => sum + day.total, 0) / chartData.length) : 0}
                </div>
                <div className="text-gray-600">Günlük Ortalama</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {featureData.length}
                </div>
                <div className="text-gray-600">Aktif Özellik</div>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dışa Aktarma Seçenekleri</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <ArrowDownTrayIcon className="h-5 w-5 mr-2 text-gray-500" />
                CSV Raporu
              </button>
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <ArrowDownTrayIcon className="h-5 w-5 mr-2 text-gray-500" />
                Excel Raporu
              </button>
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <ArrowDownTrayIcon className="h-5 w-5 mr-2 text-gray-500" />
                PDF Raporu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 