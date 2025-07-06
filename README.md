# QuickUtil.app

**Modern PDF ve Dosya İşleme Araçları** - Next.js 15, Firebase, Resend ile geliştirildi

🚀 **Canlı Demo**: [https://quickutil.app](https://quickutil.app)

## ✨ Özellikler

- 📄 **PDF Sıkıştırma**: Kaliteden ödün vermeden dosya boyutunu küçültün
- 🔄 **PDF Dönüştürme**: PDF'leri farklı formatlara dönüştürün (Word, Excel, PowerPoint)
- 🖼️ **Görsel Optimizasyonu**: Resimleri sıkıştırın ve format değiştirin
- ⚡ **Hızlı İşlem**: Tüm işlemler browser'da gerçekleşir
- 🔒 **Güvenli**: Dosyalarınız sunucuya yüklenmez
- 📱 **Responsive**: Mobil ve desktop uyumlu

## 🛠️ Teknolojiler

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Heroicons
- **Authentication**: Firebase Auth + Custom Email Verification
- **Database**: Firestore
- **Email Service**: Resend API
- **Deployment**: Firebase Hosting + GitHub Actions
- **Cache Management**: Service Worker + Firebase Headers

## 🎯 PDF İşleme

- **pdf-lib**: PDF manipülasyonu ve sıkıştırma
- **PDF.js**: PDF to Images dönüştürme
- **Canvas API**: Yüksek kalite render

## 📧 Email Sistemi

- ✅ **Resend API**: Professional email templates
- ✅ **Domain Authentication**: quickutil.app verified domain
- ✅ **Firebase Functions**: Serverless email sending
- ✅ **Email Verification**: Güvenli hesap doğrulama

## 🚀 Cache Management

- ✅ **Service Worker**: Otomatik cache invalidation
- ✅ **Firebase Headers**: Optimal cache strategy
- ✅ **Build Optimization**: Unique build IDs
- ✅ **Manual Tools**: Development cache clearing

## 🔧 Geliştirme

```bash
# Proje kurulumu
npm install
cd functions && npm install && cd ..

# Development server
npm run dev

# Build
npm run build

# Deploy
npm run deploy
```

## 📊 Performans

- ⚡ **Core Web Vitals**: Optimize edildi
- 🎯 **Bundle Size**: Code splitting ile minimize
- 📱 **Mobile Performance**: 90+ Lighthouse score
- 🔄 **Cache Strategy**: Aggressive caching with proper invalidation

---

*QuickUtil.app - PDF ve dosya işleme araçlarınız artık daha hızlı ve güvenli! ✨*

**GitHub Actions Test**: Successfully configured! 🎉
