/**
 * 🗄️ Firebase Storage Utilities
 * Firebase Storage dosya yönetimi işlemleri
 */

import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  listAll,
  getMetadata
} from 'firebase/storage';
import { storage } from './firebase';

export interface StorageFile {
  id: string;
  name: string;
  fullPath: string;
  size: number;
  contentType: string;
  timeCreated: string;
  updated: string;
  downloadURL: string;
}

export interface UploadResult {
  file: StorageFile;
  downloadURL: string;
}

export class StorageUtils {
  /**
   * Dosyayı Firebase Storage'a yükle
   */
  static async uploadFile(
    userId: string,
    file: File,
    category: 'pdf' | 'image' | 'document' = 'pdf',
    customFileName?: string
  ): Promise<UploadResult> {
    try {
      // Dosya adını oluştur
      const timestamp = Date.now();
      const fileName = customFileName || `${category}_${timestamp}_${file.name}`;
      const filePath = `users/${userId}/${category}/${fileName}`;
      
      // Firebase Storage referansı
      const storageRef = ref(storage, filePath);
      
      // Metadata
      const metadata = {
        contentType: file.type,
        customMetadata: {
          userId,
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString(), // 30 gün
          category
        }
      };
      
      // Dosyayı yükle
      const snapshot = await uploadBytes(storageRef, file, metadata);
      
      // Download URL'ini al
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // File metadata'sını al
      const fileMetadata = await getMetadata(snapshot.ref);
      
      const uploadedFile: StorageFile = {
        id: snapshot.ref.name,
        name: fileName,
        fullPath: snapshot.ref.fullPath,
        size: fileMetadata.size,
        contentType: fileMetadata.contentType || file.type,
        timeCreated: fileMetadata.timeCreated,
        updated: fileMetadata.updated,
        downloadURL
      };
      
      console.log('File uploaded to Firebase Storage:', uploadedFile);
      
      return {
        file: uploadedFile,
        downloadURL
      };
      
    } catch (error) {
      console.error('Firebase Storage upload error:', error);
      throw new Error('Dosya yükleme başarısız');
    }
  }
  
  /**
   * Kullanıcının dosyalarını listele
   */
  static async listUserFiles(userId: string): Promise<StorageFile[]> {
    try {
      const userFolderRef = ref(storage, `users/${userId}`);
      const result = await listAll(userFolderRef);
      
      const files: StorageFile[] = [];
      
      // Tüm klasörleri (pdf, image, document) kontrol et
      for (const folderRef of result.prefixes) {
        const folderResult = await listAll(folderRef);
        
        for (const fileRef of folderResult.items) {
          try {
            const [metadata, downloadURL] = await Promise.all([
              getMetadata(fileRef),
              getDownloadURL(fileRef)
            ]);
            
            files.push({
              id: fileRef.name,
              name: fileRef.name,
              fullPath: fileRef.fullPath,
              size: metadata.size,
              contentType: metadata.contentType || 'application/octet-stream',
              timeCreated: metadata.timeCreated,
              updated: metadata.updated,
              downloadURL
            });
          } catch (fileError) {
            console.warn('Error getting file metadata:', fileRef.fullPath, fileError);
          }
        }
      }
      
      // Tarihe göre sırala (yeni dosyalar önce)
      files.sort((a, b) => new Date(b.timeCreated).getTime() - new Date(a.timeCreated).getTime());
      
      return files;
      
    } catch (error) {
      console.error('Firebase Storage list error:', error);
      throw new Error('Dosya listesi alınamadı');
    }
  }
  
  /**
   * Dosyayı sil
   */
  static async deleteFile(userId: string, filePath: string): Promise<void> {
    try {
      // Security check: dosya path'i user'a ait mi?
      if (!filePath.startsWith(`users/${userId}/`)) {
        throw new Error('Bu dosyaya erişim izniniz yok');
      }
      
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      
      console.log('File deleted from Firebase Storage:', filePath);
      
    } catch (error) {
      console.error('Firebase Storage delete error:', error);
      throw new Error('Dosya silinirken hata oluştu');
    }
  }
  
  /**
   * Dosya boyutunu formatla
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  /**
   * Storage quota hesapla (Firebase Storage 5GB free tier)
   */
  static async calculateUserQuota(userId: string): Promise<{
    used: number;
    limit: number;
    percentage: number;
  }> {
    try {
      const files = await this.listUserFiles(userId);
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      
      const limit = 5 * 1024 * 1024 * 1024; // 5GB free tier
      const percentage = (totalSize / limit) * 100;
      
      return {
        used: totalSize,
        limit,
        percentage: Math.min(percentage, 100)
      };
      
    } catch (error) {
      console.error('Error calculating quota:', error);
      return {
        used: 0,
        limit: 5 * 1024 * 1024 * 1024,
        percentage: 0
      };
    }
  }
  
  /**
   * Expired files cleanup (30 günden eski dosyalar)
   */
  static async cleanupExpiredFiles(userId: string): Promise<number> {
    try {
      const files = await this.listUserFiles(userId);
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      
      let deletedCount = 0;
      
      for (const file of files) {
        const fileDate = new Date(file.timeCreated);
        if (fileDate < thirtyDaysAgo) {
          try {
            await this.deleteFile(userId, file.fullPath);
            deletedCount++;
          } catch (deleteError) {
            console.warn('Error deleting expired file:', file.fullPath, deleteError);
          }
        }
      }
      
      console.log(`Cleaned up ${deletedCount} expired files for user ${userId}`);
      return deletedCount;
      
    } catch (error) {
      console.error('Error cleaning up expired files:', error);
      return 0;
    }
  }
} 