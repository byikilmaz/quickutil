import * as tf from '@tensorflow/tfjs';
import { PDFContentAnalysis } from './pdfAnalyzer';
import { OptimalCompressionSettings } from './compressionOptimizer';

export interface QualityPrediction {
  // Size predictions
  sizeReduction: {
    estimatedPercentage: number; // % azalma
    estimatedFinalSize: number; // bytes
    confidenceLevel: number; // 0-1
    breakdown: {
      images: number; // % contribution to reduction
      text: number;
      vectors: number;
      metadata: number;
    };
  };

  // Quality predictions
  qualityImpact: {
    overallScore: number; // 0-1 (1 = no quality loss)
    visualQuality: number; // 0-1
    textReadability: number; // 0-1
    printQuality: number; // 0-1
    breakdown: {
      imageQuality: number;
      textSharpness: number;
      vectorPrecision: number;
      colorAccuracy: number;
    };
  };

  // Performance predictions
  performance: {
    processingTime: number; // seconds
    memoryUsage: number; // MB estimated
    complexity: 'low' | 'medium' | 'high';
    optimizedForWeb: boolean;
  };

  // Risk assessment
  riskAssessment: {
    riskLevel: 'low' | 'medium' | 'high';
    potentialIssues: string[];
    reversibility: boolean; // Kayıpsız geri alım mümkün mü
    recommendations: string[];
  };

  // Advanced metrics
  advancedMetrics: {
    compressionRatio: number; // Original / Compressed
    bitRateReduction: number; // bits per byte reduction
    structuralOptimization: number; // 0-1
    accessibilityPreservation: number; // 0-1
    searchabilityPreservation: number; // Text search capability
  };
}

export class AIQualityPredictor {
  private static instance: AIQualityPredictor;
  private initialized = false;
  private models: {
    sizePredictor?: tf.LayersModel;
    qualityEstimator?: tf.LayersModel;
    riskClassifier?: tf.LayersModel;
  } = {};

  private constructor() {}

