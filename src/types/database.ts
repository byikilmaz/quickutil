// User Activity Tracking Types
export interface UserActivity {
  id?: string;
  userId: string;
  type: 'pdf_compress' | 'pdf_convert' | 'image_compress' | 'image_resize' | 'image_crop' | 'image_rotate' | 'image_filter' | 'image_batch'
  | 'image_convert' | 'image_convert';
  fileName: string;
  originalFileName: string;
  fileSize: number;
  processedSize?: number;
  timestamp: Date;
  status: 'success' | 'error' | 'processing';
  category: 'PDF' | 'Image' | 'Document' | 'Batch';
  processingTime?: number; // in milliseconds
  compressionRatio?: number; // percentage
  googleDriveFileId?: string; // Google Drive file ID
  downloadUrl?: string;
  expiresAt: Date; // 30 days from creation
  ipAddress?: string;
  userAgent?: string;
  errorMessage?: string; // Error message for failed operations
}

// File Metadata for Google Drive Integration
export interface FileMetadata {
  id?: string;
  userId: string;
  activityId: string;
  googleDriveFileId: string;
  googleDriveFolderId: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  category: 'PDF' | 'Image' | 'Document' | 'Batch';
  uploadedAt: Date;
  expiresAt: Date;
  lastAccessedAt?: Date;
  isShared: boolean;
  shareUrl?: string;
  downloadCount: number;
  status: 'active' | 'expired' | 'deleted' | 'error';
}

// Email Notification System Types
export interface EmailNotification {
  id?: string;
  userId: string;
  type: 'expiration_warning' | 'file_processed' | 'file_expired' | 'weekly_summary';
  recipientEmail: string;
  recipientName: string;
  subject: string;
  templateData: Record<string, unknown>;
  scheduledFor: Date;
  sentAt?: Date;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  retryCount: number;
  errorMessage?: string;
  relatedFileIds?: string[];
  relatedActivityIds?: string[];
}

// Google Drive Integration Types
export interface GoogleDriveIntegration {
  id?: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: Date;
  scope: string[];
  grantedAt: Date;
  lastUsedAt?: Date;
  folderName: string; // QuickUtil folder name
  folderId: string; // Google Drive folder ID
  isActive: boolean;
  errorCount: number;
  lastError?: string;
  quotaUsed: number; // in bytes
  quotaLimit: number; // in bytes
}

// User Preferences & Settings
export interface UserSettings {
  id?: string;
  userId: string;
  emailNotifications: {
    fileProcessed: boolean;
    expirationWarning: boolean;
    weeklySummary: boolean;
    marketingEmails: boolean;
  };
  autoDelete: {
    enabled: boolean;
    retentionDays: number; // default 30
    warningDays: number; // default 1
  };
  googleDrive: {
    autoUpload: boolean;
    folderOrganization: 'by_date' | 'by_type' | 'single_folder';
    compressionLevel: 'light' | 'medium' | 'heavy';
  };
  privacy: {
    trackingEnabled: boolean;
    analyticsEnabled: boolean;
    shareUsageData: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// System Statistics & Analytics
export interface SystemStats {
  id?: string;
  date: Date; // Daily stats
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalFiles: number;
  totalSizeSaved: number;
  featureUsage: {
    pdfCompress: number;
    pdfConvert: number;
    imageCompress: number;
    imageResize: number;
    imageCrop: number;
    imageRotate: number;
    imageFilter: number;
    imageBatch: number;
  };
  avgProcessingTime: number;
  successRate: number;
  errorRate: number;
  googleDriveUploads: number;
  emailsSent: number;
  storageUsed: number; // in bytes
}

// Scheduled Task Status
export interface ScheduledTask {
  id?: string;
  type: 'file_cleanup' | 'expiration_check' | 'email_notifications' | 'token_refresh';
  status: 'pending' | 'running' | 'completed' | 'failed';
  scheduledFor: Date;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number; // in milliseconds
  affectedRecords: number;
  errorMessage?: string;
  retryCount: number;
  lastRetryAt?: Date;
  metadata?: Record<string, unknown>;
}

// File Processing Queue
export interface ProcessingQueue {
  id?: string;
  userId: string;
  fileName: string;
  fileSize: number;
  type: 'pdf_compress' | 'pdf_convert' | 'image_compress' | 'image_resize' | 'image_crop' | 'image_rotate' | 'image_filter' | 'image_batch'
  | 'image_convert' | 'image_convert';
  priority: 'low' | 'normal' | 'high';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  queuedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  processingTime?: number;
  errorMessage?: string;
  retryCount: number;
  tempFileUrl?: string;
  resultFileUrl?: string;
}

// Error Tracking
export interface ErrorLog {
  id?: string;
  userId?: string;
  type: 'processing' | 'upload' | 'download' | 'auth' | 'email' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stackTrace?: string;
  context: Record<string, unknown>;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  userAgent?: string;
  ipAddress?: string;
  activityId?: string;
  fileId?: string;
}

// Usage Analytics
export interface UsageAnalytics {
  id?: string;
  userId: string;
  sessionId: string;
  event: 'page_view' | 'file_upload' | 'file_download' | 'feature_use' | 'error';
  eventData: Record<string, unknown>;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  duration?: number; // for session events
}

// Firestore Collection Names (for consistency)
export const COLLECTIONS = {
  USERS: 'users',
  USER_ACTIVITIES: 'userActivities',
  FILE_METADATA: 'fileMetadata',
  EMAIL_NOTIFICATIONS: 'emailNotifications',
  GOOGLE_DRIVE_INTEGRATION: 'googleDriveIntegration',
  USER_SETTINGS: 'userSettings',
  SYSTEM_STATS: 'systemStats',
  SCHEDULED_TASKS: 'scheduledTasks',
  PROCESSING_QUEUE: 'processingQueue',
  ERROR_LOGS: 'errorLogs',
  USAGE_ANALYTICS: 'usageAnalytics'
} as const;

// Utility Types
export type ActivityType = 
  | 'pdf_compress' 
  | 'pdf_convert' 
  | 'pdf_merge'
  | 'pdf_split'
  | 'image_compress' 
  | 'image_resize' 
  | 'image_crop' 
  | 'image_rotate' 
  | 'image_filter' 
  | 'image_batch'
  | 'image_convert'
  | 'image_convert';
export type ActivityStatus = UserActivity['status'];
export type FileCategory = UserActivity['category'];
export type NotificationType = EmailNotification['type'];
export type TaskType = ScheduledTask['type'];

// Database Response Types
export interface DatabaseResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Search & Filter Types
export interface ActivityFilter {
  userId?: string;
  type?: ActivityType[];
  status?: ActivityStatus[];
  category?: FileCategory[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'fileSize' | 'fileName';
  sortOrder?: 'asc' | 'desc';
}

export interface FileFilter {
  userId?: string;
  category?: FileCategory[];
  expirationRange?: {
    start: Date;
    end: Date;
  };
  status?: FileMetadata['status'][];
  limit?: number;
  offset?: number;
} 