/**
 * 🚗 Google Drive Server-Side Client
 * Firebase Functions API'leri kullanarak Google Drive işlemleri
 */

import { auth } from './firebase';

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdTime: string;
  modifiedTime?: string;
}

export interface GoogleDriveQuota {
  limit: number;
  usage: number;
  usageInDrive?: number;
}

export interface GoogleDriveAuth {
  isSignedIn: boolean;
  user: {
    email: string;
    name: string;
    picture: string;
  } | null;
}

class GoogleDriveServerClient {
  private baseUrl: string;

  constructor() {
    // Production/Development URL'lerini ayarla
    if (process.env.NODE_ENV === 'development') {
      this.baseUrl = 'http://localhost:5001/quickutil-d2998/us-central1';
    } else {
      this.baseUrl = 'https://us-central1-quickutil-d2998.cloudfunctions.net';
    }
  }

  /**
   * Firebase Auth token'ını al
   */
  private async getAuthToken(): Promise<string> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Kullanıcı giriş yapmamış');
    }

    const token = await currentUser.getIdToken();
    return token;
  }

  /**
   * API request helper
   */
  private async makeRequest(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<Response> {
    const token = await this.getAuthToken();
    
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'API request failed');
    }

    return response;
  }

  /**
   * Authentication durumu kontrolü (Firebase Auth'a dayalı)
   */
  async checkAuthStatus(): Promise<GoogleDriveAuth> {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      return {
        isSignedIn: false,
        user: null
      };
    }

    return {
      isSignedIn: true,
      user: {
        email: currentUser.email || '',
        name: currentUser.displayName || 'Kullanıcı',
        picture: currentUser.photoURL || ''
      }
    };
  }

  /**
   * Dosyayı server'a yükle (merkezi Google Drive'a)
   */
  async uploadFile(file: File, fileName?: string): Promise<GoogleDriveFile> {
    try {
      const token = await this.getAuthToken();
      
      const formData = new FormData();
      formData.append('file', file);
      if (fileName) {
        formData.append('fileName', fileName);
      }

      const response = await fetch(`${this.baseUrl}/uploadFile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Content-Type'ı FormData ile otomatik ayarlanır
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Dosya yükleme başarısız');
      }

      const result = await response.json();
      return result.file;

    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Dosya yükleme başarısız');
    }
  }

  /**
   * Kullanıcının dosyalarını listele
   */
  async listFiles(): Promise<GoogleDriveFile[]> {
    try {
      const response = await this.makeRequest('listFiles');
      const result = await response.json();
      return result.files || [];

    } catch (error) {
      console.error('Error listing files:', error);
      throw new Error('Dosya listesi alınamadı');
    }
  }

  /**
   * Dosyayı sil
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      await this.makeRequest(`deleteFile?fileId=${fileId}`, {
        method: 'DELETE'
      });

      console.log('File deleted successfully:', fileId);

    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Dosya silinirken hata oluştu');
    }
  }

  /**
   * Dosyayı indir
   */
  async downloadFile(fileId: string, fileName: string): Promise<void> {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(`${this.baseUrl}/downloadFile?fileId=${fileId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Dosya indirilemedi');
      }

      // Blob'u download et
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error('Dosya indirilemedi');
    }
  }

  /**
   * Drive quota bilgisini al
   */
  async getQuotaInfo(): Promise<GoogleDriveQuota> {
    try {
      const response = await this.makeRequest('getQuotaInfo');
      const result = await response.json();
      
      return {
        limit: parseInt(result.quota?.limit || '0'),
        usage: parseInt(result.quota?.usage || '0'),
        usageInDrive: parseInt(result.quota?.usageInDrive || '0')
      };

    } catch (error) {
      console.error('Error getting quota info:', error);
      return {
        limit: 0,
        usage: 0,
        usageInDrive: 0
      };
    }
  }

  /**
   * Kullanıcı giriş yapmamış durumunda dummy functions
   */
  async signIn(): Promise<GoogleDriveAuth> {
    // Server-side yaklaşımında kullanıcı zaten Firebase Auth ile giriş yapmış
    return await this.checkAuthStatus();
  }

  async signOut(): Promise<void> {
    // Server-side yaklaşımında Google Drive çıkışı gerekmiyor
    // Firebase Auth logout yeterli
    console.log('Server-side Google Drive - sign out not required');
  }

  /**
   * Folder management (server-side otomatik)
   */
  async getOrCreateQuickUtilFolder(): Promise<string> {
    // Server-side'da otomatik olarak hallediliyor
    return 'server-managed-folder';
  }
}

// Singleton instance
export const googleDriveServerClient = new GoogleDriveServerClient();

export default googleDriveServerClient; 