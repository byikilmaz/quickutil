import { aiPDFAnalyzer, PDFContentAnalysis } from './pdfAnalyzer';
import { aiCompressionOptimizer, OptimalCompressionSettings } from './compressionOptimizer';
import { aiQualityPredictor, QualityPrediction } from './qualityPredictor';
import { aiSmartPresets, SmartPreset, PresetRecommendation } from './smartPresets';

export interface AIEngineConfig {
  enableAnalyzer: boolean;
  enableOptimizer: boolean;
  enableQualityPredictor: boolean;
  enableSmartPresets: boolean;
  autoInitialize: boolean;
}

export interface AIProcessingResult {
  // Ana analiz sonuçları
  analysis: PDFContentAnalysis;
  
  // Optimal ayarlar
  optimalSettings: OptimalCompressionSettings;
  
  // Kalite tahmini
  qualityPrediction: QualityPrediction;
  
  // Smart presets
  recommendedPreset: PresetRecommendation;
  allPresets: SmartPreset[];
  
  // İşlem metrikleri
  processingMetrics: {
    totalProcessingTime: number; // ms
    analysisTime: number;
    optimizationTime: number;
    predictionTime: number;
    presetsTime: number;
    aiConfidence: number; // 0-1
  };
  
  // UI için hazır data
  uiData: {
    summaryStats: {
      originalSize: number;
      estimatedSize: number;
      sizeReduction: number;
      qualityScore: number;
    };
    recommendations: string[];
    warnings: string[];
    insights: string[];
  };
}

export interface UserPreferences {
  priority: 'size' | 'quality' | 'balanced';
  aggressiveMode?: boolean;
  preserveReadability?: boolean;
  deviceTarget?: 'desktop' | 'mobile' | 'print' | 'web';
  useCase?: string;
  customSettings?: Partial<OptimalCompressionSettings>;
}

export class AIEngine {
  private static instance: AIEngine;
  private initialized = false;
  private config: AIEngineConfig;

  private constructor(config: Partial<AIEngineConfig> = {}) {
    this.config = {
      enableAnalyzer: true,
      enableOptimizer: true,
      enableQualityPredictor: true,
      enableSmartPresets: true,
      autoInitialize: true,
      ...config
    };
  }

