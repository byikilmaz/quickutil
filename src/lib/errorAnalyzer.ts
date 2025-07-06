/**
 * 🔍 QuickUtil Error Analyzer
 * GitHub, Firebase ve kod hatalarını analiz eden kapsamlı sistem
 */

import { analytics } from './firebase';
import { logEvent } from 'firebase/analytics';

// Error categories
export enum ErrorCategory {
  FIREBASE = 'firebase',
  GITHUB = 'github',
  CODE = 'code',
  NETWORK = 'network',
  VALIDATION = 'validation',
  UI = 'ui'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

interface ErrorAnalysis {
  id: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  context: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  recommendations: string[];
  relatedIssues: string[];
}

interface FirebaseErrorData {
  code: string;
  customData?: Record<string, unknown>;
}

interface GitHubErrorData {
  status: number;
  endpoint: string;
  method: string;
  customData?: Record<string, unknown>;
}

interface CodeErrorData {
  context: string;
  customData?: Record<string, unknown>;
}

interface FirebaseError extends Error {
  code?: string;
  customData?: Record<string, unknown>;
}

interface GitHubError extends Error {
  status?: number;
  response?: {
    status: number;
    statusText: string;
  };
}

// Session ID generator
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

// Current session ID
let currentSessionId = generateSessionId();

// Error analysis storage
const errorHistory: ErrorAnalysis[] = [];

/**
 * 🔥 Firebase Error Analyzer
 * Firebase hatalarını analiz eder ve çözüm önerileri sunar
 */
export const analyzeFirebaseError = (error: FirebaseError, data: FirebaseErrorData): ErrorAnalysis => {
  const analysis: ErrorAnalysis = {
    id: `firebase_${Date.now()}`,
    category: ErrorCategory.FIREBASE,
    severity: getFirebaseErrorSeverity(data.code),
    message: error.message,
    stack: error.stack,
    context: {
      code: data.code,
      ...data.customData
    },
    timestamp: new Date(),
    sessionId: currentSessionId,
    recommendations: getFirebaseErrorRecommendations(data.code),
    relatedIssues: []
  };

  // Store in history
  errorHistory.push(analysis);

  // Log to Firebase Analytics
  if (analytics) {
    logEvent(analytics, 'error_analyzed', {
      error_category: analysis.category,
      error_severity: analysis.severity,
      error_code: data.code,
      session_id: currentSessionId
    });
  }

  // Console logging for development
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔥 Firebase Error Analysis: ${data.code}`);
    console.error('Error:', error);
    console.log('Analysis:', analysis);
    console.log('Recommendations:', analysis.recommendations);
    console.groupEnd();
  }

  return analysis;
};

/**
 * 🐙 GitHub Error Analyzer
 * GitHub API hatalarını analiz eder
 */
export const analyzeGitHubError = (error: GitHubError, data: GitHubErrorData): ErrorAnalysis => {
  const analysis: ErrorAnalysis = {
    id: `github_${Date.now()}`,
    category: ErrorCategory.GITHUB,
    severity: getGitHubErrorSeverity(data.status),
    message: error.message,
    stack: error.stack,
    context: {
      status: data.status,
      endpoint: data.endpoint,
      method: data.method,
      ...data.customData
    },
    timestamp: new Date(),
    sessionId: currentSessionId,
    recommendations: getGitHubErrorRecommendations(data.status),
    relatedIssues: []
  };

  // Store in history
  errorHistory.push(analysis);

  // Log to Firebase Analytics
  if (analytics) {
    logEvent(analytics, 'error_analyzed', {
      error_category: analysis.category,
      error_severity: analysis.severity,
      error_code: data.status.toString(),
      session_id: currentSessionId
    });
  }

  // Console logging for development
  if (process.env.NODE_ENV === 'development') {
    console.group(`🐙 GitHub Error Analysis: ${data.status}`);
    console.error('Error:', error);
    console.log('Analysis:', analysis);
    console.log('Recommendations:', analysis.recommendations);
    console.groupEnd();
  }

  return analysis;
};

/**
 * 💻 Code Error Analyzer
 * Genel kod hatalarını analiz eder
 */
export const analyzeCodeError = (error: Error, data: CodeErrorData): ErrorAnalysis => {
  const analysis: ErrorAnalysis = {
    id: `code_${Date.now()}`,
    category: ErrorCategory.CODE,
    severity: getCodeErrorSeverity(error),
    message: error.message,
    stack: error.stack,
    context: {
      context: data.context,
      errorName: error.name,
      ...data.customData
    },
    timestamp: new Date(),
    sessionId: currentSessionId,
    recommendations: getCodeErrorRecommendations(error),
    relatedIssues: []
  };

  // Store in history
  errorHistory.push(analysis);

  // Log to Firebase Analytics
  if (analytics) {
    logEvent(analytics, 'error_analyzed', {
      error_category: analysis.category,
      error_severity: analysis.severity,
      error_code: error.name,
      session_id: currentSessionId
    });
  }

  // Console logging for development
  if (process.env.NODE_ENV === 'development') {
    console.group(`💻 Code Error Analysis: ${error.name}`);
    console.error('Error:', error);
    console.log('Analysis:', analysis);
    console.log('Recommendations:', analysis.recommendations);
    console.groupEnd();
  }

  return analysis;
};

/**
 * Firebase Error Severity Mapping
 */
const getFirebaseErrorSeverity = (code: string): ErrorSeverity => {
  const severityMap: Record<string, ErrorSeverity> = {
    'auth/api-key-not-valid': ErrorSeverity.CRITICAL,
    'auth/invalid-api-key': ErrorSeverity.CRITICAL,
    'auth/project-not-found': ErrorSeverity.CRITICAL,
    'auth/user-not-found': ErrorSeverity.HIGH,
    'auth/wrong-password': ErrorSeverity.HIGH,
    'auth/invalid-email': ErrorSeverity.HIGH,
    'auth/user-disabled': ErrorSeverity.HIGH,
    'auth/email-already-in-use': ErrorSeverity.MEDIUM,
    'auth/weak-password': ErrorSeverity.MEDIUM,
    'auth/network-request-failed': ErrorSeverity.MEDIUM,
    'permission-denied': ErrorSeverity.HIGH,
    'not-found': ErrorSeverity.MEDIUM,
    'already-exists': ErrorSeverity.MEDIUM,
    'resource-exhausted': ErrorSeverity.HIGH,
    'unauthenticated': ErrorSeverity.HIGH
  };

  return severityMap[code] || ErrorSeverity.MEDIUM;
};

/**
 * Firebase Error Recommendations
 */
const getFirebaseErrorRecommendations = (code: string): string[] => {
  const recommendationMap: Record<string, string[]> = {
    'auth/api-key-not-valid': [
      'Firebase Console\'dan doğru API key\'i kontrol edin',
      'Environment variables\'ları doğrulayın (.env.local)',
      'Firebase project ayarlarını kontrol edin',
      'API key\'in kısıtlamalarını kontrol edin'
    ],
    'auth/user-not-found': [
      'Kullanıcının kayıtlı olup olmadığını kontrol edin',
      'Email adresini doğrulayın',
      'Kayıt sayfasına yönlendirin',
      'Kullanıcı arama işlemini geliştirin'
    ],
    'auth/wrong-password': [
      'Şifre doğruluğunu kontrol edin',
      'Şifre sıfırlama özelliği sunun',
      'Caps Lock durumunu kontrol edin',
      'Şifre görünürlük toggle\'ı ekleyin'
    ],
    'auth/email-already-in-use': [
      'Giriş yapmaya yönlendirin',
      'Email adresinin zaten kullanıldığını belirtin',
      'Şifre sıfırlama seçeneği sunun',
      'Sosyal medya girişi alternatifi sunun'
    ],
    'permission-denied': [
      'Firestore security rules\'ları kontrol edin',
      'Kullanıcı authentication durumunu kontrol edin',
      'Gerekli izinleri doğrulayın',
      'Admin panelinden izinleri kontrol edin'
    ],
    'auth/network-request-failed': [
      'İnternet bağlantısını kontrol edin',
      'Firebase servis durumunu kontrol edin',
      'Retry mekanizması ekleyin',
      'Offline mode desteği ekleyin'
    ]
  };

  return recommendationMap[code] || [
    'Hata kodunu Firebase documentation\'dan araştırın',
    'Console\'daki detaylı hata mesajlarını kontrol edin',
    'Firebase support\'a başvurun',
    'Community forum\'larda benzer durumları araştırın'
  ];
};

/**
 * GitHub Error Severity Mapping
 */
const getGitHubErrorSeverity = (status: number): ErrorSeverity => {
  if (status >= 500) return ErrorSeverity.CRITICAL;
  if (status === 401 || status === 403) return ErrorSeverity.HIGH;
  if (status === 404) return ErrorSeverity.MEDIUM;
  if (status === 422) return ErrorSeverity.MEDIUM;
  if (status >= 400) return ErrorSeverity.HIGH;
  return ErrorSeverity.LOW;
};

/**
 * GitHub Error Recommendations
 */
const getGitHubErrorRecommendations = (status: number): string[] => {
  const recommendationMap: Record<number, string[]> = {
    401: [
      'GitHub Personal Access Token\'ı kontrol edin',
      'Token\'ın expire olup olmadığını kontrol edin',
      'Token permission\'larını doğrulayın',
      'GitHub Actions secrets\'ları kontrol edin'
    ],
    403: [
      'Rate limit\'e takılmış olabilirsiniz',
      'Repository access permission\'larını kontrol edin',
      'GitHub API quota\'nızı kontrol edin',
      'Organization permissions\'ları kontrol edin'
    ],
    404: [
      'Repository URL\'ini kontrol edin',
      'Branch name\'i doğrulayın',
      'File path\'inin doğru olduğunu kontrol edin',
      'Repository\'nin public/private durumunu kontrol edin'
    ],
    422: [
      'Request body\'sini kontrol edin',
      'Required field\'ları kontrol edin',
      'Data format\'ını doğrulayın',
      'API documentation\'ı kontrol edin'
    ],
    500: [
      'GitHub servis durumunu kontrol edin',
      'Bir süre sonra tekrar deneyin',
      'GitHub Status sayfasını kontrol edin',
      'Support\'a başvurun'
    ]
  };

  return recommendationMap[status] || [
    'HTTP status kodunu araştırın',
    'GitHub API documentation\'ı kontrol edin',
    'Network connectivity\'yi kontrol edin',
    'Request headers\'ları doğrulayın'
  ];
};

/**
 * Code Error Severity Mapping
 */
const getCodeErrorSeverity = (error: Error): ErrorSeverity => {
  const severityMap: Record<string, ErrorSeverity> = {
    'TypeError': ErrorSeverity.HIGH,
    'ReferenceError': ErrorSeverity.HIGH,
    'SyntaxError': ErrorSeverity.CRITICAL,
    'RangeError': ErrorSeverity.MEDIUM,
    'URIError': ErrorSeverity.MEDIUM,
    'EvalError': ErrorSeverity.HIGH
  };

  return severityMap[error.name] || ErrorSeverity.MEDIUM;
};

/**
 * Code Error Recommendations
 */
const getCodeErrorRecommendations = (error: Error): string[] => {
  const recommendationMap: Record<string, string[]> = {
    'TypeError': [
      'Variable tiplerini kontrol edin',
      'null/undefined kontrolü yapın',
      'Method existence kontrolü yapın',
      'TypeScript kullanarak tip güvenliği sağlayın'
    ],
         'ReferenceError': [
       'Variable declaration\'ini kontrol edin',
       'Import statements\'lari kontrol edin',
       'Scope\'lari kontrol edin',
       'Typo\'lari kontrol edin'
     ],
    'SyntaxError': [
      'Kod syntax\'ını kontrol edin',
      'Bracket/parenthesis eşleşmelerini kontrol edin',
      'Semicolon kullanımını kontrol edin',
      'Linter kullanarak kod kalitesini artırın'
    ],
    'RangeError': [
      'Array/string length\'lerini kontrol edin',
      'Numeric range\'leri kontrol edin',
      'Recursive function\'ları kontrol edin',
      'Memory usage\'ını optimize edin'
    ]
  };

  return recommendationMap[error.name] || [
    'Stack trace\'i detaylı inceleyin',
    'Error message\'ını araştırın',
    'Benzer hataları online araştırın',
    'Debug mode\'da adım adım kontrol edin'
  ];
};

/**
 * Error History Management
 */
export const getErrorHistory = (): ErrorAnalysis[] => {
  return [...errorHistory];
};

export const clearErrorHistory = (): void => {
  errorHistory.length = 0;
};

export const generateNewSession = (): string => {
  currentSessionId = generateSessionId();
  return currentSessionId;
};

export const getCurrentSessionId = (): string => {
  return currentSessionId;
};

/**
 * Error Pattern Analysis
 */
export const analyzeErrorPatterns = (): {
  mostCommonCategory: ErrorCategory;
  mostCommonSeverity: ErrorSeverity;
  totalErrors: number;
  sessionDuration: number;
} => {
  const categoryCount: Record<ErrorCategory, number> = {
    [ErrorCategory.FIREBASE]: 0,
    [ErrorCategory.GITHUB]: 0,
    [ErrorCategory.CODE]: 0,
    [ErrorCategory.NETWORK]: 0,
    [ErrorCategory.VALIDATION]: 0,
    [ErrorCategory.UI]: 0
  };

  const severityCount: Record<ErrorSeverity, number> = {
    [ErrorSeverity.LOW]: 0,
    [ErrorSeverity.MEDIUM]: 0,
    [ErrorSeverity.HIGH]: 0,
    [ErrorSeverity.CRITICAL]: 0
  };

  errorHistory.forEach(error => {
    categoryCount[error.category]++;
    severityCount[error.severity]++;
  });

  const mostCommonCategory = Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)[0][0] as ErrorCategory;

  const mostCommonSeverity = Object.entries(severityCount)
    .sort(([,a], [,b]) => b - a)[0][0] as ErrorSeverity;

  const firstError = errorHistory[0];
  const lastError = errorHistory[errorHistory.length - 1];
  const sessionDuration = firstError && lastError ? 
    (lastError.timestamp.getTime() - firstError.timestamp.getTime()) / 1000 : 0;

  return {
    mostCommonCategory,
    mostCommonSeverity,
    totalErrors: errorHistory.length,
    sessionDuration
  };
}; 