"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEmail = void 0;
const functions = require("firebase-functions");
const resend_1 = require("resend");
const admin = require("firebase-admin");
// Initialize Firebase Admin
admin.initializeApp();
// Resend configuration
const RESEND_API_KEY = 're_fNdBHrsG_8bfnA8nLxxdFRD7oo7VuFJ7t';
const resend = new resend_1.Resend(RESEND_API_KEY);
// Modern hoşgeldin email template
const generateWelcomeEmailHTML = (firstName, lastName) => {
    const fullName = `${firstName} ${lastName}`.trim();
    return `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QuickUtil.app'e Hoş Geldiniz!</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        .content {
            padding: 40px 30px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin: 30px 0;
        }
        .stat-card {
            background: #F8FAFC;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            border: 1px solid #E2E8F0;
        }
        .cta-button {
            background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
            color: white !important;
            padding: 16px 32px;
            border-radius: 12px;
            text-decoration: none;
            display: inline-block;
            font-weight: 600;
            margin: 20px 0;
            transition: transform 0.3s ease;
        }
        .feature-list {
            list-style: none;
            padding: 0;
        }
        .feature-list li {
            padding: 8px 0;
            position: relative;
            padding-left: 30px;
        }
        .feature-list li::before {
            content: '✅';
            position: absolute;
            left: 0;
            top: 8px;
        }
        .footer {
            background: #F8FAFC;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #E2E8F0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">
                🚀 QuickUtil.app'e Hoş Geldiniz!
            </h1>
            <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.9;">
                Merhaba ${fullName}!
            </p>
        </div>
        
        <div class="content">
            <h2 style="color: #1F2937; margin-bottom: 20px;">PDF ve Resim İşleme Platformuna Katıldınız! 🎉</h2>
            
            <p style="color: #4B5563; line-height: 1.6; font-size: 16px;">
                QuickUtil.app, PDF ve resim dosyalarınızı kolayca işleyebileceğiniz modern bir platform. 
                Hiçbir ücret ödemeden güçlü araçlarımızı kullanmaya başlayın!
            </p>

            <div class="stats-grid">
                <div class="stat-card">
                    <div style="font-size: 24px; font-weight: 700; color: #3B82F6;">10+</div>
                    <div style="color: #6B7280; font-size: 14px;">Güçlü Araç</div>
                </div>
                <div class="stat-card">
                    <div style="font-size: 24px; font-weight: 700; color: #8B5CF6;">5GB</div>
                    <div style="color: #6B7280; font-size: 14px;">Ücretsiz Depolama</div>
                </div>
                <div class="stat-card">
                    <div style="font-size: 24px; font-weight: 700; color: #10B981;">%100</div>
                    <div style="color: #6B7280; font-size: 14px;">Ücretsiz Kullanım</div>
                </div>
            </div>

            <h3 style="color: #1F2937; margin-top: 30px;">🛠️ Neler Yapabilirsiniz?</h3>
            <ul class="feature-list">
                <li><strong>PDF Sıkıştırma:</strong> Dosya boyutunu düşürün</li>
                <li><strong>PDF Dönüştürme:</strong> Sayfalara ayırın veya birleştirin</li>
                <li><strong>Resim Düzenleme:</strong> Boyutlandır, döndür, filtrele</li>
                <li><strong>Format Dönüştürme:</strong> JPG, PNG, PDF arası geçiş</li>
                <li><strong>Toplu İşleme:</strong> Birden çok dosyayı aynı anda işleyin</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
                <a href="https://quickutil.app" class="cta-button">
                    🚀 Hemen Başlayın
                </a>
            </div>

            <p style="color: #6B7280; font-size: 14px; line-height: 1.5;">
                <strong>💡 İpucu:</strong> Profil sayfanızdan dosyalarınızı yönetebilir, 
                işlem geçmişinizi görüntüleyebilir ve platform özelliklerini keşfedebilirsiniz.
            </p>
        </div>

        <div class="footer">
            <p style="color: #6B7280; font-size: 14px; margin-bottom: 15px;">
                Sorularınız için: <a href="mailto:hello@quickutil.app" style="color: #3B82F6;">hello@quickutil.app</a>
            </p>
            <div style="margin: 15px 0;">
                <a href="https://quickutil.app" style="color: #3B82F6; text-decoration: none; margin: 0 10px;">Ana Sayfa</a>
                <a href="https://quickutil.app/profile" style="color: #3B82F6; text-decoration: none; margin: 0 10px;">Profil</a>
                <a href="https://quickutil.app/gizlilik-sozlesmesi" style="color: #3B82F6; text-decoration: none; margin: 0 10px;">Gizlilik</a>
            </div>
            <p style="color: #9CA3AF; font-size: 12px; margin-top: 20px;">
                Bu email QuickUtil.app'e kaydolduğunuz için gönderilmiştir.
            </p>
        </div>
    </div>
</body>
</html>`;
};
// Text version of the email
const generateWelcomeEmailText = (firstName, lastName) => {
    const fullName = `${firstName} ${lastName}`.trim();
    return `
QuickUtil.app'e Hoş Geldiniz!

Merhaba ${fullName}!

PDF ve Resim İşleme Platformuna Katıldınız! 🎉

QuickUtil.app, PDF ve resim dosyalarınızı kolayca işleyebileceğiniz modern bir platform. 
Hiçbir ücret ödemeden güçlü araçlarımızı kullanmaya başlayın!

Platform İstatistikleri:
• 10+ Güçlü Araç
• 5GB Ücretsiz Depolama  
• %100 Ücretsiz Kullanım

Neler Yapabilirsiniz?
✅ PDF Sıkıştırma: Dosya boyutunu düşürün
✅ PDF Dönüştürme: Sayfalara ayırın veya birleştirin
✅ Resim Düzenleme: Boyutlandır, döndür, filtrele
✅ Format Dönüştürme: JPG, PNG, PDF arası geçiş
✅ Toplu İşleme: Birden çok dosyayı aynı anda işleyin

Hemen başlamak için: https://quickutil.app

💡 İpucu: Profil sayfanızdan dosyalarınızı yönetebilir, işlem geçmişinizi görüntüleyebilir ve platform özelliklerini keşfedebilirsiniz.

Sorularınız için: hello@quickutil.app

Ana Sayfa: https://quickutil.app
Profil: https://quickutil.app/profile
Gizlilik: https://quickutil.app/gizlilik-sozlesmesi

Bu email QuickUtil.app'e kaydolduğunuz için gönderilmiştir.
`;
};
// Email validation
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
// Firebase Function for sending welcome email
exports.sendWelcomeEmail = functions.https.onCall(async (data, context) => {
    var _a, _b;
    try {
        // Validate input
        const { email, firstName, lastName } = data;
        if (!email || !firstName || !lastName) {
            throw new functions.https.HttpsError('invalid-argument', 'Email, firstName, and lastName are required');
        }
        if (!validateEmail(email)) {
            throw new functions.https.HttpsError('invalid-argument', 'Invalid email format');
        }
        // Generate email content
        const htmlContent = generateWelcomeEmailHTML(firstName, lastName);
        const textContent = generateWelcomeEmailText(firstName, lastName);
        // Send email via Resend
        const result = await resend.emails.send({
            from: 'QuickUtil Team <hello@quickutil.app>',
            to: [email],
            subject: '🚀 QuickUtil.app\'e Hoş Geldiniz!',
            html: htmlContent,
            text: textContent,
            tags: [
                { name: 'category', value: 'welcome_email' },
                { name: 'user_type', value: 'new_registration' }
            ]
        });
        console.log('✅ Welcome email sent successfully:', (_a = result.data) === null || _a === void 0 ? void 0 : _a.id);
        return {
            success: true,
            messageId: (_b = result.data) === null || _b === void 0 ? void 0 : _b.id,
            message: 'Welcome email sent successfully'
        };
    }
    catch (error) {
        console.error('❌ Welcome email failed:', error);
        // Return detailed error for debugging
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to send welcome email', { originalError: error instanceof Error ? error.message : 'Unknown error' });
    }
});
//# sourceMappingURL=index.js.map