/**
 * Google AdSense Utilities
 * QuickUtil.app AdSense integration utilities
 */

// Google AdSense Publisher ID
export const ADSENSE_PUBLISHER_ID = 'pub-5137151204032748';

// AdSense Script Configuration
export const ADSENSE_CONFIG = {
  publisherId: ADSENSE_PUBLISHER_ID,
  scriptSrc: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${ADSENSE_PUBLISHER_ID}`,
  crossOrigin: 'anonymous',
  strategy: 'afterInteractive' as const,
} as const;

// Ad Unit Types
export interface AdUnitConfig {
  slot: string;
  size: [number, number] | 'responsive';
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  placement: 'header' | 'sidebar' | 'content' | 'footer';
}

// Predefined Ad Units (gelecek kullanım için)
export const AD_UNITS: Record<string, AdUnitConfig> = {
  HEADER_BANNER: {
    slot: '1234567890', // AdSense'den alınacak
    size: [728, 90],
    format: 'horizontal',
    placement: 'header',
  },
  SIDEBAR_SQUARE: {
    slot: '1234567891', // AdSense'den alınacak
    size: [300, 250],
    format: 'rectangle',
    placement: 'sidebar',
  },
  CONTENT_RESPONSIVE: {
    slot: '1234567892', // AdSense'den alınacak
    size: 'responsive',
    format: 'auto',
    placement: 'content',
  },
  FOOTER_BANNER: {
    slot: '1234567893', // AdSense'den alınacak
    size: [728, 90],
    format: 'horizontal',
    placement: 'footer',
  },
} as const;

// AdSense Script Loader
export const loadAdSenseScript = () => {
  if (typeof window === 'undefined') return;
  
  // Check if script already loaded
  if (document.querySelector(`script[src*="${ADSENSE_PUBLISHER_ID}"]`)) {
    return;
  }

  const script = document.createElement('script');
  script.src = ADSENSE_CONFIG.scriptSrc;
  script.async = true;
  script.crossOrigin = ADSENSE_CONFIG.crossOrigin;
  document.head.appendChild(script);
};

// Initialize AdSense (gelecek kullanım için)
export const initAdSense = () => {
  if (typeof window === 'undefined') return;
  
  try {
    ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({
      google_ad_client: `ca-${ADSENSE_PUBLISHER_ID}`,
      enable_page_level_ads: true,
    });
  } catch (error) {
    console.error('AdSense initialization error:', error);
  }
};

// Ad Component Props Type
export interface AdComponentProps {
  unitKey: keyof typeof AD_UNITS;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Usage Example (gelecek):
 * 
 * import { ADSENSE_CONFIG, AD_UNITS } from '@/lib/adsenseUtils';
 * 
 * <Script
 *   src={ADSENSE_CONFIG.scriptSrc}
 *   strategy={ADSENSE_CONFIG.strategy}
 *   crossOrigin={ADSENSE_CONFIG.crossOrigin}
 * />
 * 
 * <ins
 *   className="adsbygoogle"
 *   style={{ display: 'block' }}
 *   data-ad-client={`ca-${ADSENSE_PUBLISHER_ID}`}
 *   data-ad-slot={AD_UNITS.HEADER_BANNER.slot}
 *   data-ad-format="auto"
 * />
 */ 