  static getInstance(config?: Partial<AIEngineConfig>): AIEngine {
    if (!AIEngine.instance) {
      AIEngine.instance = new AIEngine(config);
    }
    return AIEngine.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('🚀 AI Engine initialization started...');
    const startTime = performance.now();

    try {
      const initPromises: Promise<void>[] = [];

      if (this.config.enableAnalyzer) {
        initPromises.push(aiPDFAnalyzer.initialize());
      }

      if (this.config.enableOptimizer) {
        initPromises.push(aiCompressionOptimizer.initialize());
      }

      if (this.config.enableQualityPredictor) {
        initPromises.push(aiQualityPredictor.initialize());
      }

      if (this.config.enableSmartPresets) {
        initPromises.push(aiSmartPresets.initialize());
      }

      // Parallel initialization
      await Promise.all(initPromises);

      this.initialized = true;
      const initTime = performance.now() - startTime;
      console.log(`✅ AI Engine initialized successfully in ${initTime.toFixed(2)}ms`);

    } catch (error) {
      console.error('❌ AI Engine initialization failed:', error);
      throw new Error('AI Engine başlatılamadı: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    }
  }

  async processFile(
    file: File,
    userPreferences: UserPreferences = { priority: 'balanced' }
  ): Promise<AIProcessingResult> {
    if (!this.initialized && this.config.autoInitialize) {
      await this.initialize();
    }

    if (!this.initialized) {
      throw new Error('AI Engine initialized değil. Önce initialize() çağırın.');
    }

    console.log('🧠 AI Engine processing file:', file.name);
    const processingStart = performance.now();

    try {
      // 1. PDF Analysis
      console.log('📊 Step 1: PDF Analysis...');
      const analysisStart = performance.now();
      const analysis = await aiPDFAnalyzer.analyzePDF(file);
      const analysisTime = performance.now() - analysisStart;

      // 2. Optimal Settings Generation
      console.log('⚙️ Step 2: Optimal Settings Generation...');
      const optimizationStart = performance.now();
      const optimalSettings = await aiCompressionOptimizer.generateOptimalSettings(
        analysis,
        userPreferences
      );
      const optimizationTime = performance.now() - optimizationStart;

      // 3. Quality Prediction
      console.log('🔮 Step 3: Quality Prediction...');
      const predictionStart = performance.now();
      const qualityPrediction = await aiQualityPredictor.predictQuality(
        analysis,
        optimalSettings
      );
      const predictionTime = performance.now() - predictionStart;

      // 4. Smart Presets
      console.log('🎯 Step 4: Smart Presets Generation...');
      const presetsStart = performance.now();
      const [recommendedPreset, allPresets] = await Promise.all([
        aiSmartPresets.recommendBestPreset(analysis, userPreferences),
        aiSmartPresets.generateSmartPresets(analysis)
      ]);
      const presetsTime = performance.now() - presetsStart;

      // Calculate metrics
      const totalProcessingTime = performance.now() - processingStart;
      const aiConfidence = this.calculateOverallConfidence(
        analysis,
        optimalSettings,
        qualityPrediction,
        recommendedPreset
      );

      // Build result object
      const result: AIProcessingResult = {
        analysis,
        optimalSettings,
        qualityPrediction,
        recommendedPreset,
        allPresets,
        
        processingMetrics: {
          totalProcessingTime,
          analysisTime,
          optimizationTime,
          predictionTime,
          presetsTime,
          aiConfidence
        },
        
        uiData: this.generateUIData(
          file,
          analysis,
          optimalSettings,
          qualityPrediction,
          recommendedPreset
        )
      };

      console.log(`✅ AI Engine processing completed in ${totalProcessingTime.toFixed(2)}ms`);
      console.log('🎯 AI Confidence Score:', aiConfidence.toFixed(2));

      return result;

    } catch (error) {
      console.error('❌ AI Engine processing failed:', error);
      throw new Error('AI işleme sırasında hata: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    }
  }

  async quickAnalysis(file: File): Promise<{
    fileSize: number;
    pageCount: number;
    contentType: 'text-heavy' | 'image-heavy' | 'mixed' | 'vector-heavy';
    estimatedReduction: number;
    recommendedPreset: string;
    processingTime: number;
  }> {
    console.log('⚡ AI Engine quick analysis for:', file.name);
    const startTime = performance.now();

    try {
      // Lightweight analysis
      const analysis = await aiPDFAnalyzer.analyzePDF(file);
      
      // Determine content type
      const imageRatio = analysis.contentTypes.images.count / Math.max(1, analysis.pageCount);
      const textDensity = analysis.contentTypes.text.density;
      const vectorCount = analysis.contentTypes.vectors.count;

      let contentType: 'text-heavy' | 'image-heavy' | 'mixed' | 'vector-heavy';
      if (imageRatio > 2) contentType = 'image-heavy';
      else if (vectorCount > 20) contentType = 'vector-heavy';
      else if (textDensity > 0.7) contentType = 'text-heavy';
      else contentType = 'mixed';

      // Quick preset recommendation
      let recommendedPreset = 'document_standard';
      if (contentType === 'image-heavy') recommendedPreset = 'web_optimized';
      else if (analysis.pageCount > 50) recommendedPreset = 'archive_compression';
      else if (vectorCount > 10) recommendedPreset = 'presentation_mode';

      const processingTime = performance.now() - startTime;

      return {
        fileSize: analysis.totalFileSize,
        pageCount: analysis.pageCount,
        contentType,
        estimatedReduction: analysis.recommendations.estimatedSizeReduction,
        recommendedPreset,
        processingTime
      };

    } catch (error) {
      console.error('❌ Quick analysis failed:', error);
      throw error;
    }
  }

  private calculateOverallConfidence(
    analysis: PDFContentAnalysis,
    settings: OptimalCompressionSettings,
    prediction: QualityPrediction,
    preset: PresetRecommendation
  ): number {
    const weights = {
      analysis: 0.25,
      settings: 0.25,
      prediction: 0.3,
      preset: 0.2
    };

    const scores = [
      analysis.recommendations.confidenceScore * weights.analysis,
      settings.predictions.confidenceScore * weights.settings,
      prediction.sizeReduction.confidenceLevel * weights.prediction,
      preset.matchScore * weights.preset
    ];

    return Math.min(0.95, Math.max(0.5, scores.reduce((sum, score) => sum + score, 0)));
  }

  private generateUIData(
    file: File,
    analysis: PDFContentAnalysis,
    settings: OptimalCompressionSettings,
    prediction: QualityPrediction,
    preset: PresetRecommendation
  ): AIProcessingResult['uiData'] {
    
    const estimatedSize = prediction.sizeReduction.estimatedFinalSize;
    const sizeReduction = ((file.size - estimatedSize) / file.size) * 100;

    // Recommendations
    const recommendations: string[] = [
      ...settings.insights.recommendations,
      ...preset.reasoning
    ];

    // Warnings
    const warnings: string[] = [
      ...settings.insights.warnings,
      ...preset.warnings,
      ...prediction.riskAssessment.potentialIssues
    ];

    // AI Insights
    const insights: string[] = [];
    
    if (analysis.contentTypes.images.compressionPotential > 0.7) {
      insights.push('Resimler yüksek sıkıştırma potansiyeline sahip');
    }
    
    if (analysis.contentTypes.text.complexity > 0.6) {
      insights.push('Font optimizasyonu büyük kazanç sağlayabilir');
    }
    
    if (prediction.qualityImpact.overallScore > 0.8) {
      insights.push('Kalite korunarak sıkıştırma mümkün');
    }
    
    if (prediction.riskAssessment.riskLevel === 'low') {
      insights.push('Güvenli sıkıştırma ayarları tespit edildi');
    }

    return {
      summaryStats: {
        originalSize: file.size,
        estimatedSize,
        sizeReduction,
        qualityScore: prediction.qualityImpact.overallScore
      },
      recommendations: recommendations.slice(0, 5), // Top 5
      warnings: warnings.slice(0, 3), // Top 3
      insights: insights.slice(0, 4) // Top 4
    };
  }

  // Utility methods
  async getPresetById(presetId: string, analysis: PDFContentAnalysis): Promise<SmartPreset | null> {
    const presets = await aiSmartPresets.generateSmartPresets(analysis);
    return presets.find(preset => preset.id === presetId) || null;
  }

  async comparePresets(
    presetIds: string[],
    analysis: PDFContentAnalysis
  ): Promise<{
    preset: SmartPreset;
    prediction: QualityPrediction;
  }[]> {
    const comparisons = [];
    
    for (const presetId of presetIds) {
      const preset = await this.getPresetById(presetId, analysis);
      if (preset) {
        const prediction = await aiQualityPredictor.predictQuality(analysis, preset.settings);
        comparisons.push({ preset, prediction });
      }
    }
    
    return comparisons;
  }

  // Configuration methods
  updateConfig(newConfig: Partial<AIEngineConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ AI Engine config updated:', this.config);
  }

  getStatus(): {
    initialized: boolean;
    config: AIEngineConfig;
    components: {
      analyzer: boolean;
      optimizer: boolean;
      qualityPredictor: boolean;
      smartPresets: boolean;
    };
  } {
    return {
      initialized: this.initialized,
      config: this.config,
      components: {
        analyzer: this.config.enableAnalyzer,
        optimizer: this.config.enableOptimizer,
        qualityPredictor: this.config.enableQualityPredictor,
        smartPresets: this.config.enableSmartPresets
      }
    };
  }

  // Memory management
  dispose(): void {
    if (this.config.enableAnalyzer) aiPDFAnalyzer.dispose();
    if (this.config.enableOptimizer) aiCompressionOptimizer.dispose();
    if (this.config.enableQualityPredictor) aiQualityPredictor.dispose();
    if (this.config.enableSmartPresets) aiSmartPresets.dispose();
    
    this.initialized = false;
    console.log('🧹 AI Engine disposed');
  }

  // Static utility
  static formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  static formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  static formatDuration(ms: number): string {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  }
}

// Singleton instance with default config
export const aiEngine = AIEngine.getInstance();

// Export types for external use
export type {
  PDFContentAnalysis,
  OptimalCompressionSettings,
  QualityPrediction,
  SmartPreset,
  PresetRecommendation
}; 