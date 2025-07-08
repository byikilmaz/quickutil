import * as tf from '@tensorflow/tfjs';
import { PDFContentAnalysis } from './pdfAnalyzer';
import { OptimalCompressionSettings } from './compressionOptimizer';

export interface SmartPreset {
  id: string;
  name: string;
  description: string;
  category: 'document' | 'presentation' | 'archive' | 'web' | 'print' | 'mobile';
  
  // Preset characteristics
  characteristics: {
    priority: 'size' | 'quality' | 'balanced';
    aggressiveness: 'conservative' | 'moderate' | 'aggressive';
    targetUseCase: string;
    recommendedFor: string[];
    notRecommendedFor: string[];
  };

  // AI-generated settings
  settings: OptimalCompressionSettings;
  
  // Prediction metrics
  predictions: {
    expectedSizeReduction: number; // %
    expectedQualityScore: number; // 0-1
    processingTime: number; // seconds
    confidenceScore: number; // 0-1
  };

  // UI display properties
  display: {
    icon: string;
    color: string;
    tags: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
}

export interface PresetRecommendation {
  preset: SmartPreset;
  matchScore: number; // 0-1 how well it matches the document
  reasoning: string[];
  warnings: string[];
  alternatives: SmartPreset[];
}

export class AISmartPresets {
  private static instance: AISmartPresets;
  private initialized = false;
  private presetClassifier?: tf.LayersModel;
  private matchingModel?: tf.LayersModel;

  // Base presets templates
  private readonly basePresets = {
    web_optimized: {
      name: 'Web Optimized',
      description: 'Web görüntüleme için optimize edilmiş, hızlı yükleme',
      category: 'web' as const,
      priority: 'balanced' as const,
      aggressiveness: 'moderate' as const,
      icon: '🌐',
      color: 'blue'
    },
    print_quality: {
      name: 'Print Quality',
      description: 'Yazdırma kalitesi korunmuş, hassas detaylar',
      category: 'print' as const,
      priority: 'quality' as const,
      aggressiveness: 'conservative' as const,
      icon: '🖨️',
      color: 'green'
    },
    archive_compression: {
      name: 'Archive Compression',
      description: 'Maksimum sıkıştırma, arşivleme için',
      category: 'archive' as const,
      priority: 'size' as const,
      aggressiveness: 'aggressive' as const,
      icon: '📦',
      color: 'purple'
    },
    mobile_friendly: {
      name: 'Mobile Friendly',
      description: 'Mobil cihazlar için optimize edilmiş',
      category: 'mobile' as const,
      priority: 'size' as const,
      aggressiveness: 'moderate' as const,
      icon: '📱',
      color: 'orange'
    },
    presentation_mode: {
      name: 'Presentation Mode',
      description: 'Sunum kalitesi, görsel netlik öncelikli',
      category: 'presentation' as const,
      priority: 'quality' as const,
      aggressiveness: 'conservative' as const,
      icon: '📊',
      color: 'red'
    },
    document_standard: {
      name: 'Document Standard',
      description: 'Genel doküman kullanımı için dengeli',
      category: 'document' as const,
      priority: 'balanced' as const,
      aggressiveness: 'moderate' as const,
      icon: '📄',
      color: 'gray'
    }
  };

  private constructor() {}

  static getInstance(): AISmartPresets {
    if (!AISmartPresets.instance) {
      AISmartPresets.instance = new AISmartPresets();
    }
    return AISmartPresets.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await tf.ready();
      await this.createModels();
      this.initialized = true;
      console.log('🎯 AI Smart Presets initialized successfully');
    } catch (error) {
      console.error('❌ AI Smart Presets initialization failed:', error);
      throw error;
    }
  }

