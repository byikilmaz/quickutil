// Professional Image Filters Library for QuickUtil.app
// Canvas-based filter pipeline with real-time preview support

export interface FilterConfig {
  brightness: number;    // -100 to +100
  contrast: number;      // -100 to +100  
  saturation: number;    // -100 to +100
  hue: number;          // -180 to +180
  blur: number;         // 0 to 20px
  sharpen: number;      // 0 to 100
  vintage: boolean;     // Preset effect
  sepia: boolean;       // Preset effect
  blackWhite: boolean;  // Preset effect
}

export interface FilterResult {
  filteredImage: string; // Data URL
  appliedFilters: string[];
  processingTime: number;
}

// Default filter configuration
export const defaultFilterConfig: FilterConfig = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  blur: 0,
  sharpen: 0,
  vintage: false,
  sepia: false,
  blackWhite: false
};

// Filter preset configurations
export const filterPresets = {
  vintage: {
    brightness: 10,
    contrast: 15,
    saturation: -20,
    sepia: true,
    vintage: true
  },
  blackWhite: {
    saturation: -100,
    contrast: 10,
    blackWhite: true
  },
  vibrant: {
    brightness: 5,
    contrast: 20,
    saturation: 30
  },
  soft: {
    brightness: -5,
    contrast: -10,
    blur: 1
  },
  sharp: {
    contrast: 15,
    sharpen: 40
  }
};

/**
 * Apply brightness adjustment to canvas
 */
export function applyBrightness(
  canvas: HTMLCanvasElement, 
  brightness: number
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const factor = brightness * 2.55; // Convert -100/+100 to -255/+255

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, data[i] + factor));     // Red
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + factor)); // Green
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + factor)); // Blue
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Apply contrast adjustment to canvas
 */
export function applyContrast(
  canvas: HTMLCanvasElement, 
  contrast: number
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));
    data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128));
    data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128));
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Apply saturation adjustment to canvas
 */
export function applySaturation(
  canvas: HTMLCanvasElement, 
  saturation: number
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const factor = saturation / 100;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Calculate luminance
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    // Apply saturation
    data[i] = Math.max(0, Math.min(255, luminance + factor * (r - luminance)));
    data[i + 1] = Math.max(0, Math.min(255, luminance + factor * (g - luminance)));
    data[i + 2] = Math.max(0, Math.min(255, luminance + factor * (b - luminance)));
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Apply hue adjustment to canvas
 */
export function applyHue(
  canvas: HTMLCanvasElement, 
  hue: number
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Use CSS filter for hue rotation (more efficient)
  ctx.filter = `hue-rotate(${hue}deg)`;
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.putImageData(imageData, 0, 0);
  
  // Reset filter
  ctx.filter = 'none';
}

/**
 * Apply Gaussian blur to canvas
 */
export function applyBlur(
  canvas: HTMLCanvasElement, 
  blurRadius: number
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx || blurRadius <= 0) return;

  // Use CSS filter for blur (hardware accelerated)
  ctx.filter = `blur(${blurRadius}px)`;
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.putImageData(imageData, 0, 0);
  
  // Reset filter
  ctx.filter = 'none';
}

/**
 * Apply sharpening filter using unsharp mask
 */
export function applySharpen(
  canvas: HTMLCanvasElement, 
  sharpenAmount: number
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx || sharpenAmount <= 0) return;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;
  const factor = sharpenAmount / 100;

  // Sharpening kernel (unsharp mask)
  const kernel = [
    0, -factor, 0,
    -factor, 1 + 4 * factor, -factor,
    0, -factor, 0
  ];

  const newData = new Uint8ClampedArray(data);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) { // RGB channels
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixelIndex = ((y + ky) * width + (x + kx)) * 4 + c;
            const kernelIndex = (ky + 1) * 3 + (kx + 1);
            sum += data[pixelIndex] * kernel[kernelIndex];
          }
        }
        const currentIndex = (y * width + x) * 4 + c;
        newData[currentIndex] = Math.max(0, Math.min(255, sum));
      }
    }
  }

  const newImageData = new ImageData(newData, width, height);
  ctx.putImageData(newImageData, 0, 0);
}

