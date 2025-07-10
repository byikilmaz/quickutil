const translations = {
  tr: {
    'navigation.pdfTools': 'PDF Araçları',
    'navigation.imageTools': 'Resim Araçları',
    'navigation.batchProcessing': 'Toplu İşlem',
    'navigation.blog': 'Blog',
    'navigation.login': 'Giriş',
    'navigation.logout': 'Çıkış',
    'navigation.admin': 'Admin',
    'profile.title': 'Profil',
    
    // Footer translations
    'footer.tools': 'Araçlar',
    'footer.company': 'Şirket',
    'footer.about': 'Hakkımızda',
    'footer.aboutUrl': 'hakkimizda',
    'footer.privacy': 'Gizlilik Sözleşmesi',
    'footer.privacyUrl': 'gizlilik-sozlesmesi',
    'footer.cookies': 'Çerez Politikası',
    'footer.cookiesUrl': 'cookie-policy',
    'footer.support': 'Destek',
    'footer.sslSecure': 'SSL Güvenli',
    'footer.copyright': 'QuickUtil.app - Tüm hakları saklıdır.',
    
    // Common UI metinleri
    'common.selectFile': 'Dosya seç',
    'common.selectFiles': 'Dosyalar seç',
    'common.dragDrop': 'veya sürükle bırak',
    'common.maxSize': 'Maksimum boyut',
    'common.supportedFormats': 'Desteklenen formatlar',
    'common.maxFiles': 'Maksimum dosya',
    'common.securityNotice': 'Dosyalarınız tarayıcınızda güvenli şekilde işlenir',
    'common.fileUploaded': 'Dosya başarıyla yüklendi!',
    'common.readyToProcess': 'işleme hazır',
    'common.fileReady': 'Dosya işleme hazır',
    'common.size': 'Boyut',
    'common.fileRequirements': 'Dosya Gereksinimleri',
    'common.uploadFailed': 'Yükleme Başarısız',
    'common.or': 'veya',
    'common.recommended': 'ÖNERİLEN',
    'common.completed': 'Tamamlandı',
    'common.savings': 'Tasarruf',
    'common.originalSize': 'Orijinal Boyut',
    'common.newSize': 'Yeni Boyut',
    'common.switchTool': 'Bu araca geç',
    'common.downloadFile': 'Dosyayı İndir',
    'common.compressNew': 'Yeni Sıkıştır',
    'common.processing': 'İşleniyor',
    'common.pleaseWait': 'Dosyanız işleniyor, lütfen bekleyin',

    // Breadcrumb navigation metinleri
    'breadcrumb.home': 'Ana Sayfa',
    'breadcrumb.tools': 'Araçlar',
    'breadcrumb.pdfTools': 'PDF Araçları',
    'breadcrumb.imageTools': 'Resim Araçları',
    'breadcrumb.about': 'Hakkımızda',
    'breadcrumb.profile': 'Profil',
    
    // Notification/Toast metinleri
    'notification.success': 'İşlem başarıyla tamamlandı!',
    'notification.error': 'Bir hata oluştu. Lütfen tekrar deneyin.',
    'notification.warning': 'Uyarı: Dikkatli olun!',
    'notification.info': 'Bilgi: İşlem devam ediyor.',
    'notification.loading': 'Yükleniyor, lütfen bekleyin...',
    'notification.complete': 'Tüm işlemler tamamlandı ✓',
    
    'homepage.title': 'QuickUtil',
    'homepage.subtitle': 'AI destekli PDF ve resim araçları. Akıllı. Hızlı. Ücretsiz.',
    'tools.pdfCompress': 'AI PDF Sıkıştır',
    'tools.pdfConvert': 'AI PDF Dönüştür',
    'tools.imageCompress': 'AI Sıkıştır',
    'tools.imageResize': 'AI Boyutlandır',
    'tools.imageCrop': 'AI Kırp',
    'tools.imageRotate': 'AI Döndür',
    'tools.imageFormat': 'AI Format Dönüştür',
    'tools.imageFilters': 'AI Filtreler'
  }
};

export const useTranslations = (namespace: string, locale: string = 'tr') => {
  return (key: string) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return (translations as any)[locale]?.[fullKey] || (translations as any)['tr']?.[fullKey] || key;
  };
};

export const getTranslations = (locale: string) => {
  return translations[locale as keyof typeof translations] || translations.tr;
};
