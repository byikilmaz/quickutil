import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  getDocs,
  getDoc,
  Timestamp 
} from 'firebase/firestore';
import { firestore } from './firebase';
import { 
  UserActivity, 
  ActivityFilter, 
  ActivityType, 
  ActivityStatus, 
  FileCategory,
  COLLECTIONS,
  DatabaseResponse,
  PaginatedResponse
} from '@/types/database';
import { analyzeFirebaseError } from './errorAnalyzer';

/**
 * 🎯 Activity Tracker Utility
 * Kullanıcı dosya işlem aktivitelerini kaydetme ve yönetme sistemi
 */

export class ActivityTracker {
  
  /**
   * Yeni aktivite kaydı oluştur
   */
  static async createActivity(
    userId: string,
    activityData: Omit<UserActivity, 'id' | 'userId' | 'timestamp' | 'expiresAt'>
  ): Promise<DatabaseResponse<UserActivity>> {
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 gün sonra

      const activity: Omit<UserActivity, 'id'> = {
        userId,
        timestamp: now,
        expiresAt,
        ...activityData,
        // Default values
        status: activityData.status || 'processing'
      };

      // Optional fields - sadece tanımlı olanları ekle
      if (activityData.downloadUrl) {
        activity.downloadUrl = activityData.downloadUrl;
      }
      if (activityData.compressionRatio !== undefined) {
        activity.compressionRatio = activityData.compressionRatio;
      }
      if (activityData.processingTime !== undefined) {
        activity.processingTime = activityData.processingTime;
      }
      if (activityData.googleDriveFileId) {
        activity.googleDriveFileId = activityData.googleDriveFileId;
      }
      if (activityData.processedSize !== undefined) {
        activity.processedSize = activityData.processedSize;
      }

      // Firestore'a gönderilecek data - undefined değerleri filtrele
      const firestoreData = Object.fromEntries(
        Object.entries({
          ...activity,
          timestamp: Timestamp.fromDate(activity.timestamp),
          expiresAt: Timestamp.fromDate(activity.expiresAt)
        }).filter(([, value]) => value !== undefined)
      );

      const docRef = await addDoc(collection(firestore, COLLECTIONS.USER_ACTIVITIES), firestoreData);

      const createdActivity: UserActivity = {
        id: docRef.id,
        ...activity
      };

      return {
        success: true,
        data: createdActivity,
        timestamp: now
      };

    } catch (error) {
      console.error('Error creating activity:', error);
      
      analyzeFirebaseError(error as Error, {
        code: (error as { code?: string }).code || 'activity-create-failed',
        customData: { 
          operation: 'create_activity',
          userId,
          activityType: activityData.type
        }
      });

      return {
        success: false,
        error: 'Activity kaydı oluşturulamadı',
        timestamp: new Date()
      };
    }
  }

  /**
   * Aktivite güncelle
   */
  static async updateActivity(
    activityId: string,
    updates: Partial<Pick<UserActivity, 'status' | 'processedSize' | 'processingTime' | 'compressionRatio' | 'downloadUrl' | 'googleDriveFileId'>>
  ): Promise<DatabaseResponse<boolean>> {
    try {
      const activityRef = doc(firestore, COLLECTIONS.USER_ACTIVITIES, activityId);
      
      const updateData: Record<string, string | number | boolean | Date | undefined> = {};
      Object.keys(updates).forEach(key => {
        const value = updates[key as keyof typeof updates];
        if (value !== undefined) {
          updateData[key] = value;
        }
      });

      await updateDoc(activityRef, updateData);

      return {
        success: true,
        data: true,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error updating activity:', error);
      
      analyzeFirebaseError(error as Error, {
        code: (error as { code?: string }).code || 'activity-update-failed',
        customData: { 
          operation: 'update_activity',
          activityId,
          updates
        }
      });

      return {
        success: false,
        error: 'Activity güncellenemedi',
        timestamp: new Date()
      };
    }
  }

  /**
   * Kullanıcının aktivitelerini getir
   */
  static async getUserActivities(
    userId: string,
    filter?: ActivityFilter
  ): Promise<DatabaseResponse<PaginatedResponse<UserActivity>>> {
    try {
      const activitiesRef = collection(firestore, COLLECTIONS.USER_ACTIVITIES);
      
      // Base query
      let q = query(
        activitiesRef,
        where('userId', '==', userId)
      );

      // Apply filters
      if (filter?.type && filter.type.length > 0) {
        q = query(q, where('type', 'in', filter.type));
      }

      if (filter?.status && filter.status.length > 0) {
        q = query(q, where('status', 'in', filter.status));
      }

      if (filter?.category && filter.category.length > 0) {
        q = query(q, where('category', 'in', filter.category));
      }

      // Date range filter
      if (filter?.dateRange) {
        q = query(q, 
          where('timestamp', '>=', Timestamp.fromDate(filter.dateRange.start)),
          where('timestamp', '<=', Timestamp.fromDate(filter.dateRange.end))
        );
      }

      // Sorting
      const sortBy = filter?.sortBy || 'timestamp';
      const sortOrder = filter?.sortOrder || 'desc';
      q = query(q, orderBy(sortBy, sortOrder));

      // Limit
      const limitValue = filter?.limit || 20;
      q = query(q, firestoreLimit(limitValue));

      const querySnapshot = await getDocs(q);
      const activities: UserActivity[] = [];

      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        activities.push({
          id: docSnapshot.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
          expiresAt: data.expiresAt?.toDate() || new Date()
        } as UserActivity);
      });

      // For pagination, we'd need a separate count query in a real implementation
      const total = activities.length;
      const page = Math.floor((filter?.offset || 0) / limitValue) + 1;
      const hasMore = activities.length === limitValue;

      return {
        success: true,
        data: {
          items: activities,
          total,
          page,
          limit: limitValue,
          hasMore
        },
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error fetching user activities:', error);
      
      analyzeFirebaseError(error as Error, {
        code: (error as { code?: string }).code || 'activities-fetch-failed',
        customData: { 
          operation: 'get_user_activities',
          userId,
          filter
        }
      });

      return {
        success: false,
        error: 'Aktiviteler getirilemedi',
        timestamp: new Date()
      };
    }
  }

  /**
   * Tek aktivite detayı getir
   */
  static async getActivity(activityId: string): Promise<DatabaseResponse<UserActivity>> {
    try {
      const activityRef = doc(firestore, COLLECTIONS.USER_ACTIVITIES, activityId);
      const docSnapshot = await getDoc(activityRef);

      if (!docSnapshot.exists()) {
        return {
          success: false,
          error: 'Aktivite bulunamadı',
          timestamp: new Date()
        };
      }

      const data = docSnapshot.data();
      const activity: UserActivity = {
        id: docSnapshot.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
        expiresAt: data.expiresAt?.toDate() || new Date()
      } as UserActivity;

      return {
        success: true,
        data: activity,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error fetching activity:', error);
      
      analyzeFirebaseError(error as Error, {
        code: (error as { code?: string }).code || 'activity-fetch-failed',
        customData: { 
          operation: 'get_activity',
          activityId
        }
      });

      return {
        success: false,
        error: 'Aktivite detayı getirilemedi',
        timestamp: new Date()
      };
    }
  }

  /**
   * Kullanıcı istatistiklerini hesapla
   */
  static async getUserStats(userId: string): Promise<DatabaseResponse<{
    totalFiles: number;
    totalSizeSaved: number;
    thisMonthFiles: number;
    favoriteFeature: ActivityType;
    successRate: number;
    avgProcessingTime: number;
  }>> {
    try {
      const activitiesRef = collection(firestore, COLLECTIONS.USER_ACTIVITIES);
      const q = query(
        activitiesRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      
      let totalFiles = 0;
      let totalSizeSaved = 0;
      let thisMonthFiles = 0;
      let successfulFiles = 0;
      let totalProcessingTime = 0;
      let processedFiles = 0;
      
      const featureCount: Record<string, number> = {
        pdf_compress: 0,
        pdf_convert: 0,
        image_convert: 0,
        image_compress: 0,
        image_resize: 0,
        image_crop: 0,
        image_rotate: 0,
        image_filter: 0
      };

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        totalFiles++;

        // Size savings calculation
        if (data.fileSize && data.processedSize) {
          totalSizeSaved += (data.fileSize - data.processedSize);
        }

        // This month count
        const activityDate = data.timestamp?.toDate();
        if (activityDate && 
            activityDate.getMonth() === currentMonth && 
            activityDate.getFullYear() === currentYear) {
          thisMonthFiles++;
        }

        // Success rate calculation
        if (data.status === 'success') {
          successfulFiles++;
        }

        // Processing time calculation
        if (data.processingTime && typeof data.processingTime === 'number') {
          totalProcessingTime += data.processingTime;
          processedFiles++;
        }

                 // Feature usage count
         if (data.type && data.type in featureCount) {
           featureCount[data.type]++;
         }
      });

      // Calculate favorite feature
      const favoriteFeature = Object.entries(featureCount)
        .sort(([,a], [,b]) => b - a)[0]?.[0] as ActivityType || 'pdf_compress';

      const successRate = totalFiles > 0 ? (successfulFiles / totalFiles) * 100 : 0;
      const avgProcessingTime = processedFiles > 0 ? totalProcessingTime / processedFiles : 0;

      return {
        success: true,
        data: {
          totalFiles,
          totalSizeSaved,
          thisMonthFiles,
          favoriteFeature,
          successRate,
          avgProcessingTime
        },
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error calculating user stats:', error);
      
      analyzeFirebaseError(error as Error, {
        code: (error as { code?: string }).code || 'stats-calculation-failed',
        customData: { 
          operation: 'get_user_stats',
          userId
        }
      });

      return {
        success: false,
        error: 'İstatistikler hesaplanamadı',
        timestamp: new Date()
      };
    }
  }

  /**
   * Süresi dolan aktiviteleri bul
   */
  static async getExpiringActivities(
    daysBeforeExpiration: number = 1
  ): Promise<DatabaseResponse<UserActivity[]>> {
    try {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() + daysBeforeExpiration);
      
      const activitiesRef = collection(firestore, COLLECTIONS.USER_ACTIVITIES);
      const q = query(
        activitiesRef,
        where('expiresAt', '<=', Timestamp.fromDate(checkDate)),
        where('status', '==', 'success'),
        orderBy('expiresAt', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const expiringActivities: UserActivity[] = [];

      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        expiringActivities.push({
          id: docSnapshot.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
          expiresAt: data.expiresAt?.toDate() || new Date()
        } as UserActivity);
      });

      return {
        success: true,
        data: expiringActivities,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error fetching expiring activities:', error);
      
      analyzeFirebaseError(error as Error, {
        code: (error as { code?: string }).code || 'expiring-activities-failed',
        customData: { 
          operation: 'get_expiring_activities',
          daysBeforeExpiration
        }
      });

      return {
        success: false,
        error: 'Süresi dolan aktiviteler getirilemedi',
        timestamp: new Date()
      };
    }
  }

  /**
   * Kategori bazında aktivite sayısı
   */
  static async getCategoryCounts(userId: string): Promise<DatabaseResponse<Record<FileCategory, number>>> {
    try {
      const activitiesRef = collection(firestore, COLLECTIONS.USER_ACTIVITIES);
      const q = query(
        activitiesRef,
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const categoryCounts: Record<FileCategory, number> = {
        'PDF': 0,
        'Image': 0,
        'Document': 0
      };

      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        if (data.category && categoryCounts.hasOwnProperty(data.category)) {
          categoryCounts[data.category as FileCategory]++;
        }
      });

      return {
        success: true,
        data: categoryCounts,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error fetching category counts:', error);
      
      analyzeFirebaseError(error as Error, {
        code: (error as { code?: string }).code || 'category-counts-failed',
        customData: { 
          operation: 'get_category_counts',
          userId
        }
      });

      return {
        success: false,
        error: 'Kategori sayıları getirilemedi',
        timestamp: new Date()
      };
    }
  }
}

