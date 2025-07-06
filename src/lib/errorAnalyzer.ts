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
  context: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  recommendations: string[];
  relatedIssues: string[];
}

interface FirebaseErrorDetails {
  code: string;
  customData?: Record<string, any>;
  serverResponse?: any;
}

interface GitHubErrorDetails {
  status: number;
  response?: any;
  endpoint?: string;
  method?: string;
}

class ErrorAnalyzer {
  private sessionId: string;
  private errors: ErrorAnalysis[] = [];
  
  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeErrorTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  private initializeErrorTracking() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.analyzeError(event.error, {
        type: 'unhandled_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.analyzeError(event.reason, {
        type: 'unhandled_promise_rejection'
      });
    });
  }

  /**
   * 🔥 Firebase Error Analysis
   */
  analyzeFirebaseError(error: any, context: FirebaseErrorDetails): ErrorAnalysis {
    const analysis: ErrorAnalysis = {
      id: `firebase_${Date.now()}`,
      category: ErrorCategory.FIREBASE,
      severity: this.getFirebaseSeverity(error.code),
      message: error.message,
      stack: error.stack,
      context: { ...context, firebaseCode: error.code },
      timestamp: new Date(),
      sessionId: this.sessionId,
      recommendations: this.getFirebaseRecommendations(error.code),
      relatedIssues: this.getFirebaseRelatedIssues(error.code)
    };

    this.logError(analysis);
    return analysis;
  }

  private getFirebaseSeverity(code: string): ErrorSeverity {
    const criticalCodes = ['auth/api-key-not-valid', 'permission-denied', 'unauthenticated'];
    const highCodes = ['auth/user-not-found', 'auth/wrong-password', 'resource-exhausted'];
    const mediumCodes = ['auth/too-many-requests', 'already-exists', 'deadline-exceeded'];

    if (criticalCodes.includes(code)) return ErrorSeverity.CRITICAL;
    if (highCodes.includes(code)) return ErrorSeverity.HIGH;
    if (mediumCodes.includes(code)) return ErrorSeverity.MEDIUM;
    return ErrorSeverity.LOW;
  }

  private getFirebaseRecommendations(code: string): string[] {
    const recommendations: Record<string, string[]> = {
      'auth/api-key-not-valid': [
        'Firebase Console\'dan doğru API key\'i kontrol edin',
        'Environment variables\'ları doğrulayın',
        'Firebase project ayarlarını kontrol edin'
      ],
      'auth/user-not-found': [
        'Kullanıcının kayıtlı olup olmadığını kontrol edin',
        'Email adresini doğrulayın',
        'Kayıt sayfasına yönlendirin'
      ],
      'permission-denied': [
        'Firestore security rules\'ları kontrol edin',
        'Kullanıcı authentication durumunu kontrol edin',
        'Gerekli izinleri doğrulayın'
      ],
      'resource-exhausted': [
        'Firebase quota limitlerini kontrol edin',
        'Rate limiting uygulayın',
        'Query optimizasyonu yapın'
      ]
    };

    return recommendations[code] || ['Firebase documentation\'ı kontrol edin'];
  }

  private getFirebaseRelatedIssues(code: string): string[] {
    // Bu gerçek projede GitHub Issues API ile entegre edilebilir
    return [`firebase-error-${code}`, 'firebase-config-issue'];
  }

  /**
   * 🐙 GitHub Error Analysis
   */
  analyzeGitHubError(error: any, context: GitHubErrorDetails): ErrorAnalysis {
    const analysis: ErrorAnalysis = {
      id: `github_${Date.now()}`,
      category: ErrorCategory.GITHUB,
      severity: this.getGitHubSeverity(context.status),
      message: error.message,
      stack: error.stack,
      context: { ...context, githubStatus: context.status },
      timestamp: new Date(),
      sessionId: this.sessionId,
      recommendations: this.getGitHubRecommendations(context.status),
      relatedIssues: this.getGitHubRelatedIssues(context.status)
    };

    this.logError(analysis);
    return analysis;
  }

  private getGitHubSeverity(status: number): ErrorSeverity {
    if (status >= 500) return ErrorSeverity.CRITICAL;
    if (status === 403 || status === 401) return ErrorSeverity.HIGH;
    if (status >= 400) return ErrorSeverity.MEDIUM;
    return ErrorSeverity.LOW;
  }

  private getGitHubRecommendations(status: number): string[] {
    const recommendations: Record<number, string[]> = {
      401: [
        'GitHub Personal Access Token\'ı kontrol edin',
        'Token permission\'larını doğrulayın',
        'Token süresinin dolup dolmadığını kontrol edin'
      ],
      403: [
        'Rate limit\'e takılmış olabilirsiniz',
        'Repository access permission\'larını kontrol edin',
        'GitHub API quota\'nızı kontrol edin'
      ],
      404: [
        'Repository URL\'ini kontrol edin',
        'Branch name\'i doğrulayın',
        'File path\'inin doğru olduğunu kontrol edin'
      ],
      500: [
        'GitHub server\'ında geçici sorun olabilir',
        'Birkaç dakika sonra tekrar deneyin',
        'GitHub Status sayfasını kontrol edin'
      ]
    };

    return recommendations[status] || ['GitHub API documentation\'ı kontrol edin'];
  }

  private getGitHubRelatedIssues(status: number): string[] {
    return [`github-error-${status}`, 'api-integration-issue'];
  }

  /**
   * 💻 Code Error Analysis
   */
  analyzeCodeError(error: Error, context: Record<string, any> = {}): ErrorAnalysis {
    const analysis: ErrorAnalysis = {
      id: `code_${Date.now()}`,
      category: ErrorCategory.CODE,
      severity: this.getCodeSeverity(error),
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date(),
      sessionId: this.sessionId,
      recommendations: this.getCodeRecommendations(error),
      relatedIssues: this.getCodeRelatedIssues(error)
    };

    this.logError(analysis);
    return analysis;
  }

  private getCodeSeverity(error: Error): ErrorSeverity {
    const criticalPatterns = [
      /ReferenceError/,
      /TypeError.*null/,
      /Cannot read property.*undefined/
    ];
    
    const highPatterns = [
      /SyntaxError/,
      /RangeError/,
      /TypeError/
    ];

    const message = error.message + (error.stack || '');
    
    if (criticalPatterns.some(pattern => pattern.test(message))) {
      return ErrorSeverity.CRITICAL;
    }
    if (highPatterns.some(pattern => pattern.test(message))) {
      return ErrorSeverity.HIGH;
    }
    return ErrorSeverity.MEDIUM;
  }

  private getCodeRecommendations(error: Error): string[] {
    const message = error.message.toLowerCase();
    
    if (message.includes('null') || message.includes('undefined')) {
      return [
        'Null/undefined kontrolü ekleyin',
        'Optional chaining (?.) kullanın',
        'Default değerler atayın'
      ];
    }
    
    if (message.includes('not a function')) {
      return [
        'Fonksiyon tanımını kontrol edin',
        'Import/export ifadelerini kontrol edin',
        'TypeScript tip kontrollerini kullanın'
      ];
    }
    
    return [
      'Error stack trace\'i detaylı inceleyin',
      'Browser console\'u kontrol edin',
      'Kodun son değişikliklerini gözden geçirin'
    ];
  }

  private getCodeRelatedIssues(error: Error): string[] {
    return [`code-error-${error.name.toLowerCase()}`, 'bug-fix-needed'];
  }

  /**
   * 📊 General Error Analysis
   */
  analyzeError(error: any, context: Record<string, any> = {}): ErrorAnalysis {
    // Firebase error detection
    if (error?.code && error.code.startsWith('auth/')) {
      return this.analyzeFirebaseError(error, context as FirebaseErrorDetails);
    }
    
    // GitHub error detection (HTTP status)
    if (context.status && typeof context.status === 'number') {
      return this.analyzeGitHubError(error, context as GitHubErrorDetails);
    }
    
    // General code error
    return this.analyzeCodeError(error, context);
  }

  /**
   * 📝 Error Logging & Analytics
   */
  private logError(analysis: ErrorAnalysis) {
    this.errors.push(analysis);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔍 Error Analysis - ${analysis.category.toUpperCase()}`);
      console.error('Error:', analysis.message);
      console.log('Severity:', analysis.severity);
      console.log('Context:', analysis.context);
      console.log('Recommendations:', analysis.recommendations);
      console.groupEnd();
    }
    
    // Send to Firebase Analytics
    if (analytics) {
      logEvent(analytics, 'error_analyzed', {
        error_category: analysis.category,
        error_severity: analysis.severity,
        error_id: analysis.id,
        session_id: analysis.sessionId
      });
    }
    
    // Send critical errors to monitoring service
    if (analysis.severity === ErrorSeverity.CRITICAL) {
      this.sendToMonitoring(analysis);
    }
  }

  private sendToMonitoring(analysis: ErrorAnalysis) {
    // Integration with external monitoring services
    // Örnek: Sentry, LogRocket, Datadog
    console.warn('🚨 Critical Error Detected:', analysis);
  }

  /**
   * 📈 Error Reporting & Dashboard
   */
  getErrorSummary(): {
    totalErrors: number;
    errorsByCategory: Record<ErrorCategory, number>;
    errorsBySeverity: Record<ErrorSeverity, number>;
    recentErrors: ErrorAnalysis[];
  } {
    const errorsByCategory = Object.values(ErrorCategory).reduce((acc, category) => {
      acc[category] = this.errors.filter(e => e.category === category).length;
      return acc;
    }, {} as Record<ErrorCategory, number>);

    const errorsBySeverity = Object.values(ErrorSeverity).reduce((acc, severity) => {
      acc[severity] = this.errors.filter(e => e.severity === severity).length;
      return acc;
    }, {} as Record<ErrorSeverity, number>);

    return {
      totalErrors: this.errors.length,
      errorsByCategory,
      errorsBySeverity,
      recentErrors: this.errors.slice(-10).reverse()
    };
  }

  getErrorsByTimeRange(hours: number = 24): ErrorAnalysis[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.errors.filter(error => error.timestamp > cutoff);
  }

  /**
   * 🔧 MCP Integration Methods
   */
  async analyzeWithMCP(errorType: 'firebase' | 'github' | 'code'): Promise<string[]> {
    // Bu method'lar Firebase MCP Server veya GitHub MCP Server ile entegre edilebilir
    
    switch (errorType) {
      case 'firebase':
        return await this.analyzeFirebaseWithMCP();
      case 'github':
        return await this.analyzeGitHubWithMCP();
      case 'code':
        return await this.analyzeCodeWithMCP();
      default:
        return ['No specific analysis available'];
    }
  }

  private async analyzeFirebaseWithMCP(): Promise<string[]> {
    // Firebase MCP Server integration
    // npx firebase-tools@latest experimental:mcp
    return [
      'Firebase MCP Server ile analiz yapılabilir',
      'Firestore rules validation',
      'Authentication flow analysis',
      'Cloud Functions debugging'
    ];
  }

  private async analyzeGitHubWithMCP(): Promise<string[]> {
    // GitHub MCP Server integration
    return [
      'GitHub MCP Server ile repository analizi',
      'Actions workflow debugging',
      'Issue tracking ve bug reports',
      'Security vulnerability scanning'
    ];
  }

  private async analyzeCodeWithMCP(): Promise<string[]> {
    // Code analysis with external MCP servers
    return [
      'MCPScan.ai ile güvenlik analizi',
      'Code quality metrics',
      'Performance bottleneck detection',
      'Best practices recommendations'
    ];
  }
}

// Singleton instance
export const errorAnalyzer = new ErrorAnalyzer();

// Convenience functions
export const analyzeFirebaseError = (error: any, context: FirebaseErrorDetails) => 
  errorAnalyzer.analyzeFirebaseError(error, context);

export const analyzeGitHubError = (error: any, context: GitHubErrorDetails) => 
  errorAnalyzer.analyzeGitHubError(error, context);

export const analyzeCodeError = (error: Error, context?: Record<string, any>) => 
  errorAnalyzer.analyzeCodeError(error, context);

export const getErrorSummary = () => errorAnalyzer.getErrorSummary();

export default errorAnalyzer; 