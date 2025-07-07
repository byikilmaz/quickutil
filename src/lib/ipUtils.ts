// QuickUtil.app - IP Detection & Client Information Utilities

/**
 * Get client IP address from various sources
 */
export async function getClientIP(): Promise<string> {
  try {
    // Try multiple IP detection services
    const services = [
      'https://api.ipify.org?format=json',
      'https://ipapi.co/json/',
      'https://httpbin.org/ip'
    ];

    for (const service of services) {
      try {
        const response = await fetch(service, { 
          method: 'GET',
          cache: 'no-cache'
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Handle different response formats
          const ip = data.ip || data.query || data.origin;
          if (ip && isValidIP(ip)) {
            return ip;
          }
        }
      } catch (error) {
        console.warn(`IP service ${service} failed:`, error);
        continue;
      }
    }

    // Fallback: Try to get from headers (server-side)
    if (typeof window === 'undefined') {
      // Server-side fallback
      return '127.0.0.1';
    }

    // Client-side fallback: Use a hash of user agent + timestamp
    const userAgent = navigator.userAgent;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language;
    
    const fingerprint = `${userAgent}-${timezone}-${language}`;
    const hash = await hashString(fingerprint);
    
    // Convert hash to IP-like format for consistent tracking
    return generatePseudoIP(hash);
    
  } catch (error) {
    console.error('Failed to get client IP:', error);
    
    // Ultimate fallback
    const fallbackHash = Math.random().toString(36).substring(2);
    return generatePseudoIP(fallbackHash);
  }
}

/**
 * Validate IP address format
 */
export function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  
  if (ipv4Regex.test(ip)) {
    // Validate IPv4 ranges
    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }
  
  return ipv6Regex.test(ip);
}

/**
 * Generate pseudo IP from hash for consistent tracking
 */
function generatePseudoIP(hash: string): string {
  // Convert hash to 4 octets
  const hashNum = parseInt(hash.substring(0, 8), 36);
  const octet3 = (hashNum >>> 8) & 255;
  const octet4 = hashNum & 255;
  
  // Use private IP range (192.168.x.x) to indicate pseudo IP
  return `192.168.${octet3}.${octet4}`;
}

/**
 * Hash string using Web Crypto API
 */
async function hashString(str: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback hash for environments without crypto.subtle
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }
}

/**
 * Get client information for tracking
 */
export function getClientInfo() {
  if (typeof window === 'undefined') {
    return {
      userAgent: 'Server',
      language: 'en',
      timezone: 'UTC',
      screen: { width: 1920, height: 1080 },
      platform: 'Server'
    };
  }

  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: {
      width: window.screen.width,
      height: window.screen.height
    },
    platform: navigator.platform
  };
}

/**
 * Check if IP is in private range
 */
export function isPrivateIP(ip: string): boolean {
  if (!isValidIP(ip)) return false;
  
  // Check for IPv4 private ranges
  if (ip.includes('.')) {
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^127\./,
      /^169\.254\./
    ];
    
    return privateRanges.some(range => range.test(ip));
  }
  
  // Check for IPv6 private ranges
  const ipv6PrivateRanges = [
    /^::1$/, // localhost
    /^fc00:/, // unique local
    /^fe80:/, // link local
  ];
  
  return ipv6PrivateRanges.some(range => range.test(ip));
}

/**
 * Rate limiting cache for IP requests
 */
const ipCache = new Map<string, { ip: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached IP or fetch new one
 */
export async function getCachedClientIP(): Promise<string> {
  const cacheKey = 'client_ip';
  const cached = ipCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.ip;
  }
  
  const ip = await getClientIP();
  ipCache.set(cacheKey, { ip, timestamp: Date.now() });
  
  return ip;
}

/**
 * Clean up old cache entries
 */
export function cleanupIPCache(): void {
  const now = Date.now();
  for (const [key, value] of ipCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      ipCache.delete(key);
    }
  }
}

// Auto cleanup every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupIPCache, 10 * 60 * 1000);
} 