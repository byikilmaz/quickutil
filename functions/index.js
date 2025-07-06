/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest, onCall} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { Resend } = require('resend');

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// Resend API key from environment variable
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_YgufSHZ3_BBdMFAdaBPwWUFvtLcZk7KLk';

// Initialize Resend client
const resend = new Resend(RESEND_API_KEY);

// Callable function to send verification email
exports.sendVerificationEmail = onCall(async (request) => {
  const { data, auth } = request;
  
  // Verify that the user is authenticated
  if (!auth) {
    throw new Error('User must be authenticated to send verification email');
  }

  const { email, firstName, lastName, verificationLink } = data;

  // Validate required fields
  if (!email || !firstName || !lastName || !verificationLink) {
    throw new Error('Missing required fields: email, firstName, lastName, verificationLink');
  }

  // Professional email template with QuickUtil branding
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="utf-8">
      <title>Hesap Doğrulama - QuickUtil</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; padding: 20px !important; }
          .header { padding: 30px 20px !important; }
          .content { padding: 30px 20px !important; }
          .button { padding: 14px 28px !important; font-size: 15px !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; background-color: #f8fafc;">
      <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div class="header" style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <div style="background-color: #ffffff; width: 64px; height: 64px; border-radius: 16px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 25px -5px rgba(255, 255, 255, 0.3);">
            <span style="font-size: 28px; font-weight: 800; color: #3b82f6; letter-spacing: -0.5px;">Q</span>
          </div>
          <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">Hoş Geldiniz!</h1>
          <p style="color: #e2e8f0; margin: 0; font-size: 18px; font-weight: 500;">QuickUtil ailesine katıldığınız için teşekkürler</p>
        </div>
        
        <!-- Main Content -->
        <div class="content" style="padding: 48px 40px;">
          <h2 style="color: #1e293b; margin: 0 0 24px 0; font-size: 24px; font-weight: 700;">Merhaba ${firstName} ${lastName}! 👋</h2>
          
          <p style="color: #475569; font-size: 16px; margin: 0 0 24px 0; line-height: 1.7;">
            QuickUtil hesabınızı oluşturduğunuz için çok teşekkür ederiz! Hesabınızı aktif hale getirmek ve 
            tüm özelliklere erişebilmek için email adresinizi doğrulamanız gerekiyor.
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${verificationLink}" 
               class="button"
               style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
                      color: #ffffff; 
                      padding: 16px 32px; 
                      text-decoration: none; 
                      border-radius: 12px; 
                      font-weight: 600; 
                      font-size: 16px;
                      display: inline-block;
                      box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
                      transition: all 0.2s ease;">
              ✨ Hesabımı Doğrula
            </a>
          </div>
          
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 20px; margin: 32px 0; border-radius: 8px;">
            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
              <strong>🔒 Güvenlik Uyarısı:</strong> Bu doğrulama bağlantısı 24 saat içinde geçerliliğini yitirecektir. 
              Eğer bu email'i siz talep etmediyseniz güvenle silebilirsiniz.
            </p>
          </div>
          
          <div style="margin: 32px 0;">
            <h3 style="color: #1e293b; font-size: 20px; margin: 0 0 20px 0; font-weight: 700;">🚀 QuickUtil ile neler yapabilirsiniz?</h3>
            <div style="display: grid; gap: 12px;">
              <div style="display: flex; align-items: center; padding: 12px; background-color: #f8fafc; border-radius: 8px;">
                <span style="color: #3b82f6; font-size: 20px; margin-right: 12px;">📄</span>
                <span style="color: #475569; font-size: 15px;">PDF dosyalarınızı kaliteden ödün vermeden sıkıştırın</span>
              </div>
              <div style="display: flex; align-items: center; padding: 12px; background-color: #f8fafc; border-radius: 8px;">
                <span style="color: #10b981; font-size: 20px; margin-right: 12px;">🔄</span>
                <span style="color: #475569; font-size: 15px;">PDF'leri farklı formatlara kolayca dönüştürün</span>
              </div>
              <div style="display: flex; align-items: center; padding: 12px; background-color: #f8fafc; border-radius: 8px;">
                <span style="color: #8b5cf6; font-size: 20px; margin-right: 12px;">🖼️</span>
                <span style="color: #475569; font-size: 15px;">Resimleri optimize edin ve format değiştirin</span>
              </div>
              <div style="display: flex; align-items: center; padding: 12px; background-color: #f8fafc; border-radius: 8px;">
                <span style="color: #f59e0b; font-size: 20px; margin-right: 12px;">⚡</span>
                <span style="color: #475569; font-size: 15px;">Tüm işlemler browser'da, hızlı ve güvenli</span>
              </div>
            </div>
          </div>
          
          <div style="margin: 32px 0; padding: 20px; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 12px; text-align: center;">
            <p style="margin: 0; color: #1e40af; font-size: 15px; font-weight: 600;">
              🎉 Hesabınız doğrulandıktan sonra hemen kullanmaya başlayabilirsiniz!
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 32px 40px; border-top: 1px solid #e2e8f0; text-align: center; border-radius: 0 0 8px 8px;">
          <div style="margin-bottom: 16px;">
            <span style="color: #3b82f6; font-size: 24px; font-weight: 800;">QuickUtil</span>
          </div>
          <p style="color: #64748b; font-size: 14px; margin: 0 0 12px 0; font-weight: 500;">
            Bu email <strong>QuickUtil.app</strong> tarafından gönderilmiştir.
          </p>
          <p style="color: #94a3b8; font-size: 13px; margin: 0; line-height: 1.5;">
            Sorularınız için: <a href="mailto:support@quickutil.app" style="color: #3b82f6; text-decoration: none; font-weight: 500;">support@quickutil.app</a>
            <br>
            <span style="margin-top: 8px; display: inline-block;">© 2024 QuickUtil. Tüm hakları saklıdır.</span>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Text version for email clients that don't support HTML
  const textVersion = `
Merhaba ${firstName} ${lastName}!

QuickUtil hesabınızı oluşturduğunuz için teşekkür ederiz!

Hesabınızı aktif hale getirmek için aşağıdaki bağlantıya tıklayın:
${verificationLink}

🔒 Bu bağlantı 24 saat içinde geçerliliğini yitirecektir.

🚀 QuickUtil ile neler yapabilirsiniz?
• PDF dosyalarınızı sıkıştırın
• PDF'leri farklı formatlara dönüştürün  
• Resimleri optimize edin
• Dosya formatları arasında dönüştürme yapın

Sorularınız için: support@quickutil.app

QuickUtil Team
https://quickutil.app
  `;

  try {
    const result = await resend.emails.send({
      from: 'QuickUtil Team <noreply@quickutil.app>',
      to: [email],
      subject: '✨ QuickUtil Hesabınızı Doğrulayın',
      html: htmlTemplate,
      text: textVersion,
      headers: {
        'X-Entity-Ref-ID': auth.uid,
      },
      tags: [
        {
          name: 'category',
          value: 'email_verification'
        }
      ]
    });

    logger.info(`Verification email sent successfully to ${email}`, { 
      emailId: result.data?.id,
      userId: auth.uid 
    });
    
    return { 
      success: true, 
      message: 'Doğrulama emaili başarıyla gönderildi',
      emailId: result.data?.id,
      emailSent: true
    };
    
  } catch (error) {
    logger.error('Resend email error:', {
      error: error.message,
      userId: auth.uid,
      email: email
    });
    
    // Return user-friendly error
    return { 
      success: false, 
      message: 'Email gönderilirken hata oluştu', 
      error: error.message,
      emailSent: false
    };
  }
});

// Health check function
exports.healthCheck = onRequest((request, response) => {
  logger.info("Health check called");
  response.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'QuickUtil Email Service'
  });
});

// Welcome message function  
exports.helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from QuickUtil Firebase Functions! 🚀");
});
