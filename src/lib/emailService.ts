// QuickUtil.app Email Service with Resend API Integration
import { Resend } from 'resend';

export interface EmailTemplate {
  id: string;
  subject: string;
  htmlTemplate: string;
  textTemplate: string;
}

export interface EmailData {
  to: string;
  from?: string;
  subject: string;
  html: string;
  text: string;
  tags?: { name: string; value: string }[];
}

export interface UserEmailData {
  firstName: string;
  lastName: string;
  email: string;
}

export class EmailService {
  private static readonly FROM_EMAIL = 'QuickUtil Team <hello@quickutil.app>';
  private static readonly RESEND_API_KEY = process.env.RESEND_API_KEY;
  private static resend: Resend | null = null;

  // Initialize Resend instance
  private static getResendInstance(): Resend | null {
    if (!this.resend) {
      if (!this.RESEND_API_KEY) {
        console.error('❌ RESEND_API_KEY environment variable not set');
        console.log('📝 To fix this:');
        console.log('1. Get API key from https://resend.com/api-keys');
        console.log('2. Add to .env.local: RESEND_API_KEY=re_your_key_here');
        console.log('3. Add to Vercel environment variables');
        console.log('4. Setup domain authentication for quickutil.app');
        return null;
      }
      
      try {
        this.resend = new Resend(this.RESEND_API_KEY);
        console.log('✅ Resend API initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize Resend:', error);
        return null;
      }
    }
    return this.resend;
  }

