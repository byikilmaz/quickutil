/**
 * 🚗 Google Drive API Integration
 * OAuth 2.0 authentication ve file management
 */

import { GoogleDriveIntegration, FileMetadata, COLLECTIONS } from '@/types/database';
import { doc, setDoc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { firestore } from './firebase';
import { analyzeFirebaseError } from './errorAnalyzer';

// Google Drive API Configuration
export const GOOGLE_DRIVE_CONFIG = {
  CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID!,
  CLIENT_SECRET: process.env.GOOGLE_DRIVE_CLIENT_SECRET!, // Server-side only
  REDIRECT_URI: process.env.NODE_ENV === 'production' 
    ? 'https://quickutil.app/api/auth/google-drive/callback'
    : 'http://localhost:3000/api/auth/google-drive/callback',
  SCOPES: [
    'https://www.googleapis.com/auth/drive.file', // Create and edit files
    'https://www.googleapis.com/auth/drive.metadata.readonly' // Read metadata
  ]
};

// Google Drive API Endpoints
const GOOGLE_DRIVE_API = {
  BASE_URL: 'https://www.googleapis.com/drive/v3',
  UPLOAD_URL: 'https://www.googleapis.com/upload/drive/v3/files',
  AUTH_URL: 'https://oauth2.googleapis.com/token'
};

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink: string;
  webContentLink: string;
  parents: string[];
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export class GoogleDriveService {
  
  /**
   * OAuth 2.0 authorization URL oluştur
   */
  static getAuthorizationUrl(userId: string): string {
    const params = new URLSearchParams({
      client_id: GOOGLE_DRIVE_CONFIG.CLIENT_ID,
      redirect_uri: GOOGLE_DRIVE_CONFIG.REDIRECT_URI,
      response_type: 'code',
      scope: GOOGLE_DRIVE_CONFIG.SCOPES.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state: userId // User ID'yi state olarak gönder
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Authorization code'u access token'a çevir
   */
  static async exchangeCodeForTokens(
    code: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(GOOGLE_DRIVE_API.AUTH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_DRIVE_CONFIG.CLIENT_ID,
          client_secret: GOOGLE_DRIVE_CONFIG.CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
          redirect_uri: GOOGLE_DRIVE_CONFIG.REDIRECT_URI,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }

      const tokenData: TokenResponse = await response.json();

      // QuickUtil klasörü oluştur
      const folderId = await this.createQuickUtilFolder(tokenData.access_token);
      
      // Integration'ı Firestore'da kaydet
      const integration: Omit<GoogleDriveIntegration, 'id'> = {
        userId,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || '',
        tokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        scope: GOOGLE_DRIVE_CONFIG.SCOPES,
        grantedAt: new Date(),
        folderName: 'QuickUtil Files',
        folderId: folderId,
        isActive: true,
        errorCount: 0,
        quotaUsed: 0,
        quotaLimit: 15 * 1024 * 1024 * 1024 // 15GB default
      };

      await setDoc(doc(firestore, COLLECTIONS.GOOGLE_DRIVE_INTEGRATION, userId), integration);

      return { success: true };

    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      
      analyzeFirebaseError(error as Error, {
        code: 'google-drive-token-exchange-failed',
        customData: { 
          operation: 'exchange_code_for_tokens',
          userId
        }
      });

      return { success: false, error: 'Token exchange failed' };
    }
  }

  /**
   * QuickUtil klasörü oluştur
   */
  private static async createQuickUtilFolder(accessToken: string): Promise<string> {
    try {
      const response = await fetch(`${GOOGLE_DRIVE_API.BASE_URL}/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'QuickUtil Files',
          mimeType: 'application/vnd.google-apps.folder',
          parents: ['root']
        }),
      });

      if (!response.ok) {
        throw new Error(`Folder creation failed: ${response.statusText}`);
      }

      const folder: GoogleDriveFile = await response.json();
      return folder.id;

    } catch (error) {
      console.error('Error creating QuickUtil folder:', error);
      throw error;
    }
  }

  /**
   * Access token'ı yenile
   */
  static async refreshAccessToken(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const integrationDoc = await getDoc(doc(firestore, COLLECTIONS.GOOGLE_DRIVE_INTEGRATION, userId));
      
      if (!integrationDoc.exists()) {
        return { success: false, error: 'Integration not found' };
      }

      const integration = integrationDoc.data() as GoogleDriveIntegration;

      if (!integration.refreshToken) {
        return { success: false, error: 'No refresh token available' };
      }

      const response = await fetch(GOOGLE_DRIVE_API.AUTH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_DRIVE_CONFIG.CLIENT_ID,
          client_secret: GOOGLE_DRIVE_CONFIG.CLIENT_SECRET,
          refresh_token: integration.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      const tokenData: TokenResponse = await response.json();

      // Yeni token'ı kaydet
      await updateDoc(doc(firestore, COLLECTIONS.GOOGLE_DRIVE_INTEGRATION, userId), {
        accessToken: tokenData.access_token,
        tokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        lastUsedAt: new Date(),
        errorCount: 0
      });

      return { success: true };

    } catch (error) {
      console.error('Error refreshing access token:', error);
      
      // Error count'u artır
      try {
        const integrationRef = doc(firestore, COLLECTIONS.GOOGLE_DRIVE_INTEGRATION, userId);
        const integrationDoc = await getDoc(integrationRef);
        
        if (integrationDoc.exists()) {
          const currentErrorCount = integrationDoc.data().errorCount || 0;
          await updateDoc(integrationRef, {
            errorCount: currentErrorCount + 1,
            lastError: (error as Error).message,
            isActive: currentErrorCount < 5 // 5 hatadan sonra deactive et
          });
        }
      } catch (updateError) {
        console.error('Error updating error count:', updateError);
      }

      return { success: false, error: 'Token refresh failed' };
    }
  }

  /**
   * Dosya yükle
   */
  static async uploadFile(
    userId: string,
    fileName: string,
    fileData: Blob | Buffer,
    mimeType: string,
    category: 'PDF' | 'Image' | 'Document',
    activityId: string
  ): Promise<{ success: boolean; fileId?: string; error?: string }> {
    try {
      // Integration'ı kontrol et
      const integration = await this.getValidIntegration(userId);
      if (!integration) {
        return { success: false, error: 'Google Drive integration not found or expired' };
      }

      // File metadata
      const metadata = {
        name: fileName,
        parents: [integration.folderId]
      };

      // Multipart upload
      const boundary = '-------314159265358979323846';
      const delimiter = '\r\n--' + boundary + '\r\n';
      const close_delim = '\r\n--' + boundary + '--';

      const body = delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) + delimiter +
        'Content-Type: ' + mimeType + '\r\n\r\n';

      // File data'yı ekle
      const fileBuffer = fileData instanceof Blob ? 
        await fileData.arrayBuffer() : fileData.buffer;
      
      const bodyParts = [
        new TextEncoder().encode(body),
        new Uint8Array(fileBuffer),
        new TextEncoder().encode(close_delim)
      ];

      const totalLength = bodyParts.reduce((sum, part) => sum + part.length, 0);
      const combinedBody = new Uint8Array(totalLength);
      
      let offset = 0;
      bodyParts.forEach(part => {
        combinedBody.set(part, offset);
        offset += part.length;
      });

      const response = await fetch(`${GOOGLE_DRIVE_API.UPLOAD_URL}?uploadType=multipart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${integration.accessToken}`,
          'Content-Type': 'multipart/related; boundary="' + boundary + '"',
        },
        body: combinedBody,
      });

      if (!response.ok) {
        // Token expired olabilir, refresh dene
        if (response.status === 401) {
          const refreshResult = await this.refreshAccessToken(userId);
          if (refreshResult.success) {
            // Refresh başarılı, tekrar dene
            return this.uploadFile(userId, fileName, fileData, mimeType, category, activityId);
          }
        }
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const uploadedFile: GoogleDriveFile = await response.json();

      // File metadata'yı Firestore'da kaydet
      const fileMetadata: Omit<FileMetadata, 'id'> = {
        userId,
        activityId,
        googleDriveFileId: uploadedFile.id,
        googleDriveFolderId: integration.folderId,
        fileName,
        originalFileName: fileName,
        fileSize: parseInt(uploadedFile.size) || 0,
        mimeType,
        category,
        uploadedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün
        isShared: false,
        downloadCount: 0,
        status: 'active'
      };

      await addDoc(collection(firestore, COLLECTIONS.FILE_METADATA), fileMetadata);

      // Quota kullanımını güncelle
      await updateDoc(doc(firestore, COLLECTIONS.GOOGLE_DRIVE_INTEGRATION, userId), {
        quotaUsed: integration.quotaUsed + fileMetadata.fileSize,
        lastUsedAt: new Date()
      });

      return { success: true, fileId: uploadedFile.id };

    } catch (error) {
      console.error('Error uploading file to Google Drive:', error);
      
      analyzeFirebaseError(error as Error, {
        code: 'google-drive-upload-failed',
        customData: { 
          operation: 'upload_file',
          userId,
          fileName,
          fileSize: fileData instanceof Blob ? fileData.size : fileData.length
        }
      });

      return { success: false, error: 'File upload failed' };
    }
  }

  /**
   * Dosya indir
   */
  static async downloadFile(
    userId: string,
    fileId: string
  ): Promise<{ success: boolean; data?: ArrayBuffer; error?: string }> {
    try {
      const integration = await this.getValidIntegration(userId);
      if (!integration) {
        return { success: false, error: 'Google Drive integration not found or expired' };
      }

      const response = await fetch(`${GOOGLE_DRIVE_API.BASE_URL}/files/${fileId}?alt=media`, {
        headers: {
          'Authorization': `Bearer ${integration.accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          const refreshResult = await this.refreshAccessToken(userId);
          if (refreshResult.success) {
            return this.downloadFile(userId, fileId);
          }
        }
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const data = await response.arrayBuffer();

      // Download count'u artır
      // TODO: FileMetadata collection'ında download count update et

      return { success: true, data };

    } catch (error) {
      console.error('Error downloading file from Google Drive:', error);
      
      analyzeFirebaseError(error as Error, {
        code: 'google-drive-download-failed',
        customData: { 
          operation: 'download_file',
          userId,
          fileId
        }
      });

      return { success: false, error: 'File download failed' };
    }
  }

  /**
   * Dosya sil
   */
  static async deleteFile(
    userId: string,
    fileId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const integration = await this.getValidIntegration(userId);
      if (!integration) {
        return { success: false, error: 'Google Drive integration not found or expired' };
      }

      const response = await fetch(`${GOOGLE_DRIVE_API.BASE_URL}/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${integration.accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          const refreshResult = await this.refreshAccessToken(userId);
          if (refreshResult.success) {
            return this.deleteFile(userId, fileId);
          }
        }
        throw new Error(`Delete failed: ${response.statusText}`);
      }

      // Firestore'da file status'unu güncelle
      // TODO: FileMetadata collection'ında status'u 'deleted' yap

      return { success: true };

    } catch (error) {
      console.error('Error deleting file from Google Drive:', error);
      
      analyzeFirebaseError(error as Error, {
        code: 'google-drive-delete-failed',
        customData: { 
          operation: 'delete_file',
          userId,
          fileId
        }
      });

      return { success: false, error: 'File deletion failed' };
    }
  }

  /**
   * Kullanıcının dosyalarını listele
   */
  static async listUserFiles(
    userId: string,
    pageSize: number = 50,
    pageToken?: string
  ): Promise<{ 
    success: boolean; 
    files?: GoogleDriveFile[]; 
    nextPageToken?: string;
    error?: string 
  }> {
    try {
      const integration = await this.getValidIntegration(userId);
      if (!integration) {
        return { success: false, error: 'Google Drive integration not found or expired' };
      }

      const params = new URLSearchParams({
        q: `'${integration.folderId}' in parents and trashed=false`,
        pageSize: pageSize.toString(),
        fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink, parents)',
        orderBy: 'createdTime desc'
      });

      if (pageToken) {
        params.append('pageToken', pageToken);
      }

      const response = await fetch(`${GOOGLE_DRIVE_API.BASE_URL}/files?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${integration.accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          const refreshResult = await this.refreshAccessToken(userId);
          if (refreshResult.success) {
            return this.listUserFiles(userId, pageSize, pageToken);
          }
        }
        throw new Error(`List files failed: ${response.statusText}`);
      }

      const data = await response.json();

      return { 
        success: true, 
        files: data.files || [],
        nextPageToken: data.nextPageToken
      };

    } catch (error) {
      console.error('Error listing user files:', error);
      
      analyzeFirebaseError(error as Error, {
        code: 'google-drive-list-failed',
        customData: { 
          operation: 'list_user_files',
          userId
        }
      });

      return { success: false, error: 'File listing failed' };
    }
  }

  /**
   * Valid integration getir (token refresh dahil)
   */
  private static async getValidIntegration(userId: string): Promise<GoogleDriveIntegration | null> {
    try {
      const integrationDoc = await getDoc(doc(firestore, COLLECTIONS.GOOGLE_DRIVE_INTEGRATION, userId));
      
      if (!integrationDoc.exists()) {
        return null;
      }

      const integration = integrationDoc.data() as GoogleDriveIntegration;

      if (!integration.isActive) {
        return null;
      }

      // Token süresi kontrol et
      const now = new Date();
      const tokenExpiresAt = integration.tokenExpiresAt instanceof Date ? 
        integration.tokenExpiresAt : 
        (integration.tokenExpiresAt as any)?.toDate() || new Date();

      // Token 5 dakika içinde expire olacaksa refresh et
      if (tokenExpiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
        const refreshResult = await this.refreshAccessToken(userId);
        if (!refreshResult.success) {
          return null;
        }

        // Yeniden getir
        const updatedDoc = await getDoc(doc(firestore, COLLECTIONS.GOOGLE_DRIVE_INTEGRATION, userId));
        return updatedDoc.exists() ? updatedDoc.data() as GoogleDriveIntegration : null;
      }

      return integration;

    } catch (error) {
      console.error('Error getting valid integration:', error);
      return null;
    }
  }

  /**
   * Integration durumunu kontrol et
   */
  static async checkIntegrationStatus(userId: string): Promise<{
    isConnected: boolean;
    isActive: boolean;
    quotaUsed: number;
    quotaLimit: number;
    errorCount: number;
    lastError?: string;
  }> {
    try {
      const integrationDoc = await getDoc(doc(firestore, COLLECTIONS.GOOGLE_DRIVE_INTEGRATION, userId));
      
      if (!integrationDoc.exists()) {
        return {
          isConnected: false,
          isActive: false,
          quotaUsed: 0,
          quotaLimit: 0,
          errorCount: 0
        };
      }

      const integration = integrationDoc.data() as GoogleDriveIntegration;

      return {
        isConnected: true,
        isActive: integration.isActive,
        quotaUsed: integration.quotaUsed,
        quotaLimit: integration.quotaLimit,
        errorCount: integration.errorCount,
        lastError: integration.lastError
      };

    } catch (error) {
      console.error('Error checking integration status:', error);
      return {
        isConnected: false,
        isActive: false,
        quotaUsed: 0,
        quotaLimit: 0,
        errorCount: 0
      };
    }
  }

  /**
   * Integration'ı deaktif et
   */
  static async disconnectIntegration(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await updateDoc(doc(firestore, COLLECTIONS.GOOGLE_DRIVE_INTEGRATION, userId), {
        isActive: false,
        lastUsedAt: new Date()
      });

      return { success: true };

    } catch (error) {
      console.error('Error disconnecting integration:', error);
      
      analyzeFirebaseError(error as Error, {
        code: 'google-drive-disconnect-failed',
        customData: { 
          operation: 'disconnect_integration',
          userId
        }
      });

      return { success: false, error: 'Disconnection failed' };
    }
  }
} 