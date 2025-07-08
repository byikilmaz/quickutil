// External Email Service for QuickUtil.app
// Using Resend API via secure webhook endpoint

interface WelcomeEmailData {
  email: string;
  firstName: string;
  lastName: string;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  message?: string;
  error?: string;
}

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Send welcome email via external webhook (bypasses static hosting limitations)
export const sendWelcomeEmail = async (data: WelcomeEmailData): Promise<EmailResponse> => {
  try {
    console.log('📧 Sending welcome email via external webhook to:', data.email);

    // Validate input
    if (!data.email || !data.firstName || !data.lastName) {
      throw new Error('Email, firstName, and lastName are required');
    }

    if (!validateEmail(data.email)) {
      throw new Error('Invalid email format');
    }

    // Use external webhook service (examples: Zapier, Make.com, n8n.io)
    // This bypasses static hosting limitations
    const webhookUrl = process.env.NODE_ENV === 'production' 
      ? 'https://hook.eu1.make.com/YOUR_WEBHOOK_ID' // Replace with actual webhook
      : 'https://httpbin.org/post'; // Development endpoint for testing

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WEBHOOK_SECRET || 'demo-key'}`,
        'User-Agent': 'QuickUtil-EmailService/1.0',
      },
      body: JSON.stringify({
        service: 'quickutil-welcome-email',
        resend_api_key: 're_fNdBHrsG_8bfnA8nLxxdFRD7oo7VuFJ7t',
        from: 'QuickUtil Team <hello@quickutil.app>',
        to: data.email,
        subject: '🚀 QuickUtil.app\'e Hoş Geldiniz!',
        first_name: data.firstName,
        last_name: data.lastName,
        template: 'welcome',
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      messageId: result.id || result.message_id || 'webhook-sent',
      message: 'Welcome email sent via webhook service'
    };

  } catch (error) {
    console.error('❌ Welcome email webhook failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown webhook error'
    };
  }
};

// Health check for email service
export const checkEmailServiceHealth = async (): Promise<boolean> => {
  try {
    const testUrl = process.env.NODE_ENV === 'production' 
      ? 'https://hook.eu1.make.com/health' 
      : 'https://httpbin.org/get';
      
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'QuickUtil-HealthCheck/1.0',
      },
    });
    
    return response.ok;
  } catch {
    return false;
  }
};

// Named export for email service utilities
export const EmailService = {
  sendWelcomeEmail,
  validateEmail,
  checkEmailServiceHealth,
};

export default EmailService; 