  // Modern QuickUtil Email Template Base
  private static getBaseTemplate(content: string, title: string): string {
    return `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .email-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            padding: 32px;
            text-align: center;
        }
        .logo {
            width: 48px;
            height: 48px;
            background: rgba(255,255,255,0.2);
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
        }
        .logo-text {
            color: white;
            font-size: 20px;
            font-weight: bold;
        }
        .brand-name {
            color: white;
            font-size: 28px;
            font-weight: bold;
            margin: 8px 0;
        }
        .content {
            padding: 40px 32px;
        }
        .title {
            color: #1f2937;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 16px;
            text-align: center;
        }
        .message {
            color: #4b5563;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 32px;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            color: white !important;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            text-align: center;
            margin: 16px 0;
        }
        .feature-list {
            background: #f8fafc;
            border-radius: 8px;
            padding: 24px;
            margin: 24px 0;
        }
        .feature-item {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            color: #374151;
        }
        .feature-icon {
            color: #10b981;
            margin-right: 12px;
            font-size: 18px;
        }
        .footer {
            background: #f9fafb;
            padding: 24px 32px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer-text {
            color: #6b7280;
            font-size: 14px;
            margin: 8px 0;
        }
        .social-links {
            margin: 16px 0;
        }
        .social-link {
            display: inline-block;
            margin: 0 8px;
            color: #6b7280;
            text-decoration: none;
        }
        .highlight-box {
            background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
            border: 1px solid #86efac;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .highlight-title {
            color: #15803d;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        .highlight-text {
            color: #166534;
            font-size: 14px;
        }
        @media (max-width: 600px) {
            .container { padding: 20px 10px; }
            .content { padding: 24px 20px; }
            .header { padding: 24px 20px; }
            .brand-name { font-size: 24px; }
            .title { font-size: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-card">
            <div class="header">
                <div class="logo">
                    <span class="logo-text">Q</span>
                </div>
                <div class="brand-name">QuickUtil</div>
                <div style="color: rgba(255,255,255,0.9); font-size: 16px;">Profesyonel Dosya İşleme Platformu</div>
            </div>
            
            <div class="content">
                ${content}
            </div>
            
            <div class="footer">
                <div class="footer-text">© 2025 QuickUtil.app - Tüm hakları saklıdır</div>
                <div class="footer-text">
                    Bu email'i aldığınız için <strong>hello@quickutil.app</strong> adresine kayıtlısınız.
                </div>
                <div class="footer-text">
                    <a href="https://quickutil.app" style="color: #3b82f6;">quickutil.app</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  // Welcome Email Template
  static getWelcomeTemplate(userData: UserEmailData): EmailTemplate {
    const content = `
        <div class="title">🎉 Hoş Geldiniz ${userData.firstName}!</div>
        <div class="message">
            QuickUtil.app'e katıldığınız için teşekkür ederiz! Artık profesyonel dosya işleme araçlarımızı kullanmaya başlayabilirsiniz.
        </div>
        
        <div class="feature-list">
            <div class="feature-item">
                <span class="feature-icon">📄</span>
                <span>PDF sıkıştırma ve dönüştürme</span>
            </div>
            <div class="feature-item">
                <span class="feature-icon">🖼️</span>
                <span>Görsel işleme ve optimizasyon</span>
            </div>
            <div class="feature-item">
                <span class="feature-icon">⚡</span>
                <span>Toplu dosya işleme</span>
            </div>
            <div class="feature-item">
                <span class="feature-icon">☁️</span>
                <span>Güvenli Firebase depolama</span>
            </div>
        </div>
        
        <div style="text-align: center;">
            <a href="https://quickutil.app" class="button">🚀 Hemen Başlayın</a>
        </div>
        
        <div class="message" style="margin-top: 32px;">
            Herhangi bir sorunuz varsa, <a href="mailto:hello@quickutil.app" style="color: #3b82f6;">hello@quickutil.app</a> adresinden bize ulaşabilirsiniz.
        </div>`;

    return {
      id: 'welcome',
      subject: `🎉 QuickUtil'e Hoş Geldiniz ${userData.firstName}!`,
      htmlTemplate: this.getBaseTemplate(content, 'Hoş Geldiniz'),
      textTemplate: `Hoş Geldiniz ${userData.firstName}!\n\nQuickUtil.app'e katıldığınız için teşekkür ederiz! Profesyonel dosya işleme araçlarımızı kullanmaya başlayın.\n\nhttps://quickutil.app`
    };
  }

  // Send Email Function
  static async sendEmail(emailData: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const resend = this.getResendInstance();
      
      if (!resend) {
        console.error('Resend API key not configured');
        return { 
          success: false, 
          error: 'Email service not configured. Please set RESEND_API_KEY environment variable.' 
        };
      }

      console.log('Sending email with Resend API:', {
        to: emailData.to,
        from: emailData.from || this.FROM_EMAIL,
        subject: emailData.subject,
        tags: emailData.tags
      });

      // Gerçek Resend API çağrısı
      const response = await resend.emails.send({
        from: emailData.from || this.FROM_EMAIL,
        to: [emailData.to],
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        tags: emailData.tags
      });

      if (response.data) {
        console.log('Email sent successfully:', response.data.id);
        return { success: true, messageId: response.data.id };
      } else if (response.error) {
        console.error('Resend API error:', response.error);
        return { success: false, error: response.error.message };
      } else {
        return { success: false, error: 'Unknown error occurred' };
      }

    } catch (error) {
      console.error('Email sending error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Helper function to send templated emails
  static async sendTemplatedEmail(
    template: EmailTemplate, 
    userData: UserEmailData,
    additionalTags?: { name: string; value: string }[]
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const emailData: EmailData = {
      to: userData.email,
      subject: template.subject,
      html: template.htmlTemplate,
      text: template.textTemplate,
      tags: [
        { name: 'template', value: template.id },
        { name: 'user_email', value: userData.email },
        ...(additionalTags || [])
      ]
    };

    return await this.sendEmail(emailData);
  }

  // Test Email Function - Development only
  static async testEmailConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const resend = this.getResendInstance();
      
      if (!resend) {
        return { 
          success: false, 
          message: 'Resend API key not configured. Please set RESEND_API_KEY environment variable.' 
        };
      }

      // Test email gönderimi
      const testResult = await this.sendEmail({
        to: 'hello@quickutil.app',
        subject: '🧪 QuickUtil Email Test',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>✅ Email Connection Test Successful!</h2>
            <p>This is a test email to verify Resend integration.</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              This email was sent from QuickUtil.app email service.
            </p>
          </div>
        `,
        text: 'Email Connection Test Successful! Timestamp: ' + new Date().toISOString(),
        tags: [{ name: 'category', value: 'test' }]
      });

      if (testResult.success) {
        return { 
          success: true, 
          message: `✅ Email connection successful! Message ID: ${testResult.messageId}` 
        };
      } else {
        return { 
          success: false, 
          message: `❌ Email test failed: ${testResult.error}` 
        };
      }

    } catch (error) {
      console.error('Email test error:', error);
      return { 
        success: false, 
        message: `❌ Email test error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}

// Email Event Handlers for Integration
export class EmailEvents {
  static async onUserRegistered(userData: UserEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.log('📧 Sending welcome email to:', userData.email);
    
    const welcomeTemplate = EmailService.getWelcomeTemplate(userData);
    const result = await EmailService.sendTemplatedEmail(welcomeTemplate, userData, [
      { name: 'category', value: 'welcome' }
    ]);
    
    if (result.success) {
      console.log('✅ Welcome email sent successfully:', result.messageId);
    } else {
      console.error('❌ Welcome email failed:', result.error);
    }
    
    return result;
  }
} 