import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  getCountFromServer,
  Timestamp 
} from 'firebase/firestore';
import { firestore } from './firebase';
import { COLLECTIONS } from '@/types/database';

export interface AdminMetrics {
  totalUsers: number;
  totalActivities: number;
  totalFilesProcessed: number;
  totalStorageUsed: number; // bytes
  todayActivities: number;
  weeklyActivities: number;
  monthlyActivities: number;
  successRate: number;
  popularFeatures: Array<{
    feature: string;
    count: number;
    percentage: number;
  }>;
  recentErrors: Array<{
    error: string;
    count: number;
    lastOccurred: Date;
  }>;
}

export interface ActivityTrend {
  date: string;
  count: number;
  feature: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  userEmail?: string;
  type: string;
  fileName: string;
  fileSize: number;
  status: 'success' | 'error' | 'processing';
  timestamp: Date;
  processingTime?: number;
  errorMessage?: string;
}

export interface UserInfo {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt?: Date;
  emailVerified?: boolean;
}

export interface ErrorSummary {
  error: string;
  count: number;
  lastOccurred: Date;
}

export class AdminAnalytics {
  /**
   * Ana dashboard metrikleri
   */
  static async getDashboardMetrics(): Promise<AdminMetrics> {
    try {
      const [
        totalUsers,
        totalActivities,
        todayActivities,
        weeklyActivities,
        monthlyActivities,
        popularFeatures,
        recentErrors,
        successRate
      ] = await Promise.all([
        this.getTotalUsers(),
        this.getTotalActivities(),
        this.getTodayActivities(),
        this.getWeeklyActivities(),
        this.getMonthlyActivities(),
        this.getPopularFeatures(),
        this.getRecentErrors(),
        this.getSuccessRate()
      ]);

      return {
        totalUsers,
        totalActivities,
        totalFilesProcessed: totalActivities, // Her activity bir dosya işleme
        totalStorageUsed: 0, // Firebase Storage API gerekli
        todayActivities,
        weeklyActivities,
        monthlyActivities,
        successRate,
        popularFeatures,
        recentErrors
      };
    } catch (error) {
      console.error('Dashboard metrics error:', error);
      throw error;
    }
  }

  /**
   * Toplam kullanıcı sayısı
   */
  static async getTotalUsers(): Promise<number> {
    try {
      const usersRef = collection(firestore, COLLECTIONS.USERS);
      const snapshot = await getCountFromServer(usersRef);
      return snapshot.data().count;
    } catch (error) {
      console.error('Get total users error:', error);
      return 0;
    }
  }

  /**
   * Toplam aktivite sayısı
   */
  static async getTotalActivities(): Promise<number> {
    try {
      const activitiesRef = collection(firestore, COLLECTIONS.USER_ACTIVITIES);
      const snapshot = await getCountFromServer(activitiesRef);
      return snapshot.data().count;
    } catch (error) {
      console.error('Get total activities error:', error);
      return 0;
    }
  }

