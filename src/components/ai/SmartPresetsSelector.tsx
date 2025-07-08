'use client';

import { useState } from 'react';
import {
  CheckCircleIcon,
  StarIcon,
  ClockIcon,
  AdjustmentsHorizontalIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';
import { SmartPreset, PresetRecommendation } from '@/lib/ai/aiEngine';

interface SmartPresetsSelectorProps {
  presets: SmartPreset[];
  recommendedPreset: PresetRecommendation;
  selectedPreset?: SmartPreset;
  onPresetSelect: (preset: SmartPreset) => void;
  onCustomize?: (preset: SmartPreset) => void;
}

export default function SmartPresetsSelector({
  presets,
  recommendedPreset,
  selectedPreset,
  onPresetSelect,
  onCustomize
}: SmartPresetsSelectorProps) {
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const getPresetColor = (color: string) => {
    const colorMap = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600',
      gray: 'from-gray-500 to-gray-600'
    };
    return colorMap[color as keyof typeof colorMap] || 'from-blue-500 to-blue-600';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-800';
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300 rounded-xl shadow-xl p-6 space-y-6">
      {/* Header */}
      <div className="text-center bg-white rounded-xl p-6 shadow-lg border border-purple-200">
        <div className="bg-purple-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <SparklesIcon className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-3xl font-bold text-purple-900 mb-4">
          🤖 AI Smart Presets
        </h3>
        <p className="text-gray-800 text-lg font-medium mb-4">
          Neural network tarafından dosyanız için optimize edilmiş ayarlar
        </p>
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-lg p-4 inline-block">
          <p className="text-yellow-800 font-bold text-lg">
            ⚡ Bir preset seçin ve sıkıştırma işlemini başlatın!
          </p>
          <p className="text-yellow-700 text-sm mt-1">
            📋 Preset seçtikten sonra aşağıda <strong>"Sıkıştır"</strong> butonuna tıklayın
          </p>
        </div>
        <div className="mt-4 text-center">
          <div className="text-sm text-gray-800">Toplam Preset Sayısı</div>
          <div className="text-2xl font-bold text-purple-600">{presets.length}</div>
        </div>
      </div>

      {/* Recommended Preset Highlight */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6 animate-bounce-in">
        <div className="flex items-center mb-4">
          <div className="bg-yellow-500 p-2 rounded-lg mr-3">
            <StarIconSolid className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">
              🏆 En Uygun Preset: {recommendedPreset.preset.name}
            </h4>
            <p className="text-gray-800 text-sm">
              AI tarafından dosyanız için özel olarak önerilen optimal ayar
            </p>
          </div>
          <div className="ml-auto">
            <div className="text-right">
              <div className="text-sm text-gray-800">Eşleşme Oranı</div>
              <div className="text-2xl font-bold text-yellow-600">
                {(recommendedPreset.matchScore * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white/60 rounded-lg p-3">
            <div className="text-sm text-gray-800">🎯 Boyut Azalacak</div>
            <div className="text-lg font-bold text-green-600">
              {recommendedPreset.preset.predictions.expectedSizeReduction.toFixed(0)}%
            </div>
          </div>
          <div className="bg-white/60 rounded-lg p-3">
            <div className="text-sm text-gray-800">💎 Kalite Puanı</div>
            <div className="text-lg font-bold text-blue-600">
              {(recommendedPreset.preset.predictions.expectedQualityScore * 100).toFixed(0)}%
            </div>
          </div>
          <div className="bg-white/60 rounded-lg p-3">
            <div className="text-sm text-gray-800">⚡ İşlem Süresi</div>
            <div className="text-lg font-bold text-purple-600">
              {recommendedPreset.preset.predictions.processingTime.toFixed(1)}s
            </div>
          </div>
        </div>

        <button
          onClick={() => onPresetSelect(recommendedPreset.preset)}
          className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
            selectedPreset?.id === recommendedPreset.preset.id
              ? 'bg-yellow-500 text-white shadow-lg'
              : 'bg-white border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50'
          }`}
        >
          {selectedPreset?.id === recommendedPreset.preset.id ? (
            <div className="flex items-center justify-center">
              <CheckCircleIconSolid className="h-5 w-5 mr-2" />
              ✅ Seçildi - Önerilen Preset
            </div>
          ) : (
            '⭐ Bu Preset\'i Seç (Önerilen)'
          )}
        </button>
      </div>

      {/* All Presets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {presets.map((preset) => {
          const isRecommended = preset.id === recommendedPreset.preset.id;
          const isSelected = selectedPreset?.id === preset.id;
          
          return (
            <div
              key={preset.id}
              className={`relative bg-white rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                isSelected 
                  ? 'border-blue-500 shadow-lg scale-105' 
                  : isRecommended
                  ? 'border-yellow-300 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Header */}
              <div className={`relative bg-gradient-to-r ${getPresetColor(preset.display.color)} p-4 rounded-t-xl`}>
                {isRecommended && (
                  <div className="absolute -top-2 -right-2 bg-yellow-500 text-white p-1 rounded-full">
                    <StarIconSolid className="h-4 w-4" />
                  </div>
                )}
                
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{preset.display.icon}</span>
                    <div>
                      <h4 className="font-semibold">{preset.name}</h4>
                      <div className="text-xs opacity-90 capitalize">{preset.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs opacity-90">AI Güven</div>
                    <div className="font-bold">
                      {(preset.predictions.confidenceScore * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-gray-800 text-sm mb-4">{preset.description}</p>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-green-600">
                      {preset.predictions.expectedSizeReduction.toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-800">Küçülme</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-blue-600">
                      {(preset.predictions.expectedQualityScore * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-800">Kalite</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-purple-600">
                      {preset.predictions.processingTime.toFixed(1)}s
                    </div>
                    <div className="text-xs text-gray-800">Süre</div>
                  </div>
                </div>

                {/* Characteristics */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-800">🎯 Hedef:</span>
                    <span className="font-medium capitalize">{preset.characteristics.priority}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-800">📊 Seviye:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(preset.display.difficulty)}`}>
                      {preset.display.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-800">⚠️ Risk:</span>
                    <span className={`font-medium capitalize ${getRiskColor(preset.characteristics.aggressiveness)}`}>
                      {preset.characteristics.aggressiveness}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {preset.display.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => onPresetSelect(preset)}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {isSelected ? (
                      <div className="flex items-center justify-center">
                        <CheckCircleIconSolid className="h-4 w-4 mr-2" />
                        ✅ Seçildi
                      </div>
                    ) : (
                      '📋 Bu Preset\'i Seç'
                    )}
                  </button>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowDetails(showDetails === preset.id ? null : preset.id)}
                      className="flex-1 py-1.5 px-3 text-sm text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      <InformationCircleIcon className="h-4 w-4 inline mr-1" />
                      ℹ️ Detaylar
                    </button>
                    {onCustomize && (
                      <button
                        onClick={() => onCustomize(preset)}
                        className="flex-1 py-1.5 px-3 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                      >
                        <AdjustmentsHorizontalIcon className="h-4 w-4 inline mr-1" />
                        🎛️ Ayarla
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Dropdown */}
                {showDetails === preset.id && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg animate-fade-in">
                    <div className="space-y-3 text-sm">
                      <div>
                        <div className="font-medium text-gray-900 mb-1">🎯 Ne İçin Kullanılır:</div>
                        <div className="text-gray-800">{preset.characteristics.targetUseCase}</div>
                      </div>
                      
                      <div>
                        <div className="font-medium text-gray-900 mb-1">✅ Uygun Durumlar:</div>
                        <ul className="text-gray-800 text-xs space-y-1">
                          {preset.characteristics.recommendedFor.slice(0, 3).map((item, index) => (
                            <li key={index} className="flex items-center">
                              <CheckCircleIcon className="h-3 w-3 text-green-500 mr-1" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {preset.characteristics.notRecommendedFor.length > 0 && (
                        <div>
                          <div className="font-medium text-gray-900 mb-1">❌ Uygun Olmayan:</div>
                          <ul className="text-gray-800 text-xs space-y-1">
                            {preset.characteristics.notRecommendedFor.slice(0, 2).map((item, index) => (
                              <li key={index} className="flex items-center">
                                <ExclamationTriangleIcon className="h-3 w-3 text-red-500 mr-1" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Compare */}
      {presets.length > 1 && (
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-4">📊 Hızlı Karşılaştırma</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-gray-900">Preset</th>
                  <th className="text-center py-2 px-3 text-gray-900">Boyut Azalma</th>
                  <th className="text-center py-2 px-3 text-gray-900">Kalite Puanı</th>
                  <th className="text-center py-2 px-3 text-gray-900">İşlem Süresi</th>
                  <th className="text-center py-2 px-3 text-gray-900">Seviye</th>
                </tr>
              </thead>
              <tbody>
                {presets.slice(0, 4).map((preset) => (
                  <tr key={preset.id} className="border-b border-gray-100 hover:bg-white transition-colors">
                    <td className="py-2 px-3">
                      <div className="flex items-center">
                        <span className="mr-2">{preset.display.icon}</span>
                        <span className="font-medium text-gray-900">{preset.name}</span>
                        {preset.id === recommendedPreset.preset.id && (
                          <StarIcon className="h-4 w-4 text-yellow-500 ml-1" />
                        )}
                      </div>
                    </td>
                    <td className="text-center py-2 px-3 font-medium text-green-600">
                      {preset.predictions.expectedSizeReduction.toFixed(0)}%
                    </td>
                    <td className="text-center py-2 px-3 font-medium text-blue-600">
                      {(preset.predictions.expectedQualityScore * 100).toFixed(0)}%
                    </td>
                    <td className="text-center py-2 px-3 font-medium text-purple-600">
                      {preset.predictions.processingTime.toFixed(1)}s
                    </td>
                    <td className="text-center py-2 px-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(preset.display.difficulty)}`}>
                        {preset.display.difficulty}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 