  static getInstance(): AIQualityPredictor {
    if (!AIQualityPredictor.instance) {
      AIQualityPredictor.instance = new AIQualityPredictor();
    }
    return AIQualityPredictor.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await tf.ready();
      await this.createModels();
      this.initialized = true;
      console.log('🔮 AI Quality Predictor initialized successfully');
    } catch (error) {
      console.error('❌ AI Quality Predictor initialization failed:', error);
      throw error;
    }
  }

  private async createModels(): Promise<void> {
    // Size Prediction Model - Dosya boyutu tahmin eder
    this.models.sizePredictor = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [18], units: 56, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.25 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.batchNormalization(),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.15 }),
        tf.layers.dense({ units: 6, activation: 'sigmoid' }) // size reduction, confidence, breakdown x4
      ]
    });

    // Quality Impact Estimator - Kalite etkisini tahmin eder
    this.models.qualityEstimator = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [22], units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 40, activation: 'relu' }),
        tf.layers.batchNormalization(),
        tf.layers.dense({ units: 24, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 12, activation: 'relu' }),
        tf.layers.dense({ units: 8, activation: 'sigmoid' }) // overall, visual, text, print, image, text sharpness, vector, color
      ]
    });

    // Risk Classification Model - Risk seviyesi belirler
    this.models.riskClassifier = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [20], units: 48, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.25 }),
        tf.layers.dense({ units: 24, activation: 'relu' }),
        tf.layers.batchNormalization(),
        tf.layers.dense({ units: 12, activation: 'relu' }),
        tf.layers.dense({ units: 5, activation: 'sigmoid' }) // risk level, reversibility, optimization, accessibility, searchability
      ]
    });

    // Compile models
    this.models.sizePredictor.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    this.models.qualityEstimator.compile({
      optimizer: tf.train.adam(0.0008),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    this.models.riskClassifier.compile({
      optimizer: tf.train.adam(0.0012),
      loss: 'meanSquaredError',
      metrics: ['accuracy']
    });

    console.log('🧠 Quality prediction models created');
  }

  async predictQuality(
    analysis: PDFContentAnalysis,
    settings: OptimalCompressionSettings
  ): Promise<QualityPrediction> {
    if (!this.initialized) {
      await this.initialize();
    }

    console.log('🔮 Predicting compression quality and outcomes...');

    try {
      // Model inputs hazırla
      const sizeInputs = this.prepareSizeInputs(analysis, settings);
      const qualityInputs = this.prepareQualityInputs(analysis, settings);
      const riskInputs = this.prepareRiskInputs(analysis, settings);

      // AI modellerini parallel çalıştır
      const [sizePrediction, qualityPrediction, riskPrediction] = await Promise.all([
        this.runSizePrediction(sizeInputs),
        this.runQualityPrediction(qualityInputs),
        this.runRiskPrediction(riskInputs)
      ]);

      // Sonuçları birleştir ve quality prediction objesi oluştur
      const prediction = this.buildQualityPrediction(
        analysis,
        settings,
        sizePrediction,
        qualityPrediction,
        riskPrediction
      );

      console.log('✅ Quality prediction completed:', prediction);
      return prediction;

    } catch (error) {
      console.error('❌ Quality prediction failed:', error);
      return this.getFallbackPrediction(analysis, settings);
    }
  }

  private prepareSizeInputs(
    analysis: PDFContentAnalysis,
    settings: OptimalCompressionSettings
  ): tf.Tensor2D {
    const features = [
      // File characteristics
      Math.min(1.0, analysis.totalFileSize / 20000000), // 20MB max
      Math.min(1.0, analysis.pageCount / 200),
      
      // Content characteristics
      analysis.contentTypes.text.density,
      Math.min(1.0, analysis.contentTypes.images.count / 30),
      Math.min(1.0, analysis.contentTypes.images.totalSizeBytes / 10000000),
      Math.min(1.0, analysis.contentTypes.vectors.count / 100),
      
      // Compression settings
      settings.globalSettings.compressionLevel,
      settings.contentSpecific.images.quality,
      settings.contentSpecific.text.textCompression,
      settings.contentSpecific.vectors.simplification,
      
      // Structure settings
      settings.structural.removeMetadata ? 1.0 : 0.0,
      settings.structural.removeComments ? 1.0 : 0.0,
      settings.structural.removeUnusedResources ? 1.0 : 0.0,
      
      // Advanced features
      analysis.contentTypes.images.compressionPotential,
      analysis.contentTypes.vectors.optimizable,
      analysis.recommendations.confidenceScore,
      
      // Ratios and computed features
      analysis.contentTypes.images.totalSizeBytes / Math.max(1, analysis.totalFileSize),
      analysis.contentTypes.images.count / Math.max(1, analysis.pageCount)
    ];

    return tf.tensor2d([features]);
  }

  private prepareQualityInputs(
    analysis: PDFContentAnalysis,
    settings: OptimalCompressionSettings
  ): tf.Tensor2D {
    const features = [
      // Content quality baselines
      analysis.contentTypes.text.readability,
      analysis.contentTypes.text.complexity,
      analysis.contentTypes.images.compressionPotential,
      analysis.contentTypes.vectors.complexity,
      
      // Compression impact factors
      settings.contentSpecific.images.quality,
      settings.contentSpecific.text.textCompression,
      settings.contentSpecific.vectors.simplification,
      1.0 - settings.globalSettings.compressionLevel, // Quality preservation factor
      
      // Image-specific factors
      settings.contentSpecific.images.downscale ? 0.0 : 1.0,
      Math.min(1.0, settings.contentSpecific.images.targetDPI / 300),
      
      // Text-specific factors
      settings.contentSpecific.text.fontSubsetting ? 0.9 : 1.0,
      settings.contentSpecific.text.embedFonts ? 1.0 : 0.8,
      settings.contentSpecific.text.optimizeText ? 0.9 : 1.0,
      
      // Vector-specific factors
      1.0 - settings.contentSpecific.vectors.simplification,
      settings.contentSpecific.vectors.precision / 5.0, // Normalize precision
      
      // User preference factors
      settings.globalSettings.preserveQuality ? 1.0 : 0.0,
      settings.globalSettings.aggressiveMode ? 0.0 : 1.0,
      
      // Content ratios
      analysis.contentTypes.images.count / Math.max(1, analysis.pageCount),
      analysis.contentTypes.text.density,
      
      // Original quality indicators
      analysis.recommendations.confidenceScore,
      
      // Advanced quality factors
      Math.min(1.0, analysis.contentTypes.images.averageResolution / 300)
    ];

    return tf.tensor2d([features]);
  }

  private prepareRiskInputs(
    analysis: PDFContentAnalysis,
    settings: OptimalCompressionSettings
  ): tf.Tensor2D {
    const features = [
      // Aggressiveness factors
      settings.globalSettings.compressionLevel,
      settings.globalSettings.aggressiveMode ? 1.0 : 0.0,
      1.0 - settings.contentSpecific.images.quality,
      settings.contentSpecific.vectors.simplification,
      
      // Content vulnerability factors
      1.0 - analysis.contentTypes.text.readability, // Poor readability = higher risk
      analysis.contentTypes.text.complexity, // Complex text = higher risk
      analysis.contentTypes.images.compressionPotential, // High potential = higher risk if aggressive
      
      // Structural changes
      settings.structural.removeMetadata ? 0.3 : 0.0,
      settings.structural.removeComments ? 0.2 : 0.0,
      settings.structural.removeUnusedResources ? 0.4 : 0.0,
      
      // Quality preservation measures
      settings.globalSettings.preserveQuality ? 0.0 : 1.0,
      settings.contentSpecific.images.downscale ? 0.8 : 0.0,
      
      // Content density factors
      analysis.contentTypes.images.count / Math.max(1, analysis.pageCount),
      Math.min(1.0, analysis.totalFileSize / 50000000), // Large files = higher risk
      
      // AI confidence factors
      1.0 - analysis.recommendations.confidenceScore,
      1.0 - settings.predictions.confidenceScore,
      
      // Document characteristics
      Math.min(1.0, analysis.pageCount / 500), // Very large docs = higher risk
      analysis.contentTypes.vectors.complexity,
      
      // Fallback indicators
      0.5, 0.3 // Placeholder features for model stability
    ];

    return tf.tensor2d([features]);
  }

  private async runSizePrediction(inputs: tf.Tensor2D): Promise<number[]> {
    if (!this.models.sizePredictor) {
      throw new Error('Size predictor model not initialized');
    }

    const prediction = this.models.sizePredictor.predict(inputs) as tf.Tensor;
    const result = await prediction.data();
    
    prediction.dispose();
    inputs.dispose();
    
    return Array.from(result);
  }

  private async runQualityPrediction(inputs: tf.Tensor2D): Promise<number[]> {
    if (!this.models.qualityEstimator) {
      throw new Error('Quality estimator model not initialized');
    }

    const prediction = this.models.qualityEstimator.predict(inputs) as tf.Tensor;
    const result = await prediction.data();
    
    prediction.dispose();
    inputs.dispose();
    
    return Array.from(result);
  }

  private async runRiskPrediction(inputs: tf.Tensor2D): Promise<number[]> {
    if (!this.models.riskClassifier) {
      throw new Error('Risk classifier model not initialized');
    }

    const prediction = this.models.riskClassifier.predict(inputs) as tf.Tensor;
    const result = await prediction.data();
    
    prediction.dispose();
    inputs.dispose();
    
    return Array.from(result);
  }

  private buildQualityPrediction(
    analysis: PDFContentAnalysis,
    settings: OptimalCompressionSettings,
    sizePrediction: number[],
    qualityPrediction: number[],
    riskPrediction: number[]
  ): QualityPrediction {
    const [sizeReduction, confidence, imagesBreakdown, textBreakdown, vectorsBreakdown, metadataBreakdown] = sizePrediction;
    const [overallQuality, visualQuality, textReadability, printQuality, imageQuality, textSharpness, vectorPrecision, colorAccuracy] = qualityPrediction;
    const [riskLevel, reversibility, structuralOpt, accessibility, searchability] = riskPrediction;

    // Calculate estimated final size
    const estimatedReduction = Math.min(0.8, Math.max(0.05, sizeReduction));
    const estimatedFinalSize = Math.round(analysis.totalFileSize * (1 - estimatedReduction));

    // Risk level classification
    const riskLevelClassified: 'low' | 'medium' | 'high' = 
      riskLevel < 0.3 ? 'low' : riskLevel < 0.7 ? 'medium' : 'high';

    // Generate potential issues
    const potentialIssues: string[] = [];
    if (imageQuality < 0.7) potentialIssues.push('Resim kalitesinde kayıp');
    if (textSharpness < 0.8) potentialIssues.push('Metin netliği azalabilir');
    if (vectorPrecision < 0.6) potentialIssues.push('Vektör grafik precision kaybı');
    if (reversibility < 0.5) potentialIssues.push('Geri alınamaz değişiklikler');

    // Generate recommendations
    const recommendations: string[] = [];
    if (overallQuality > 0.8) recommendations.push('Yüksek kalite korunacak');
    if (estimatedReduction > 0.3) recommendations.push('Önemli boyut azaltımı bekleniyor');
    if (riskLevelClassified === 'low') recommendations.push('Güvenli compression ayarları');
    if (structuralOpt > 0.7) recommendations.push('Yapısal optimizasyon uygulanacak');

    return {
      sizeReduction: {
        estimatedPercentage: estimatedReduction * 100,
        estimatedFinalSize,
        confidenceLevel: Math.min(0.95, Math.max(0.6, confidence)),
        breakdown: {
          images: Math.min(60, Math.max(0, imagesBreakdown * 100)),
          text: Math.min(30, Math.max(0, textBreakdown * 100)),
          vectors: Math.min(20, Math.max(0, vectorsBreakdown * 100)),
          metadata: Math.min(10, Math.max(0, metadataBreakdown * 100))
        }
      },

      qualityImpact: {
        overallScore: Math.min(1.0, Math.max(0.3, overallQuality)),
        visualQuality: Math.min(1.0, Math.max(0.2, visualQuality)),
        textReadability: Math.min(1.0, Math.max(0.4, textReadability)),
        printQuality: Math.min(1.0, Math.max(0.3, printQuality)),
        breakdown: {
          imageQuality: Math.min(1.0, Math.max(0.2, imageQuality)),
          textSharpness: Math.min(1.0, Math.max(0.4, textSharpness)),
          vectorPrecision: Math.min(1.0, Math.max(0.3, vectorPrecision)),
          colorAccuracy: Math.min(1.0, Math.max(0.5, colorAccuracy))
        }
      },

      performance: {
        processingTime: Math.max(1, analysis.pageCount * 0.8 * (1 + settings.globalSettings.compressionLevel)),
        memoryUsage: Math.max(50, analysis.totalFileSize / 1000000 * 2), // MB
        complexity: settings.globalSettings.aggressiveMode ? 'high' : 
                   settings.globalSettings.compressionLevel > 0.7 ? 'medium' : 'low',
        optimizedForWeb: settings.structural.linearize && settings.structural.crossReferenceStreams
      },

      riskAssessment: {
        riskLevel: riskLevelClassified,
        potentialIssues,
        reversibility: reversibility > 0.5,
        recommendations
      },

      advancedMetrics: {
        compressionRatio: 1 / (1 - estimatedReduction),
        bitRateReduction: estimatedReduction * 8, // bits per byte
        structuralOptimization: Math.min(1.0, Math.max(0.0, structuralOpt)),
        accessibilityPreservation: Math.min(1.0, Math.max(0.5, accessibility)),
        searchabilityPreservation: Math.min(1.0, Math.max(0.6, searchability))
      }
    };
  }

  private getFallbackPrediction(
    analysis: PDFContentAnalysis,
    settings: OptimalCompressionSettings
  ): QualityPrediction {
    const aggressiveness = settings.globalSettings.compressionLevel;
    const estimatedReduction = Math.min(0.6, 0.15 + (aggressiveness * 0.4));
    
    return {
      sizeReduction: {
        estimatedPercentage: estimatedReduction * 100,
        estimatedFinalSize: Math.round(analysis.totalFileSize * (1 - estimatedReduction)),
        confidenceLevel: 0.7,
        breakdown: {
          images: 40,
          text: 25,
          vectors: 15,
          metadata: 20
        }
      },

      qualityImpact: {
        overallScore: Math.max(0.4, 1.0 - (aggressiveness * 0.5)),
        visualQuality: Math.max(0.3, 1.0 - (aggressiveness * 0.6)),
        textReadability: Math.max(0.6, 1.0 - (aggressiveness * 0.3)),
        printQuality: Math.max(0.4, 1.0 - (aggressiveness * 0.4)),
        breakdown: {
          imageQuality: Math.max(0.3, settings.contentSpecific.images.quality),
          textSharpness: Math.max(0.5, 1.0 - settings.contentSpecific.text.textCompression),
          vectorPrecision: Math.max(0.4, 1.0 - settings.contentSpecific.vectors.simplification),
          colorAccuracy: Math.max(0.6, 1.0 - (aggressiveness * 0.3))
        }
      },

      performance: {
        processingTime: analysis.pageCount * 1.2,
        memoryUsage: Math.max(50, analysis.totalFileSize / 1000000 * 1.5),
        complexity: aggressiveness > 0.7 ? 'high' : 'medium',
        optimizedForWeb: settings.structural.linearize
      },

      riskAssessment: {
        riskLevel: aggressiveness > 0.8 ? 'high' : aggressiveness > 0.5 ? 'medium' : 'low',
        potentialIssues: aggressiveness > 0.6 ? ['Kalite kaybı olabilir'] : [],
        reversibility: !settings.structural.removeMetadata,
        recommendations: ['Fallback tahmin kullanıldı']
      },

      advancedMetrics: {
        compressionRatio: 1 / (1 - estimatedReduction),
        bitRateReduction: estimatedReduction * 8,
        structuralOptimization: 0.6,
        accessibilityPreservation: 0.8,
        searchabilityPreservation: analysis.contentTypes.text.density > 0.5 ? 0.9 : 0.7
      }
    };
  }

  // Memory management
  dispose(): void {
    Object.values(this.models).forEach(model => {
      model?.dispose();
    });
    this.models = {};
    this.initialized = false;
    console.log('🧹 AI Quality Predictor disposed');
  }
}

// Singleton instance
export const aiQualityPredictor = AIQualityPredictor.getInstance(); 