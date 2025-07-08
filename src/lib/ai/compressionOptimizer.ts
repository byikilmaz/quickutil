import * as tf from '@tensorflow/tfjs';
import { PDFContentAnalysis } from './pdfAnalyzer';

export interface OptimalCompressionSettings {
  // Ana compression ayarları
  globalSettings: {
    compressionLevel: number; // 0-1
    preserveQuality: boolean;
    aggressiveMode: boolean;
  };

  // Content-specific ayarlar
  contentSpecific: {
    text: {
      fontSubsetting: boolean;
      textCompression: number; // 0-1
      embedFonts: boolean;
      optimizeText: boolean;
    };
    images: {
      quality: number; // 0-1
      downscale: boolean;
      targetDPI: number;
      format: 'auto' | 'jpeg' | 'png' | 'webp';
      progressive: boolean;
    };
    vectors: {
      simplification: number; // 0-1
      precision: number; // decimal places
      removeInvisible: boolean;
      optimizePaths: boolean;
    };
  };

  // Metadata ve yapısal ayarlar
  structural: {
    removeMetadata: boolean;
    removeComments: boolean;
    removeUnusedResources: boolean;
    linearize: boolean;
    crossReferenceStreams: boolean;
  };

  // Tahminler
  predictions: {
    expectedSizeReduction: number; // % azalma
    expectedQualityLoss: number; // % kalite kaybı
    processingTime: number; // saniye tahmini
    confidenceScore: number; // 0-1
  };

  // AI insights
  insights: {
    primaryOptimizationTarget: 'size' | 'quality' | 'balanced';
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
    warnings: string[];
  };
}

export class AICompressionOptimizer {
  private static instance: AICompressionOptimizer;
  private initialized = false;
  private optimizationModel?: tf.LayersModel;
  private qualityPredictor?: tf.LayersModel;

  private constructor() {}

