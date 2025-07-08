/**
 * 🔥 Oracle Cloud PDF Compression Integration
 * iLovePDF seviyesinde %80-90 compression with Always Free tier
 * 
 * Author: QuickUtil.app Team
 * Target: Unlimited free compression at professional level
 */

export interface OracleCompressionOptions {
  quality: '/screen' | '/ebook' | '/printer' | '/prepress';
  timeout?: number;
}

export interface OracleCompressionResult {
  success: boolean;
  blob?: Blob;
  compressionRatio?: number;
  originalSize?: string;
  compressedSize?: string;
  executionTime?: string;
  error?: string;
}

export interface OracleHealthStatus {
  status: 'healthy' | 'unhealthy';
  ghostscript_version?: string;
  disk_usage?: string;
  memory_usage?: string;
  uptime?: string;
}

export class OracleCompressionService {
  private static readonly API_BASE_URL = process.env.NEXT_PUBLIC_ORACLE_COMPRESSION_API || 'https://your-oracle-domain.com';
  private static readonly DEFAULT_TIMEOUT = 300000; // 5 minutes
  
  /**
   * Check Oracle Cloud API health status
   */
  static async checkHealth(): Promise<OracleHealthStatus> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        return { status: 'unhealthy', error: `HTTP ${response.status}` } as OracleHealthStatus;
      }
      
      const data = await response.json();
      return {
        status: 'healthy',
        ghostscript_version: data.ghostscript_version,
        disk_usage: data.system_info?.disk_usage,
        memory_usage: data.system_info?.memory_usage,
        uptime: data.system_info?.uptime
      };
      
    } catch (error) {
      console.error('Oracle health check failed:', error);
      return { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      } as OracleHealthStatus;
    }
  }
  
  /**
   * Compress PDF using Oracle Cloud API
   */
  static async compressPDF(
    file: File, 
    options: OracleCompressionOptions = { quality: '/screen' }
  ): Promise<OracleCompressionResult> {
    
    try {
      // Validate file
      if (!file || file.type !== 'application/pdf') {
        throw new Error('Invalid PDF file');
      }
      
      // Check file size (100MB limit for Always Free tier)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        throw new Error(`File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`);
      }
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('quality', options.quality);
      
      // Track start time
      const startTime = Date.now();
      
      // Call Oracle Cloud API
      const response = await fetch(`${this.API_BASE_URL}/compress`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(options.timeout || this.DEFAULT_TIMEOUT)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Oracle API error (${response.status}): ${errorText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Compression failed');
      }
      
      // Download compressed file
      const downloadResponse = await fetch(`${this.API_BASE_URL}${result.download_url}`, {
        signal: AbortSignal.timeout(30000) // 30 seconds for download
      });
      
      if (!downloadResponse.ok) {
        throw new Error(`Download failed: ${downloadResponse.statusText}`);
      }
      
      const blob = await downloadResponse.blob();
      const executionTime = `${(Date.now() - startTime) / 1000}s`;
      
      return {
        success: true,
        blob,
        compressionRatio: result.compression_ratio,
        originalSize: result.original_size_formatted,
        compressedSize: result.compressed_size_formatted,
        executionTime
      };
      
    } catch (error) {
      console.error('Oracle compression error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'TimeoutError') {
          return {
            success: false,
            error: 'İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.'
          };
        }
        
        if (error.message.includes('fetch')) {
          return {
            success: false,
            error: 'Oracle Cloud API\'ye bağlanılamadı. İnternet bağlantınızı kontrol edin.'
          };
        }
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata oluştu'
      };
    }
  }
  
  /**
   * Compress multiple PDFs in batch
   */
  static async compressBatch(
    files: File[], 
    options: OracleCompressionOptions = { quality: '/screen' }
  ): Promise<OracleCompressionResult> {
    
    try {
      if (!files || files.length === 0) {
        throw new Error('No files provided');
      }
      
      // Validate all files
      for (const file of files) {
        if (file.type !== 'application/pdf') {
          throw new Error(`Invalid file type: ${file.name}`);
        }
      }
      
      // Create form data
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`files`, file);
      });
      formData.append('quality', options.quality);
      
      // Track start time
      const startTime = Date.now();
      
      // Call Oracle Cloud batch API
      const response = await fetch(`${this.API_BASE_URL}/compress-batch`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(options.timeout || this.DEFAULT_TIMEOUT * 2) // Double timeout for batch
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Batch compression error (${response.status}): ${errorText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Batch compression failed');
      }
      
      // Download ZIP file
      const downloadResponse = await fetch(`${this.API_BASE_URL}${result.download_url}`, {
        signal: AbortSignal.timeout(60000) // 1 minute for ZIP download
      });
      
      if (!downloadResponse.ok) {
        throw new Error(`ZIP download failed: ${downloadResponse.statusText}`);
      }
      
      const blob = await downloadResponse.blob();
      const executionTime = `${(Date.now() - startTime) / 1000}s`;
      
      return {
        success: true,
        blob,
        compressionRatio: result.average_compression_ratio,
        originalSize: result.total_original_size_formatted,
        compressedSize: result.total_compressed_size_formatted,
        executionTime
      };
      
    } catch (error) {
      console.error('Oracle batch compression error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Batch compression failed'
      };
    }
  }
  
  /**
   * Get available compression profiles
   */
  static async getProfiles(): Promise<{ [key: string]: any }> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/profiles`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get profiles: ${response.statusText}`);
      }
      
      return await response.json();
      
    } catch (error) {
      console.error('Failed to get compression profiles:', error);
      return {
        '/screen': { name: 'Web Optimized', description: 'Maksimum sıkıştırma (%80-90)' },
        '/ebook': { name: 'E-book', description: 'E-kitap kalitesi (%60-80)' },
        '/printer': { name: 'Print Quality', description: 'Yazdırma kalitesi (%40-60)' },
        '/prepress': { name: 'High Quality', description: 'Yüksek kalite (%20-40)' }
      };
    }
  }
}