  /**
   * Bugünkü aktiviteler
   */
  static async getTodayActivities(): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const activitiesRef = collection(firestore, COLLECTIONS.USER_ACTIVITIES);
      const q = query(
        activitiesRef,
        where('timestamp', '>=', Timestamp.fromDate(today))
      );
      
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    } catch (error) {
      console.error('Get today activities error:', error);
      return 0;
    }
  }

  /**
   * Bu haftaki aktiviteler
   */
  static async getWeeklyActivities(): Promise<number> {
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const activitiesRef = collection(firestore, COLLECTIONS.USER_ACTIVITIES);
      const q = query(
        activitiesRef,
        where('timestamp', '>=', Timestamp.fromDate(weekAgo))
      );
      
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    } catch (error) {
      console.error('Get weekly activities error:', error);
      return 0;
    }
  }

  /**
   * Bu ayki aktiviteler
   */
  static async getMonthlyActivities(): Promise<number> {
    try {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      
      const activitiesRef = collection(firestore, COLLECTIONS.USER_ACTIVITIES);
      const q = query(
        activitiesRef,
        where('timestamp', '>=', Timestamp.fromDate(monthAgo))
      );
      
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    } catch (error) {
      console.error('Get monthly activities error:', error);
      return 0;
    }
  }

  /**
   * Popüler özellikler
   */
  static async getPopularFeatures(): Promise<Array<{feature: string; count: number; percentage: number}>> {
    try {
      const activitiesRef = collection(firestore, COLLECTIONS.USER_ACTIVITIES);
      const q = query(activitiesRef, limit(1000)); // Son 1000 aktivite
      
      const snapshot = await getDocs(q);
      const featureCounts: Record<string, number> = {};
      let total = 0;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const feature = data.type;
        featureCounts[feature] = (featureCounts[feature] || 0) + 1;
        total++;
      });
      
      return Object.entries(featureCounts)
        .map(([feature, count]) => ({
          feature,
          count,
          percentage: (count / total) * 100
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    } catch (error) {
      console.error('Get popular features error:', error);
      return [];
    }
  }

  /**
   * Son hatalar
   */
  static async getRecentErrors(): Promise<Array<{error: string; count: number; lastOccurred: Date}>> {
    try {
      const activitiesRef = collection(firestore, COLLECTIONS.USER_ACTIVITIES);
      const q = query(
        activitiesRef,
        where('status', '==', 'error'),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      
      const snapshot = await getDocs(q);
      const errorCounts: Record<string, {count: number; lastOccurred: Date}> = {};
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const error = data.errorMessage || 'Unknown error';
        const timestamp = data.timestamp?.toDate() || new Date();
        
        if (!errorCounts[error]) {
          errorCounts[error] = { count: 0, lastOccurred: timestamp };
        }
        
        errorCounts[error].count++;
        if (timestamp > errorCounts[error].lastOccurred) {
          errorCounts[error].lastOccurred = timestamp;
        }
      });
      
      return Object.entries(errorCounts)
        .map(([error, data]) => ({
          error,
          count: data.count,
          lastOccurred: data.lastOccurred
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    } catch (error) {
      console.error('Get recent errors error:', error);
      return [];
    }
  }

  /**
   * Başarı oranı
   */
  static async getSuccessRate(): Promise<number> {
    try {
      const activitiesRef = collection(firestore, COLLECTIONS.USER_ACTIVITIES);
      const q = query(activitiesRef, limit(1000));
      
      const snapshot = await getDocs(q);
      let totalActivities = 0;
      let successfulActivities = 0;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        totalActivities++;
        if (data.status === 'success') {
          successfulActivities++;
        }
      });
      
      return totalActivities > 0 ? (successfulActivities / totalActivities) * 100 : 0;
    } catch (error) {
      console.error('Get success rate error:', error);
      return 0;
    }
  }

  /**
   * Aktivite trend verileri (son 30 gün)
   */
  static async getActivityTrends(): Promise<ActivityTrend[]> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const activitiesRef = collection(firestore, COLLECTIONS.USER_ACTIVITIES);
      const q = query(
        activitiesRef,
        where('timestamp', '>=', Timestamp.fromDate(thirtyDaysAgo)),
        orderBy('timestamp', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const dailyCounts: Record<string, Record<string, number>> = {};
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const date = data.timestamp?.toDate().toISOString().split('T')[0] || '';
        const feature = data.type;
        
        if (!dailyCounts[date]) {
          dailyCounts[date] = {};
        }
        
        dailyCounts[date][feature] = (dailyCounts[date][feature] || 0) + 1;
      });
      
      const trends: ActivityTrend[] = [];
      Object.entries(dailyCounts).forEach(([date, features]) => {
        Object.entries(features).forEach(([feature, count]) => {
          trends.push({ date, feature, count });
        });
      });
      
      return trends.sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('Get activity trends error:', error);
      return [];
    }
  }

  /**
   * Son kullanıcı aktiviteleri
   */
  static async getRecentActivities(limitCount: number = 50): Promise<UserActivity[]> {
    try {
      const activitiesRef = collection(firestore, COLLECTIONS.USER_ACTIVITIES);
      const q = query(
        activitiesRef,
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      const activities: UserActivity[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          userId: data.userId,
          userEmail: data.userEmail,
          type: data.type,
          fileName: data.fileName,
          fileSize: data.fileSize,
          status: data.status,
          timestamp: data.timestamp?.toDate() || new Date(),
          processingTime: data.processingTime,
          errorMessage: data.errorMessage
        });
      });
      
      return activities;
    } catch (error) {
      console.error('Get recent activities error:', error);
      return [];
    }
  }

  /**
   * Kullanıcı detayları ve aktivite geçmişi
   */
  static async getUserDetails(userId: string): Promise<{
    userInfo: UserInfo;
    activities: UserActivity[];
    stats: {
      totalActivities: number;
      successfulActivities: number;
      totalFileSize: number;
      averageProcessingTime: number;
    };
  }> {
    try {
      const [userInfo, userActivities] = await Promise.all([
        this.getUserInfo(userId),
        this.getUserActivities(userId)
      ]);
      
      const stats = {
        totalActivities: userActivities.length,
        successfulActivities: userActivities.filter(a => a.status === 'success').length,
        totalFileSize: userActivities.reduce((sum, a) => sum + a.fileSize, 0),
        averageProcessingTime: userActivities
          .filter(a => a.processingTime)
          .reduce((sum, a, _, arr) => sum + (a.processingTime || 0) / arr.length, 0)
      };
      
      return {
        userInfo,
        activities: userActivities,
        stats
      };
    } catch (error) {
      console.error('Get user details error:', error);
      throw error;
    }
  }

  private static async getUserInfo(userId: string): Promise<UserInfo> {
    // User collection'dan kullanıcı bilgilerini getir
    // Implementation gerekli
    return { id: userId, email: 'user@example.com' };
  }

  private static async getUserActivities(userId: string): Promise<UserActivity[]> {
    try {
      const activitiesRef = collection(firestore, COLLECTIONS.USER_ACTIVITIES);
      const q = query(
        activitiesRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      
      const snapshot = await getDocs(q);
      const activities: UserActivity[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          userId: data.userId,
          type: data.type,
          fileName: data.fileName,
          fileSize: data.fileSize,
          status: data.status,
          timestamp: data.timestamp?.toDate() || new Date(),
          processingTime: data.processingTime,
          errorMessage: data.errorMessage
        });
      });
      
      return activities;
    } catch (error) {
      console.error('Get user activities error:', error);
      return [];
    }
  }

  static async getErrorAnalysis(): Promise<ErrorSummary[]> {
    try {
      const activitiesRef = collection(firestore, 'userActivities');
      const q = query(
        activitiesRef, 
        where('status', '==', 'error'),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      const snapshot = await getDocs(q);
      
      const errorMap = new Map<string, { count: number; lastOccurred: Date }>();
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const error = data.errorMessage || 'Unknown error';
        const timestamp = data.timestamp?.toDate() || new Date();
        
        if (errorMap.has(error)) {
          const existing = errorMap.get(error)!;
          existing.count++;
          if (timestamp > existing.lastOccurred) {
            existing.lastOccurred = timestamp;
          }
        } else {
          errorMap.set(error, { count: 1, lastOccurred: timestamp });
        }
      });
      
      return Array.from(errorMap.entries()).map(([error, data]) => ({
        error,
        count: data.count,
        lastOccurred: data.lastOccurred
      }));
    } catch (error) {
      console.error('Get error analysis error:', error);
      return [];
    }
  }
} 