  private async createModels(): Promise<void> {
    // Preset Classifier - Doküman tipine göre preset önerir
    this.presetClassifier = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [16], units: 48, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.25 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.batchNormalization(),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.15 }),
        tf.layers.dense({ units: 6, activation: 'softmax' }) // 6 preset categories
      ]
    });

    // Matching Model - Preset ve doküman uyumluluğunu değerlendirir
    this.matchingModel = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [20], units: 40, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 24, activation: 'relu' }),
        tf.layers.batchNormalization(),
        tf.layers.dense({ units: 12, activation: 'relu' }),
        tf.layers.dense({ units: 3, activation: 'sigmoid' }) // match score, quality impact, size impact
      ]
    });

    // Compile models
    this.presetClassifier.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    this.matchingModel.compile({
      optimizer: tf.train.adam(0.0008),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    console.log('🧠 Smart presets models created');
  }

  async generateSmartPresets(analysis: PDFContentAnalysis): Promise<SmartPreset[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    console.log('🎯 Generating smart presets for document analysis...');

    try {
      // AI ile en uygun preset kategorilerini belirle
      const classificationResult = await this.classifyDocument(analysis);
      
      // Her base preset için özelleştirilmiş ayarlar oluştur
      const smartPresets: SmartPreset[] = [];
      
      for (const [presetKey, basePreset] of Object.entries(this.basePresets)) {
        const customizedPreset = await this.customizePreset(
          presetKey,
          basePreset,
          analysis,
          classificationResult
        );
        smartPresets.push(customizedPreset);
      }

      // Confidence score'a göre sırala
      smartPresets.sort((a, b) => b.predictions.confidenceScore - a.predictions.confidenceScore);

      console.log('✅ Smart presets generated:', smartPresets.length);
      return smartPresets;

    } catch (error) {
      console.error('❌ Smart presets generation failed:', error);
      return this.getFallbackPresets(analysis);
    }
  }

  async recommendBestPreset(
    analysis: PDFContentAnalysis,
    userPreferences?: {
      priority?: 'size' | 'quality' | 'balanced';
      useCase?: string;
      deviceTarget?: 'desktop' | 'mobile' | 'print' | 'web';
    }
  ): Promise<PresetRecommendation> {
    const presets = await this.generateSmartPresets(analysis);
    
    // User preferences'a göre filtreleme ve scoring
    const scoredPresets = await Promise.all(
      presets.map(async preset => {
        const matchScore = await this.calculateMatchScore(preset, analysis, userPreferences);
        return { preset, matchScore };
      })
    );

    // En yüksek score'lu preset'i seç
    scoredPresets.sort((a, b) => b.matchScore - a.matchScore);
    const bestMatch = scoredPresets[0];

    // Reasoning ve warnings oluştur
    const reasoning = this.generateReasoning(bestMatch.preset, analysis, userPreferences);
    const warnings = this.generateWarnings(bestMatch.preset, analysis);
    const alternatives = scoredPresets.slice(1, 4).map(item => item.preset);

    return {
      preset: bestMatch.preset,
      matchScore: bestMatch.matchScore,
      reasoning,
      warnings,
      alternatives
    };
  }

  private async classifyDocument(analysis: PDFContentAnalysis): Promise<number[]> {
    if (!this.presetClassifier) {
      throw new Error('Preset classifier not initialized');
    }

    const features = [
      // Document characteristics
      Math.min(1.0, analysis.pageCount / 100),
      Math.min(1.0, analysis.totalFileSize / 20000000),
      analysis.contentTypes.text.density,
      analysis.contentTypes.text.complexity,
      
      // Content type indicators
      Math.min(1.0, analysis.contentTypes.images.count / 20),
      analysis.contentTypes.images.compressionPotential,
      Math.min(1.0, analysis.contentTypes.vectors.count / 50),
      analysis.contentTypes.vectors.complexity,
      
      // Usage pattern indicators
      analysis.contentTypes.text.readability, // High = likely document/report
      analysis.contentTypes.images.count / Math.max(1, analysis.pageCount), // Images per page
      
      // Quality requirements indicators
      analysis.recommendations.preserveQuality ? 1.0 : 0.0,
      analysis.recommendations.confidenceScore,
      
      // Document type hints
      analysis.pageCount > 50 ? 1.0 : 0.0, // Large document
      analysis.contentTypes.images.count > analysis.pageCount ? 1.0 : 0.0, // Image heavy
      analysis.contentTypes.vectors.count > 10 ? 1.0 : 0.0, // Graphics heavy
      analysis.contentTypes.text.density > 0.8 ? 1.0 : 0.0 // Text heavy
    ];

    const input = tf.tensor2d([features]);
    const prediction = this.presetClassifier.predict(input) as tf.Tensor;
    const result = await prediction.data();
    
    input.dispose();
    prediction.dispose();
    
    return Array.from(result);
  }

  private async customizePreset(
    presetKey: string,
    basePreset: any,
    analysis: PDFContentAnalysis,
    classification: number[]
  ): Promise<SmartPreset> {
    
    // AI tabanlı settings oluştur
    const settings = this.generatePresetSettings(basePreset, analysis);
    
    // Predictions hesapla
    const predictions = this.calculatePresetPredictions(settings, analysis, classification);
    
    // Confidence score'u classification'dan al
    const categoryIndex = Object.keys(this.basePresets).indexOf(presetKey);
    const confidence = classification[categoryIndex] || 0.5;

    return {
      id: presetKey,
      name: basePreset.name,
      description: basePreset.description,
      category: basePreset.category,
      
      characteristics: {
        priority: basePreset.priority,
        aggressiveness: basePreset.aggressiveness,
        targetUseCase: this.getTargetUseCase(basePreset.category),
        recommendedFor: this.getRecommendedFor(basePreset.category),
        notRecommendedFor: this.getNotRecommendedFor(basePreset.category)
      },

      settings,
      predictions: {
        ...predictions,
        confidenceScore: Math.min(0.95, Math.max(0.5, confidence))
      },

      display: {
        icon: basePreset.icon,
        color: basePreset.color,
        tags: this.generateTags(basePreset, analysis),
        difficulty: this.getDifficulty(basePreset.aggressiveness)
      }
    };
  }

  private generatePresetSettings(basePreset: any, analysis: PDFContentAnalysis): OptimalCompressionSettings {
    const aggressivenessMap = {
      conservative: 0.3,
      moderate: 0.6,
      aggressive: 0.85
    };

    const priorityMap = {
      size: { imageQuality: 0.5, textCompression: 0.7 },
      quality: { imageQuality: 0.9, textCompression: 0.4 },
      balanced: { imageQuality: 0.7, textCompression: 0.6 }
    };

    const compressionLevel = aggressivenessMap[basePreset.aggressiveness as keyof typeof aggressivenessMap];
    const qualitySettings = priorityMap[basePreset.priority as keyof typeof priorityMap];

    return {
      globalSettings: {
        compressionLevel,
        preserveQuality: basePreset.priority === 'quality',
        aggressiveMode: basePreset.aggressiveness === 'aggressive'
      },
      
      contentSpecific: {
        text: {
          fontSubsetting: compressionLevel > 0.5,
          textCompression: qualitySettings.textCompression,
          embedFonts: basePreset.category === 'print',
          optimizeText: compressionLevel > 0.4
        },
        images: {
          quality: qualitySettings.imageQuality,
          downscale: basePreset.category === 'mobile' || basePreset.category === 'web',
          targetDPI: basePreset.category === 'print' ? 300 : 
                     basePreset.category === 'mobile' ? 150 : 200,
          format: 'auto',
          progressive: basePreset.category === 'web'
        },
        vectors: {
          simplification: compressionLevel * 0.8,
          precision: basePreset.category === 'print' ? 3 : 2,
          removeInvisible: true,
          optimizePaths: compressionLevel > 0.5
        }
      },

      structural: {
        removeMetadata: basePreset.category !== 'archive',
        removeComments: compressionLevel > 0.6,
        removeUnusedResources: true,
        linearize: basePreset.category === 'web',
        crossReferenceStreams: analysis.pageCount > 10
      },

      predictions: {
        expectedSizeReduction: 30 + (compressionLevel * 40),
        expectedQualityLoss: compressionLevel * 20,
        processingTime: analysis.pageCount * (0.5 + compressionLevel),
        confidenceScore: 0.8
      },

      insights: {
        primaryOptimizationTarget: basePreset.priority,
        riskLevel: basePreset.aggressiveness === 'aggressive' ? 'medium' : 'low',
        recommendations: [`${basePreset.name} preset uygulandı`],
        warnings: []
      }
    };
  }

  private calculatePresetPredictions(
    settings: OptimalCompressionSettings,
    analysis: PDFContentAnalysis,
    classification: number[]
  ): Omit<SmartPreset['predictions'], 'confidenceScore'> {
    const compressionFactor = settings.globalSettings.compressionLevel;
    const imageRatio = analysis.contentTypes.images.totalSizeBytes / analysis.totalFileSize;
    
    return {
      expectedSizeReduction: Math.min(75, 20 + (compressionFactor * 40) + (imageRatio * 15)),
      expectedQualityScore: Math.max(0.3, 1.0 - (compressionFactor * 0.6)),
      processingTime: Math.max(1, analysis.pageCount * (0.5 + compressionFactor * 1.5))
    };
  }

  private async calculateMatchScore(
    preset: SmartPreset,
    analysis: PDFContentAnalysis,
    userPreferences?: any
  ): Promise<number> {
    if (!this.matchingModel) {
      // Fallback scoring
      let score = 0.5;
      
      if (userPreferences?.priority === preset.characteristics.priority) score += 0.2;
      if (userPreferences?.deviceTarget === preset.category) score += 0.3;
      
      return Math.min(1.0, score);
    }

    try {
      const features = [
        // Preset characteristics
        preset.characteristics.priority === 'size' ? 1.0 : 
        preset.characteristics.priority === 'quality' ? 0.0 : 0.5,
        preset.characteristics.aggressiveness === 'aggressive' ? 1.0 :
        preset.characteristics.aggressiveness === 'moderate' ? 0.5 : 0.0,
        
        // Document characteristics
        analysis.contentTypes.text.density,
        Math.min(1.0, analysis.contentTypes.images.count / 20),
        analysis.contentTypes.images.compressionPotential,
        Math.min(1.0, analysis.contentTypes.vectors.count / 50),
        
        // User preferences alignment
        userPreferences?.priority === preset.characteristics.priority ? 1.0 : 0.0,
        userPreferences?.deviceTarget === preset.category ? 1.0 : 0.0,
        
        // Preset predictions
        preset.predictions.expectedSizeReduction / 100,
        preset.predictions.expectedQualityScore,
        preset.predictions.confidenceScore,
        
        // Document-preset compatibility indicators
        analysis.pageCount > 50 && preset.category === 'archive' ? 1.0 : 0.0,
        analysis.contentTypes.images.count > 10 && preset.category === 'web' ? 1.0 : 0.0,
        analysis.contentTypes.text.readability > 0.8 && preset.category === 'document' ? 1.0 : 0.0,
        
        // Additional features
        Math.min(1.0, analysis.totalFileSize / 10000000),
        analysis.recommendations.preserveQuality ? 1.0 : 0.0,
        
        // Placeholder features
        0.5, 0.6, 0.4, 0.7
      ];

      const input = tf.tensor2d([features]);
      const prediction = this.matchingModel.predict(input) as tf.Tensor;
      const result = await prediction.data();
      
      input.dispose();
      prediction.dispose();
      
      return Math.min(1.0, Math.max(0.0, result[0]));
    } catch (error) {
      console.warn('Match scoring fallback used:', error);
      return 0.5;
    }
  }

  private generateReasoning(
    preset: SmartPreset,
    analysis: PDFContentAnalysis,
    userPreferences?: any
  ): string[] {
    const reasoning: string[] = [];
    
    reasoning.push(`${preset.name} preset seçildi`);
    
    if (preset.predictions.expectedSizeReduction > 40) {
      reasoning.push(`Yüksek sıkıştırma oranı bekleniyor (%${preset.predictions.expectedSizeReduction.toFixed(0)})`);
    }
    
    if (preset.predictions.expectedQualityScore > 0.8) {
      reasoning.push('Kalite korunacak');
    }
    
    if (analysis.contentTypes.images.count > 5) {
      reasoning.push('Çok sayıda resim tespit edildi, uygun optimization');
    }
    
    if (userPreferences?.priority === preset.characteristics.priority) {
      reasoning.push('Kullanıcı tercihleri ile uyumlu');
    }
    
    return reasoning;
  }

  private generateWarnings(preset: SmartPreset, analysis: PDFContentAnalysis): string[] {
    const warnings: string[] = [];
    
    if (preset.characteristics.aggressiveness === 'aggressive') {
      warnings.push('Agresif sıkıştırma - kalite kaybı olabilir');
    }
    
    if (preset.predictions.expectedQualityScore < 0.6) {
      warnings.push('Önemli kalite kaybı bekleniyor');
    }
    
    if (analysis.contentTypes.text.readability < 0.6 && preset.characteristics.priority === 'size') {
      warnings.push('OCR içerik tespit edildi - metin kalitesi etkilenebilir');
    }
    
    return warnings;
  }

  private getTargetUseCase(category: string): string {
    const useCases = {
      web: 'Web sitelerinde hızlı görüntüleme',
      print: 'Yüksek kaliteli yazdırma',
      archive: 'Uzun süreli arşivleme',
      mobile: 'Mobil cihazlarda görüntüleme',
      presentation: 'Sunum ve ekran paylaşımı',
      document: 'Genel doküman kullanımı'
    };
    return useCases[category as keyof typeof useCases] || 'Genel kullanım';
  }

  private getRecommendedFor(category: string): string[] {
    const recommendations = {
      web: ['Web sitesi yüklemeleri', 'Email ekleri', 'Online paylaşım'],
      print: ['Yazdırma amaçlı', 'Yüksek çözünürlük gerekli', 'Detay önemli'],
      archive: ['Uzun süreli saklama', 'Backup amaçlı', 'Alan tasarrufu'],
      mobile: ['Mobil görüntüleme', 'Sınırlı bant genişliği', 'Hızlı erişim'],
      presentation: ['Ekran sunumu', 'Projectör kullanımı', 'Video konferans'],
      document: ['Günlük kullanım', 'Ofis dokümanları', 'Standart paylaşım']
    };
    return recommendations[category as keyof typeof recommendations] || ['Genel kullanım'];
  }

  private getNotRecommendedFor(category: string): string[] {
    const notRecommended = {
      web: ['Yüksek kalite yazdırma', 'Detaylı grafik işleri'],
      print: ['Web hızlı yükleme', 'Mobil görüntüleme'],
      archive: ['Sık erişilen dosyalar', 'Kalite kritik işler'],
      mobile: ['Yazdırma amaçlı', 'Yüksek çözünürlük gerekli'],
      presentation: ['Yazdırma amaçlı', 'Detaylı inceleme'],
      document: ['Özel gereksinimler', 'Ekstrem optimizasyon']
    };
    return notRecommended[category as keyof typeof notRecommended] || [];
  }

  private generateTags(basePreset: any, analysis: PDFContentAnalysis): string[] {
    const tags: string[] = [basePreset.priority];
    
    if (basePreset.aggressiveness === 'aggressive') tags.push('maksimum-sıkıştırma');
    if (basePreset.category === 'web') tags.push('hızlı-yükleme');
    if (basePreset.category === 'print') tags.push('yazdırma-kalitesi');
    if (analysis.contentTypes.images.count > 10) tags.push('resim-ağırlıklı');
    if (analysis.pageCount > 50) tags.push('büyük-doküman');
    
    return tags;
  }

  private getDifficulty(aggressiveness: string): 'beginner' | 'intermediate' | 'advanced' {
    return aggressiveness === 'conservative' ? 'beginner' :
           aggressiveness === 'moderate' ? 'intermediate' : 'advanced';
  }

  private getFallbackPresets(analysis: PDFContentAnalysis): SmartPreset[] {
    return Object.entries(this.basePresets).map(([key, preset]) => ({
      id: key,
      name: preset.name,
      description: preset.description,
      category: preset.category,
      characteristics: {
        priority: preset.priority,
        aggressiveness: preset.aggressiveness,
        targetUseCase: this.getTargetUseCase(preset.category),
        recommendedFor: this.getRecommendedFor(preset.category),
        notRecommendedFor: this.getNotRecommendedFor(preset.category)
      },
      settings: this.generatePresetSettings(preset, analysis),
      predictions: {
        expectedSizeReduction: 30,
        expectedQualityScore: 0.7,
        processingTime: analysis.pageCount * 1.0,
        confidenceScore: 0.6
      },
      display: {
        icon: preset.icon,
        color: preset.color,
        tags: ['fallback'],
        difficulty: this.getDifficulty(preset.aggressiveness)
      }
    }));
  }

  // Memory management
  dispose(): void {
    this.presetClassifier?.dispose();
    this.matchingModel?.dispose();
    this.presetClassifier = undefined;
    this.matchingModel = undefined;
    this.initialized = false;
    console.log('🧹 AI Smart Presets disposed');
  }
}

// Singleton instance
export const aiSmartPresets = AISmartPresets.getInstance(); 