/**
 * 🎯 Helper Functions for Activity Tracking
 */

// Quick activity creation for different types
export const trackPDFCompress = async (
  userId: string,
  fileName: string,
  originalSize: number,
  compressedSize?: number,
  processingTime?: number
) => {
  return ActivityTracker.createActivity(userId, {
    type: 'pdf_compress',
    fileName,
    originalFileName: fileName,
    fileSize: originalSize,
    processedSize: compressedSize,
    category: 'PDF',
    status: compressedSize ? 'success' : 'processing',
    processingTime,
    compressionRatio: compressedSize ? ((originalSize - compressedSize) / originalSize) * 100 : undefined
  });
};

export const trackPDFConvert = async (
  userId: string,
  fileName: string,
  fileSize: number,
  processingTime?: number
) => {
  return ActivityTracker.createActivity(userId, {
    type: 'pdf_convert',
    fileName,
    originalFileName: fileName,
    fileSize,
    category: 'PDF',
    status: 'processing',
    processingTime
  });
};

export const trackImageConvert = async (
  userId: string,
  fileName: string,
  fileSize: number,
  processedSize?: number,
  processingTime?: number
) => {
  return ActivityTracker.createActivity(userId, {
    type: 'image_convert',
    fileName,
    originalFileName: fileName,
    fileSize,
    processedSize,
    category: 'Image',
    status: processedSize ? 'success' : 'processing',
    processingTime
  });
};

