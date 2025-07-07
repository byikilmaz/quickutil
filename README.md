# QuickUtil.app - Profesyonel Dosya İşleme Platformu

🚀 **Canlı URL**: [https://quickutil.app](https://quickutil.app)

## 📋 Proje Özeti

QuickUtil.app, kullanıcıların PDF ve görsel dosyalarını online olarak işleyebileceği kapsamlı bir web platformudur. Firebase tabanlı backend ile modern Next.js frontend kullanarak hızlı ve güvenli dosya işleme deneyimi sunar.

## 🎯 Ana Özellikler

### 📄 PDF İşlemleri
- **PDF Sıkıştırma**: Dosya boyutunu optimize etme
- **PDF Dönüştürme**: PDF to Images, Text extraction
- **PDF Birleştirme**: Çoklu PDF dosyalarını birleştirme
- **PDF Ayırma**: Sayfa bazında dosya bölme

### 🖼️ Görsel İşlemleri
- **Resim Sıkıştırma**: Kalite koruyarak boyut azaltma
- **Format Dönüştürme**: JPG, PNG, WebP arası dönüşüm
- **Resim Boyutlandırma**: Özel boyutlarda yeniden boyutlandırma
- **Resim Döndürme**: Açı ayarlama ve döndürme

### ☁️ Firebase Entegrasyonu
- **Authentication**: Kullanıcı kayıt ve giriş sistemi
- **Firestore**: Aktivite takip ve kullanıcı verileri
- **Storage**: Güvenli dosya depolama (5GB)
- **Security Rules**: Kullanıcı bazlı erişim kontrolü

### 👤 Kullanıcı Deneyimi
- **Profil Yönetimi**: Kullanıcı bilgileri ve istatistikler
- **Aktivite Takibi**: İşlem geçmişi ve detaylar
- **Admin Panel**: Sistem yönetimi ve analytics
- **Email Bildirimleri**: Hoş geldin email'leri

## 📧 Email Sistemi

### ✅ Resend API Entegrasyonu
Modern email template sistemi ile otomatik bildirimler:

```typescript
// Welcome Email - Kullanıcı kayıt olduğunda
EmailEvents.onUserRegistered(userData)
```

### 🎨 Email Template Özellikleri
- **Responsive Design**: Mobil ve desktop uyumlu
- **Modern Tasarım**: QuickUtil brand teması
- **Professional Content**: Türkçe profesyonel içerik
- **Accessibility**: WCAG AA standartları

## 🛠️ Teknik Yapı

### Frontend
- **Next.js 15**: App Router yapısı
- **React 19**: Server Components
- **TypeScript**: Strict mode
- **Tailwind CSS**: Utility-first styling
- **Heroicons**: Icon set

### Backend
- **Firebase Auth**: Kullanıcı yönetimi
- **Firestore**: NoSQL database
- **Firebase Storage**: Dosya depolama
- **Security Rules**: Erişim kontrolü

### Libraries
- **pdf-lib**: PDF işleme
- **PDF.js**: PDF görüntüleme
- **Canvas API**: Görsel işleme
- **Resend**: Email hizmeti

## 🚀 Kurulum ve Geliştirme

### Environment Variables
```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Email Service
RESEND_API_KEY=re_your_resend_api_key
```

### Development Commands
```bash
# Geliştirme sunucusu
npm run dev

# Production build
npm run build

# Firebase deploy
firebase deploy

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📊 Admin Panel

### 🔐 Admin Authentication
Email bazlı yetkilendirme sistemi:
- `hello@quickutil.app`
- `admin@quickutil.app`

### 📈 Dashboard Özellikleri
- **KPI Metrics**: Kullanıcı sayısı, işlem istatistikleri
- **User Management**: Kullanıcı listesi ve detayları
- **Activity Logs**: Real-time sistem aktiviteleri
- **Analytics Charts**: Trend analizi (Recharts)

## 🎨 UI/UX Özellikleri

### Responsive Design
- **Mobile-first**: Mobil öncelikli tasarım
- **Touch-friendly**: Dokunmatik dostu arayüz
- **Accessibility**: Erişilebilirlik standartları

### Modern Components
- **Loading States**: Animasyonlu yükleme durumları
- **Error Handling**: Kullanıcı dostu hata mesajları
- **Progress Indicators**: İşlem durumu gösterimi
- **Hover Effects**: Interactive element animasyonları

## 🔒 Güvenlik

### Firebase Security
- **Authentication**: Güvenli kullanıcı doğrulama
- **Security Rules**: Firestore ve Storage kuralları
- **Input Validation**: Dosya türü ve boyut kontrolü
- **SSL Encryption**: HTTPS ile güvenli iletişim

### Data Protection
- **User Privacy**: Kullanıcı verilerinin korunması
- **File Cleanup**: Otomatik dosya silme (30 gün)
- **GDPR Compliance**: Avrupa veri koruma uyumluluğu

## 📱 Performance

### Optimization
- **Code Splitting**: Dinamik import'lar
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Webpack bundle analyzer
- **Caching**: Browser ve CDN cache stratejileri

### Core Web Vitals
- **LCP**: Largest Contentful Paint optimization
- **FID**: First Input Delay minimization
- **CLS**: Cumulative Layout Shift prevention

## 🌐 SEO ve Analytics

### Search Engine Optimization
- **Meta Tags**: Sayfa özelinde meta veriler
- **Structured Data**: Schema.org markup
- **Sitemap**: XML sitemap oluşturumu
- **Open Graph**: Sosyal medya optimizasyonu

### Analytics Integration
- **Firebase Analytics**: Kullanıcı davranış analizi
- **Custom Events**: Özel etkinlik takibi
- **Performance Monitoring**: Performans metrikleri

## 📞 Destek ve İletişim

### İletişim Kanalları
- **Email**: hello@quickutil.app
- **Website**: https://quickutil.app
- **Support**: Platform üzerinden mesaj sistemi

### Dokümantasyon
- **API Docs**: Firebase API dokümantasyonu
- **Component Library**: UI component rehberi
- **Development Guide**: Geliştirici kılavuzu

---

**Son Güncelleme**: Ocak 2025 - Ödeme sistemi kaldırıldı, tamamen ücretsiz platform ✅