/**
 * Apply vintage effect
 */
export function applyVintage(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Vintage color transformation
    data[i] = Math.min(255, r * 1.2 + g * 0.2);
    data[i + 1] = Math.min(255, r * 0.1 + g * 1.1 + b * 0.1);
    data[i + 2] = Math.min(255, r * 0.2 + g * 0.1 + b * 0.9);
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Apply sepia effect
 */
export function applySepia(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Sepia transformation matrix
    data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
    data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
    data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Apply black and white effect
 */
export function applyBlackWhite(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Luminance-based grayscale
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Apply all filters to an image
 */
export async function applyFilters(
  file: File,
  config: FilterConfig
): Promise<FilterResult> {
  const startTime = Date.now();
  const appliedFilters: string[] = [];

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Set canvas size to image size
      canvas.width = img.width;
      canvas.height = img.height;

      // Enable high-quality rendering
      ctx.imageSmoothingQuality = 'high';

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      try {
        // Apply filters in order
        if (config.brightness !== 0) {
          applyBrightness(canvas, config.brightness);
          appliedFilters.push(`Brightness: ${config.brightness > 0 ? '+' : ''}${config.brightness}`);
        }

        if (config.contrast !== 0) {
          applyContrast(canvas, config.contrast);
          appliedFilters.push(`Contrast: ${config.contrast > 0 ? '+' : ''}${config.contrast}`);
        }

        if (config.saturation !== 0) {
          applySaturation(canvas, config.saturation);
          appliedFilters.push(`Saturation: ${config.saturation > 0 ? '+' : ''}${config.saturation}`);
        }

        if (config.hue !== 0) {
          applyHue(canvas, config.hue);
          appliedFilters.push(`Hue: ${config.hue > 0 ? '+' : ''}${config.hue}°`);
        }

        if (config.blur > 0) {
          applyBlur(canvas, config.blur);
          appliedFilters.push(`Blur: ${config.blur}px`);
        }

        if (config.sharpen > 0) {
          applySharpen(canvas, config.sharpen);
          appliedFilters.push(`Sharpen: ${config.sharpen}%`);
        }

        // Apply artistic effects
        if (config.blackWhite) {
          applyBlackWhite(canvas);
          appliedFilters.push('Black & White');
        } else if (config.sepia) {
          applySepia(canvas);
          appliedFilters.push('Sepia');
        } else if (config.vintage) {
          applyVintage(canvas);
          appliedFilters.push('Vintage');
        }

        const filteredImage = canvas.toDataURL('image/png', 1.0);
        const processingTime = Date.now() - startTime;

        resolve({
          filteredImage,
          appliedFilters,
          processingTime
        });

      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Apply preset filter configuration
 */
export function applyPreset(presetName: keyof typeof filterPresets): FilterConfig {
  const preset = filterPresets[presetName];
  return { ...defaultFilterConfig, ...preset };
}

/**
 * Reset all filters to default values
 */
export function resetFilters(): FilterConfig {
  return { ...defaultFilterConfig };
}

/**
 * Validate filter configuration values
 */
export function validateFilterConfig(config: FilterConfig): FilterConfig {
  return {
    brightness: Math.max(-100, Math.min(100, config.brightness)),
    contrast: Math.max(-100, Math.min(100, config.contrast)),
    saturation: Math.max(-100, Math.min(100, config.saturation)),
    hue: Math.max(-180, Math.min(180, config.hue)),
    blur: Math.max(0, Math.min(20, config.blur)),
    sharpen: Math.max(0, Math.min(100, config.sharpen)),
    vintage: config.vintage,
    sepia: config.sepia,
    blackWhite: config.blackWhite
  };
} 