export const trackImageCompress = async (
  userId: string,
  fileName: string,
  originalSize: number,
  compressedSize?: number,
  processingTime?: number
) => {
  return ActivityTracker.createActivity(userId, {
    type: 'image_compress',
    fileName,
    originalFileName: fileName,
    fileSize: originalSize,
    processedSize: compressedSize,
    category: 'Image',
    status: compressedSize ? 'success' : 'processing',
    processingTime,
    compressionRatio: compressedSize ? ((originalSize - compressedSize) / originalSize) * 100 : undefined
  });
};

export const trackImageResize = async (
  userId: string,
  fileName: string,
  originalSize: number,
  processedSize?: number,
  processingTime?: number
) => {
  return ActivityTracker.createActivity(userId, {
    type: 'image_resize',
    fileName,
    originalFileName: fileName,
    fileSize: originalSize,
    processedSize,
    category: 'Image',
    status: processedSize ? 'success' : 'processing',
    processingTime
  });
};

export const trackImageCrop = async (
  userId: string,
  fileName: string,
  originalSize: number,
  processedSize?: number,
  processingTime?: number
) => {
  return ActivityTracker.createActivity(userId, {
    type: 'image_crop',
    fileName,
    originalFileName: fileName,
    fileSize: originalSize,
    processedSize,
    category: 'Image',
    status: processedSize ? 'success' : 'processing',
    processingTime
  });
};