  static getInstance(): AICompressionOptimizer {
    if (!AICompressionOptimizer.instance) {
      AICompressionOptimizer.instance = new AICompressionOptimizer();
    }
    return AICompressionOptimizer.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await tf.ready();
      await this.createModels();
      this.initialized = true;
      console.log('🔧 AI Compression Optimizer initialized successfully');
    } catch (error) {
      console.error('❌ AI Compression Optimizer initialization failed:', error);
      throw error;
    }
  }

  private async createModels(): Promise<void> {
    // Optimization Settings Generator Model
    this.optimizationModel = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [20], units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 12, activation: 'sigmoid' }) // 12 optimization parameters
      ]
    });

    // Quality Impact Predictor Model
    this.qualityPredictor = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [25], units: 48, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.25 }),
        tf.layers.dense({ units: 24, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.15 }),
        tf.layers.dense({ units: 12, activation: 'relu' }),
        tf.layers.dense({ units: 4, activation: 'sigmoid' }) // size reduction, quality loss, processing time, confidence
      ]
    });

    // Compile models
    this.optimizationModel.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    this.qualityPredictor.compile({
      optimizer: tf.train.adam(0.0008),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    console.log('🧠 Compression optimization models created');
  }

  async generateOptimalSettings(
    analysis: PDFContentAnalysis,
    userPreferences: {
      priority: 'size' | 'quality' | 'balanced';
      aggressiveMode?: boolean;
      preserveReadability?: boolean;
    }
  ): Promise<OptimalCompressionSettings> {
    if (!this.initialized) {
      await this.initialize();
    }

    console.log('🎯 Generating optimal compression settings for:', {
      pageCount: analysis.pageCount,
      priority: userPreferences.priority
    });

    try {
      // AI model inputs hazırla
      const modelInputs = this.prepareModelInputs(analysis, userPreferences);
      
      // AI modellerini çalıştır
      const optimizationResult = await this.runOptimizationModel(modelInputs);
      const qualityPrediction = await this.runQualityPrediction(modelInputs, optimizationResult);

      // Settings objesini oluştur
      const settings = this.buildOptimalSettings(
        analysis,
        userPreferences,
        optimizationResult,
        qualityPrediction
      );

      // AI insights ekle
      settings.insights = this.generateInsights(analysis, settings, userPreferences);

      console.log('✅ Optimal compression settings generated:', settings);
      return settings;

    } catch (error) {
      console.error('❌ Failed to generate optimal settings:', error);
      // Fallback ile basit ayarlar döndür
      return this.getFallbackSettings(analysis, userPreferences);
    }
  }

  private prepareModelInputs(
    analysis: PDFContentAnalysis,
    preferences: { priority: string; aggressiveMode?: boolean; preserveReadability?: boolean }
  ): tf.Tensor2D {
    const features = [
      // File characteristics (normalized)
      Math.min(1.0, analysis.pageCount / 100),
      Math.min(1.0, analysis.totalFileSize / 10000000), // 10MB max
      analysis.contentTypes.text.density,
      analysis.contentTypes.text.complexity,
      analysis.contentTypes.text.readability,
      
      // Image characteristics
      Math.min(1.0, analysis.contentTypes.images.count / 20),
      Math.min(1.0, analysis.contentTypes.images.totalSizeBytes / 5000000), // 5MB max
      analysis.contentTypes.images.compressionPotential,
      
      // Vector characteristics  
      Math.min(1.0, analysis.contentTypes.vectors.count / 50),
      analysis.contentTypes.vectors.complexity,
      analysis.contentTypes.vectors.optimizable,
      
      // User preferences
      preferences.priority === 'size' ? 1.0 : preferences.priority === 'quality' ? 0.0 : 0.5,
      preferences.aggressiveMode ? 1.0 : 0.0,
      preferences.preserveReadability ? 1.0 : 0.0,
      
      // PDF analysis recommendations
      analysis.recommendations.optimalCompressionLevel,
      analysis.recommendations.preserveQuality ? 1.0 : 0.0,
      analysis.recommendations.estimatedSizeReduction / 100,
      analysis.recommendations.confidenceScore,
      
      // Additional computed features
      analysis.contentTypes.images.count / Math.max(1, analysis.pageCount), // Images per page
      analysis.contentTypes.text.density * analysis.contentTypes.text.complexity // Text complexity factor
    ];

    return tf.tensor2d([features]);
  }

  private async runOptimizationModel(inputs: tf.Tensor2D): Promise<number[]> {
    if (!this.optimizationModel) {
      throw new Error('Optimization model not initialized');
    }

    const prediction = this.optimizationModel.predict(inputs) as tf.Tensor;
    const result = await prediction.data();
    
    // Cleanup
    prediction.dispose();
    
    return Array.from(result);
  }

  private async runQualityPrediction(
    inputs: tf.Tensor2D, 
    optimizationParams: number[]
  ): Promise<number[]> {
    if (!this.qualityPredictor) {
      throw new Error('Quality predictor model not initialized');
    }

    // Extended input with optimization parameters
    const originalData = await inputs.data();
    const extendedFeatures = [...Array.from(originalData), ...optimizationParams.slice(0, 5)];
    
    const extendedInput = tf.tensor2d([extendedFeatures]);
    const prediction = this.qualityPredictor.predict(extendedInput) as tf.Tensor;
    const result = await prediction.data();
    
    // Cleanup
    extendedInput.dispose();
    prediction.dispose();
    inputs.dispose();
    
    return Array.from(result);
  }

  private buildOptimalSettings(
    analysis: PDFContentAnalysis,
    preferences: any,
    optimizationResult: number[],
    qualityPrediction: number[]
  ): OptimalCompressionSettings {
    const [
      globalCompression, preserveQuality, textCompression, textOptimize, 
      imageQuality, imageDownscale, vectorSimplification, vectorOptimize,
      removeMetadata, removeComments, removeUnused, linearize
    ] = optimizationResult;

    const [sizeReduction, qualityLoss, processingTime, confidence] = qualityPrediction;

    return {
      globalSettings: {
        compressionLevel: Math.min(0.95, Math.max(0.1, globalCompression)),
        preserveQuality: preserveQuality > 0.5,
        aggressiveMode: preferences.aggressiveMode || false
      },
      contentSpecific: {
        text: {
          fontSubsetting: analysis.contentTypes.text.complexity > 0.6,
          textCompression: Math.min(0.9, Math.max(0.3, textCompression)),
          embedFonts: analysis.contentTypes.text.complexity < 0.4,
          optimizeText: textOptimize > 0.6
        },
        images: {
          quality: Math.min(0.95, Math.max(0.3, imageQuality)),
          downscale: imageDownscale > 0.5 && analysis.contentTypes.images.compressionPotential > 0.7,
          targetDPI: imageDownscale > 0.7 ? 150 : 300,
          format: 'auto',
          progressive: analysis.contentTypes.images.count > 5
        },
        vectors: {
          simplification: Math.min(0.8, Math.max(0.0, vectorSimplification)),
          precision: vectorSimplification > 0.6 ? 2 : 3,
          removeInvisible: true,
          optimizePaths: vectorOptimize > 0.5
        }
      },
      structural: {
        removeMetadata: removeMetadata > 0.5,
        removeComments: removeComments > 0.6,
        removeUnusedResources: removeUnused > 0.7,
        linearize: linearize > 0.5,
        crossReferenceStreams: analysis.pageCount > 10
      },
      predictions: {
        expectedSizeReduction: Math.min(80, Math.max(5, sizeReduction * 100)),
        expectedQualityLoss: Math.min(30, Math.max(0, qualityLoss * 100)),
        processingTime: Math.max(1, processingTime * analysis.pageCount * 2),
        confidenceScore: Math.min(0.95, Math.max(0.6, confidence))
      },
      insights: {
        primaryOptimizationTarget: 'balanced',
        riskLevel: 'low',
        recommendations: [],
        warnings: []
      }
    };
  }

  private generateInsights(
    analysis: PDFContentAnalysis,
    settings: OptimalCompressionSettings,
    preferences: any
  ): OptimalCompressionSettings['insights'] {
    const recommendations: string[] = [];
    const warnings: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Risk assessment
    if (settings.predictions.expectedQualityLoss > 15) {
      riskLevel = 'high';
      warnings.push('Yüksek kalite kaybı bekleniyor (%' + settings.predictions.expectedQualityLoss.toFixed(1) + ')');
    } else if (settings.predictions.expectedQualityLoss > 8) {
      riskLevel = 'medium';
      warnings.push('Orta düzeyde kalite kaybı olabilir');
    }

    // Size optimization recommendations
    if (analysis.contentTypes.images.compressionPotential > 0.8) {
      recommendations.push('Resimler agresif sıkıştırma için uygun');
    }

    if (analysis.contentTypes.text.complexity > 0.7) {
      recommendations.push('Font optimizasyonu büyük kazanç sağlayabilir');
    }

    if (analysis.contentTypes.vectors.optimizable > 0.6) {
      recommendations.push('Vektör grafikleri optimize edilebilir');
    }

    // Quality preservation recommendations
    if (preferences.priority === 'quality') {
      recommendations.push('Kalite odaklı ayarlar uygulandı');
    }

    if (analysis.contentTypes.text.readability < 0.6) {
      warnings.push('Metin kalitesi korunmalı - OCR içerik tespit edildi');
    }

    return {
      primaryOptimizationTarget: preferences.priority || 'balanced',
      riskLevel,
      recommendations,
      warnings
    };
  }

  private getFallbackSettings(
    analysis: PDFContentAnalysis,
    preferences: any
  ): OptimalCompressionSettings {
    const isAggressiveMode = preferences.aggressiveMode;
    const priorityFactor = preferences.priority === 'size' ? 0.8 : 
                          preferences.priority === 'quality' ? 0.3 : 0.5;

    return {
      globalSettings: {
        compressionLevel: isAggressiveMode ? 0.8 : 0.6,
        preserveQuality: preferences.priority !== 'size',
        aggressiveMode: isAggressiveMode
      },
      contentSpecific: {
        text: {
          fontSubsetting: true,
          textCompression: priorityFactor,
          embedFonts: false,
          optimizeText: true
        },
        images: {
          quality: Math.max(0.4, 1.0 - priorityFactor),
          downscale: isAggressiveMode,
          targetDPI: isAggressiveMode ? 150 : 300,
          format: 'auto',
          progressive: true
        },
        vectors: {
          simplification: priorityFactor * 0.8,
          precision: isAggressiveMode ? 2 : 3,
          removeInvisible: true,
          optimizePaths: true
        }
      },
      structural: {
        removeMetadata: true,
        removeComments: true,
        removeUnusedResources: true,
        linearize: analysis.pageCount > 10,
        crossReferenceStreams: true
      },
      predictions: {
        expectedSizeReduction: 25 + (priorityFactor * 30),
        expectedQualityLoss: priorityFactor * 15,
        processingTime: analysis.pageCount * 1.5,
        confidenceScore: 0.7
      },
      insights: {
        primaryOptimizationTarget: preferences.priority || 'balanced',
        riskLevel: isAggressiveMode ? 'medium' : 'low',
        recommendations: ['Fallback ayarlar kullanıldı'],
        warnings: preferences.priority === 'size' ? ['Kalite kaybı olabilir'] : []
      }
    };
  }

  // Memory management
  dispose(): void {
    this.optimizationModel?.dispose();
    this.qualityPredictor?.dispose();
    this.optimizationModel = undefined;
    this.qualityPredictor = undefined;
    this.initialized = false;
    console.log('🧹 AI Compression Optimizer disposed');
  }
}

// Singleton instance
export const aiCompressionOptimizer = AICompressionOptimizer.getInstance(); 