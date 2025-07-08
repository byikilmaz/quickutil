'use client';

import { useState } from 'react';
import {
  CircularProgressbar,
  buildStyles
} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  ChartBarIcon,
  DocumentTextIcon,
  PhotoIcon,
  RectangleGroupIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ClockIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { AIProcessingResult } from '@/lib/ai/aiEngine';

interface AIAnalysisPanelProps {
  aiResult: AIProcessingResult;
  isLoading?: boolean;
}

// Helper functions for user-friendly display
const getTextQualityLabel = (density: number, complexity: number, readability: number) => {
  if (density > 0.7 && readability > 0.8) return { text: '🟢 Mükemmel Metin', color: 'text-green-600' };
  if (density > 0.4 && readability > 0.5) return { text: '🟡 İyi Metin', color: 'text-yellow-600' };
  return { text: '🔴 Basit Metin', color: 'text-red-600' };
};

const getImageQualityLabel = (averageResolution: number, compressionPotential: number) => {
  if (averageResolution > 300) return { text: '🟢 Yüksek Kalite', color: 'text-green-600' };
  if (averageResolution > 150) return { text: '🟡 Orta Kalite', color: 'text-yellow-600' };
  return { text: '🔴 Düşük Çözünürlük', color: 'text-red-600' };
};

const getCompressionPotentialLabel = (potential: number) => {
  if (potential > 0.7) return { text: '🚀 Çok İyi Sıkışır', color: 'text-green-600' };
  if (potential > 0.4) return { text: '📉 Orta Sıkışır', color: 'text-yellow-600' };
  return { text: '❌ Az Sıkışır', color: 'text-red-600' };
};

const getRiskLevelLabel = (riskLevel: string) => {
  if (riskLevel === 'low') return { text: '🟢 Güvenli', color: 'text-green-600' };
  if (riskLevel === 'medium') return { text: '🟡 Dikkatli', color: 'text-yellow-600' };
  return { text: '🔴 Riskli', color: 'text-red-600' };
};

const getComplexityLabel = (complexity: string) => {
  if (complexity === 'low') return { text: '🟢 Basit', color: 'text-green-600' };
  if (complexity === 'medium') return { text: '🟡 Orta', color: 'text-yellow-600' };
  return { text: '🔴 Karmaşık', color: 'text-red-600' };
};