export const trackImageRotate = async (
  userId: string,
  fileName: string,
  originalSize: number,
  processedSize?: number,
  processingTime?: number
) => {
  return ActivityTracker.createActivity(userId, {
    type: 'image_rotate',
    fileName,
    originalFileName: fileName,
    fileSize: originalSize,
    processedSize,
    category: 'Image',
    status: processedSize ? 'success' : 'processing',
    processingTime
  });
};

export const trackImageFilter = async (
  userId: string,
  fileName: string,
  originalSize: number,
  filtersApplied: number,
  processingTime?: number
) => {
  return ActivityTracker.createActivity(userId, {
    type: 'image_filter',
    fileName,
    originalFileName: fileName,
    fileSize: originalSize,
    processedSize: originalSize, // Filters don't change file size significantly
    category: 'Image',
    status: 'success',
    processingTime,
    compressionRatio: filtersApplied // Use this field to store number of filters applied
  });
};

// Utility for formatting activity data for UI
export const formatActivityForUI = (activity: UserActivity) => {
  const typeNames: Record<ActivityType, string> = {
    pdf_compress: 'PDF Sıkıştırma',
    pdf_convert: 'PDF Dönüştürme',
    image_convert: 'Görsel Dönüştürme',
    image_compress: 'Resim Sıkıştırma',
    image_resize: 'Resim Boyutlandırma',
    image_crop: 'Resim Kırpma',
    image_rotate: 'Resim Döndürme',
    image_filter: 'Resim Filtreleme'
  };

  const statusNames: Record<ActivityStatus, string> = {
    success: 'Başarılı',
    error: 'Hata',
    processing: 'İşleniyor'
  };

  return {
    ...activity,
    typeName: typeNames[activity.type] || activity.type,
    statusName: statusNames[activity.status] || activity.status,
    formattedSize: formatFileSize(activity.fileSize),
    formattedProcessedSize: activity.processedSize ? formatFileSize(activity.processedSize) : null,
    sizeSaved: activity.processedSize ? activity.fileSize - activity.processedSize : 0,
    formattedSizeSaved: activity.processedSize ? formatFileSize(activity.fileSize - activity.processedSize) : null,
    relativeTime: formatRelativeTime(activity.timestamp),
    expiresIn: formatExpirationTime(activity.expiresAt)
  };
};

// File size formatting utility
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Relative time formatting
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Az önce';
  if (diffInHours < 24) return `${diffInHours} saat önce`;
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} gün önce`;
  return `${Math.floor(diffInHours / 168)} hafta önce`;
};

// Expiration time formatting
const formatExpirationTime = (expiresAt: Date): string => {
  const now = new Date();
  const diffInHours = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 0) return 'Süresi dolmuş';
  if (diffInHours < 24) return `${diffInHours} saat kaldı`;
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} gün kaldı`;
  return `${Math.floor(diffInHours / 168)} hafta kaldı`;
}; 