/**
 * Helper function for React components
 */
export const useOracleCompression = () => {
  const compressPDF = async (file: File, quality: string = '/screen') => {
    return await OracleCompressionService.compressPDF(file, { quality: quality as any });
  };
  
  const compressBatch = async (files: File[], quality: string = '/screen') => {
    return await OracleCompressionService.compressBatch(files, { quality: quality as any });
  };
  
  const checkHealth = async () => {
    return await OracleCompressionService.checkHealth();
  };
  
  return {
    compressPDF,
    compressBatch,
    checkHealth
  };
};

/**
 * Quality level helpers
 */
export const COMPRESSION_PROFILES = {
  '/screen': {
    name: 'Web Optimized',
    description: 'Maksimum sıkıştırma - Web kullanımı için optimize edilmiş',
    expectedRatio: '80-90%',
    useCase: 'Web paylaşımı, e-posta gönderimi',
    icon: '🌐'
  },
  '/ebook': {
    name: 'E-book Quality',
    description: 'E-kitap kalitesi - Okuma için optimize edilmiş',
    expectedRatio: '60-80%',
    useCase: 'E-kitap okuma, tablet görüntüleme',
    icon: '📖'
  },
  '/printer': {
    name: 'Print Quality',
    description: 'Yazdırma kalitesi - Normal yazdırma için optimize edilmiş',
    expectedRatio: '40-60%',
    useCase: 'Ev yazıcıları, ofis kullanımı',
    icon: '🖨️'
  },
  '/prepress': {
    name: 'High Quality',
    description: 'Yüksek kalite - Profesyonel yazdırma için optimize edilmiş',
    expectedRatio: '20-40%',
    useCase: 'Profesyonel yazdırma, arşivleme',
    icon: '🎯'
  }
} as const;

export type CompressionProfile = keyof typeof COMPRESSION_PROFILES; 