export default function AIAnalysisPanel({ aiResult, isLoading = false }: AIAnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'insights'>('overview');

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-8 animate-pulse">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-4"></div>
          <div>
            <h3 className="text-xl font-semibold text-blue-900 mb-2">🧠 AI Analiz Yapılıyor</h3>
            <p className="text-blue-700">Neural network dosyanızı analiz ediyor...</p>
          </div>
        </div>
      </div>
    );
  }

  const { analysis, qualityPrediction, processingMetrics, uiData, recommendedPreset } = aiResult;

  const tabs = [
    { id: 'overview', name: 'Genel Bakış', icon: ChartBarIcon },
    { id: 'detailed', name: 'Detaylı Analiz', icon: AdjustmentsHorizontalIcon },
    { id: 'insights', name: 'AI Öngörüler', icon: LightBulbIcon }
  ];

  // User-friendly labels
  const textQuality = getTextQualityLabel(analysis.contentTypes.text.density, analysis.contentTypes.text.complexity, analysis.contentTypes.text.readability);
  const imageQuality = getImageQualityLabel(analysis.contentTypes.images.averageResolution, analysis.contentTypes.images.compressionPotential);
  const compressionPotential = getCompressionPotentialLabel(analysis.contentTypes.images.compressionPotential);
  const riskLevel = getRiskLevelLabel(qualityPrediction.riskAssessment.riskLevel);
  const complexityLevel = getComplexityLabel(qualityPrediction.performance.complexity);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-8 animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-blue-600 p-3 rounded-lg mr-4">
            <CpuChipIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">🤖 AI Analiz Sonuçları</h3>
            <p className="text-gray-800">Neural network tabanlı PDF optimizasyonu</p>
          </div>
        </div>
        <div className="text-right">
                      <div className="text-sm text-gray-800">AI Güven Skoru</div>
          <div className="text-2xl font-bold text-blue-600">
            {(processingMetrics.aiConfidence * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-white/50 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white shadow-md text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/70 backdrop-blur rounded-xl p-4 text-center">
              <div className="w-16 h-16 mx-auto mb-3">
                <CircularProgressbar
                  value={uiData.summaryStats.sizeReduction}
                  text={`${uiData.summaryStats.sizeReduction.toFixed(0)}%`}
                  styles={buildStyles({
                    textColor: '#059669',
                    pathColor: '#059669',
                    trailColor: '#d1fae5'
                  })}
                />
              </div>
              <div className="text-sm font-medium text-gray-900">📉 Boyut Azalması</div>
            </div>

            <div className="bg-white/70 backdrop-blur rounded-xl p-4 text-center">
              <div className="w-16 h-16 mx-auto mb-3">
                <CircularProgressbar
                  value={uiData.summaryStats.qualityScore * 100}
                  text={`${(uiData.summaryStats.qualityScore * 100).toFixed(0)}%`}
                  styles={buildStyles({
                    textColor: '#2563eb',
                    pathColor: '#2563eb',
                    trailColor: '#dbeafe'
                  })}
                />
              </div>
              <div className="text-sm font-medium text-gray-900">💎 Kalite Puanı</div>
            </div>

            <div className="bg-white/70 backdrop-blur rounded-xl p-4 text-center">
              <ClockIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-purple-600">
                {qualityPrediction.performance.processingTime.toFixed(1)}s
              </div>
              <div className="text-sm font-medium text-gray-900">⏱️ İşlem Süresi</div>
            </div>

            <div className="bg-white/70 backdrop-blur rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">
                {qualityPrediction.riskAssessment.riskLevel === 'low' ? '🟢' :
                 qualityPrediction.riskAssessment.riskLevel === 'medium' ? '🟡' : '🔴'}
              </div>
              <div className={`text-lg font-bold ${riskLevel.color}`}>
                {riskLevel.text.split(' ')[1]}
              </div>
              <div className="text-sm font-medium text-gray-900">🛡️ Güvenlik</div>
            </div>
          </div>

          {/* Content Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/70 backdrop-blur rounded-xl p-6">
              <div className="flex items-center mb-4">
                <DocumentTextIcon className="h-6 w-6 text-blue-600 mr-2" />
                <h4 className="font-semibold text-gray-900">📝 Metin İçeriği</h4>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Metin Kalitesi:</span>
                  <span className={`font-medium ${textQuality.color}`}>{textQuality.text}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sayfa Sayısı:</span>
                  <span className="font-medium text-gray-800">{analysis.pageCount} sayfa</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Font Çeşitliliği:</span>
                  <span className="font-medium">{analysis.contentTypes.text.complexity > 0.6 ? '🎨 Zengin' : analysis.contentTypes.text.complexity > 0.3 ? '📝 Normal' : '⚡ Basit'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur rounded-xl p-6">
              <div className="flex items-center mb-4">
                <PhotoIcon className="h-6 w-6 text-green-600 mr-2" />
                <h4 className="font-semibold text-gray-900">🖼️ Görsel İçerik</h4>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Resim Sayısı:</span>
                  <span className="font-medium text-gray-800">{analysis.contentTypes.images.count} adet</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Resim Kalitesi:</span>
                  <span className={`font-medium ${imageQuality.color}`}>{imageQuality.text}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sıkışma Potansiyeli:</span>
                  <span className={`font-medium ${compressionPotential.color}`}>{compressionPotential.text}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur rounded-xl p-6">
              <div className="flex items-center mb-4">
                <RectangleGroupIcon className="h-6 w-6 text-purple-600 mr-2" />
                <h4 className="font-semibold text-gray-900">🎨 Vektör Grafik</h4>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Grafik Sayısı:</span>
                  <span className="font-medium text-gray-800">{analysis.contentTypes.vectors.count} adet</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Karmaşıklık:</span>
                  <span className={`font-medium ${complexityLevel.color}`}>{complexityLevel.text}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Optimizasyon:</span>
                  <span className="font-medium">{analysis.contentTypes.vectors.optimizable > 0.6 ? '🚀 Mükemmel' : analysis.contentTypes.vectors.optimizable > 0.3 ? '⚡ İyi' : '❌ Sınırlı'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Preset */}
          <div className="bg-white/70 backdrop-blur rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              🎯 Önerilen Preset: {recommendedPreset.preset.name}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-2">📝 Açıklama:</div>
                <div className="text-sm text-gray-900 mb-3">{recommendedPreset.preset.description}</div>
                <div className="flex items-center">
                  <span className="text-2xl mr-2">{recommendedPreset.preset.display.icon}</span>
                  <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                    {recommendedPreset.preset.characteristics.priority === 'size' ? '📉 Boyut Odaklı' :
                     recommendedPreset.preset.characteristics.priority === 'quality' ? '💎 Kalite Odaklı' : '⚖️ Dengeli'}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-2">🎯 Eşleşme Skoru:</div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${recommendedPreset.matchScore * 100}%` }}
                  ></div>
                </div>
                <div className="text-sm font-medium text-blue-600 flex items-center">
                  {recommendedPreset.matchScore > 0.8 ? '🟢' : recommendedPreset.matchScore > 0.6 ? '🟡' : '🔴'}
                  <span className="ml-1">{(recommendedPreset.matchScore * 100).toFixed(0)}% Uyumlu</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed tab content - keeping the same structure but with user-friendly labels */}
      {activeTab === 'detailed' && (
        <div className="space-y-6">
          {/* Size Reduction Breakdown */}
          <div className="bg-white/70 backdrop-blur rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4">📊 Hangi Kısımlar Ne Kadar Küçülecek?</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <PhotoIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-sm text-gray-600">🖼️ Resimler</div>
                <div className="font-bold text-blue-600">
                  {qualityPrediction.sizeReduction.breakdown.images.toFixed(0)}%
                </div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <DocumentTextIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-sm text-gray-600">📝 Metin</div>
                <div className="font-bold text-green-600">
                  {qualityPrediction.sizeReduction.breakdown.text.toFixed(0)}%
                </div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <RectangleGroupIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-sm text-gray-600">🎨 Grafik</div>
                <div className="font-bold text-purple-600">
                  {qualityPrediction.sizeReduction.breakdown.vectors.toFixed(0)}%
                </div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <InformationCircleIcon className="h-6 w-6 text-gray-600" />
                </div>
                <div className="text-sm text-gray-600">📋 Diğer</div>
                <div className="font-bold text-gray-600">
                  {qualityPrediction.sizeReduction.breakdown.metadata.toFixed(0)}%
                </div>
              </div>
            </div>
          </div>

          {/* Quality Impact */}
          <div className="bg-white/70 backdrop-blur rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4">🎨 Kalite Kaybı Var mı?</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">💎 Genel Kalite:</span>
                    <span className="font-medium">{qualityPrediction.qualityImpact.overallScore > 0.9 ? '🟢 Mükemmel' : qualityPrediction.qualityImpact.overallScore > 0.7 ? '🟡 İyi' : '🔴 Orta'}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${qualityPrediction.qualityImpact.overallScore > 0.8 ? 'bg-green-500' : qualityPrediction.qualityImpact.overallScore > 0.5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${qualityPrediction.qualityImpact.overallScore * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">👀 Görsel Kalite:</span>
                    <span className="font-medium">{qualityPrediction.qualityImpact.visualQuality > 0.9 ? '🟢 Mükemmel' : qualityPrediction.qualityImpact.visualQuality > 0.7 ? '🟡 İyi' : '🔴 Orta'}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${qualityPrediction.qualityImpact.visualQuality > 0.8 ? 'bg-blue-500' : qualityPrediction.qualityImpact.visualQuality > 0.5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${qualityPrediction.qualityImpact.visualQuality * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white/70 backdrop-blur rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4">⚡ Hız ve Performans</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <ClockIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-blue-600">
                  {processingMetrics.totalProcessingTime < 1000 ? 'Çok Hızlı' : processingMetrics.totalProcessingTime < 3000 ? 'Hızlı' : 'Normal'}
                </div>
                <div className="text-sm text-gray-600">⏱️ İşlem Hızı</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <CpuChipIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-purple-600">
                  {qualityPrediction.performance.memoryUsage < 50 ? 'Az' : qualityPrediction.performance.memoryUsage < 100 ? 'Orta' : 'Fazla'}
                </div>
                <div className="text-sm text-gray-600">🧠 Bellek Kullanımı</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl mb-2">
                  {qualityPrediction.performance.complexity === 'low' ? '🟢' :
                   qualityPrediction.performance.complexity === 'medium' ? '🟡' : '🔴'}
                </div>
                <div className={`text-lg font-bold ${complexityLevel.color} capitalize`}>
                  {complexityLevel.text.split(' ')[1]}
                </div>
                <div className="text-sm text-gray-600">🧩 İşlem Zorluğu</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insights tab - keeping most content but improving readability */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* AI Recommendations */}
          {uiData.recommendations.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <LightBulbIcon className="h-6 w-6 text-green-600 mr-2" />
                <h4 className="font-semibold text-green-900">💡 AI'dan Size Öneriler</h4>
              </div>
              <ul className="space-y-3">
                {uiData.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-600 mr-3 text-lg">✅</span>
                    <span className="text-green-800 text-sm leading-relaxed">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {uiData.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-2" />
                <h4 className="font-semibold text-yellow-900">⚠️ Dikkat Edilmesi Gerekenler</h4>
              </div>
              <ul className="space-y-3">
                {uiData.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-yellow-600 mr-3 text-lg">⚠️</span>
                    <span className="text-yellow-800 text-sm leading-relaxed">{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Insights */}
          {uiData.insights.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <CpuChipIcon className="h-6 w-6 text-blue-600 mr-2" />
                <h4 className="font-semibold text-blue-900">🧠 AI'ın Keşfettikleri</h4>
              </div>
              <ul className="space-y-3">
                {uiData.insights.map((insight, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-3 text-lg">🔍</span>
                    <span className="text-blue-800 text-sm leading-relaxed">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Processing Breakdown */}
          <div className="bg-white/70 backdrop-blur rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4">⏱️ AI Nasıl Çalıştı?</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-700 flex items-center">
                  🔍 <span className="ml-2">PDF'i inceledi:</span>
                </span>
                <span className="font-medium text-blue-600">{processingMetrics.analysisTime.toFixed(0)}ms</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm text-gray-700 flex items-center">
                  ⚙️ <span className="ml-2">Ayarları optimize etti:</span>
                </span>
                <span className="font-medium text-purple-600">{processingMetrics.optimizationTime.toFixed(0)}ms</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-700 flex items-center">
                  🎯 <span className="ml-2">Kaliteyi tahmin etti:</span>
                </span>
                <span className="font-medium text-green-600">{processingMetrics.predictionTime.toFixed(0)}ms</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-sm text-gray-700 flex items-center">
                  🎨 <span className="ml-2">Preset'leri hazırladı:</span>
                </span>
                <span className="font-medium text-orange-600">{processingMetrics.presetsTime.toFixed(0)}ms</span>
              </div>
              <hr className="border-gray-200 my-4" />
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg font-semibold">
                <span className="text-gray-900 flex items-center">
                  🚀 <span className="ml-2">Toplam AI Süresi:</span>
                </span>
                <span className="text-blue-600">{processingMetrics.totalProcessingTime.toFixed(0)}ms</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 