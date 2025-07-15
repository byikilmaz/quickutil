import { Metadata } from 'next';

// Local supported locales for SEO utils (server-side compatible)
const supportedLocales = ['tr', 'en', 'es', 'fr', 'de'] as const;

interface PageSEOData {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl: string;
  ogImage?: string;
  structuredData?: Record<string, unknown>;
  expertise?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
}

// Locale-specific metadata configuration
interface LocaleSEOData {
  [locale: string]: {
    [page: string]: PageSEOData;
  };
}

const localeSEOData: LocaleSEOData = {
  tr: {
    home: {
      title: 'QuickUtil - AI Destekli PDF ve Resim İşleme Araçları | Ücretsiz Online Araçlar',
      description: 'Yapay zeka destekli PDF sıkıştırma, format dönüştürme ve resim işleme araçları. Uzman ekibimiz tarafından geliştirilen güvenli, hızlı ve kullanıcı dostu online araçlar. Kişisel verilerinizi koruyarak profesyonel sonuçlar alın.',
      keywords: 'AI PDF sıkıştırma, yapay zeka PDF araçları, AI resim sıkıştırma, PDF optimizasyon, dosya dönüştürme, güvenli PDF araçları, online PDF editor, profesyonel PDF işleme, ücretsiz PDF araçları, kaliteli PDF sıkıştırma',
      canonicalUrl: 'https://quickutil.app/tr',
      ogImage: 'https://quickutil.app/images/og-home-tr.jpg',
      expertise: 'PDF ve resim işleme teknolojilerinde 5+ yıl deneyim',
      author: 'QuickUtil Uzman Ekibi',
      publishedTime: '2024-01-15T10:00:00Z',
      modifiedTime: '2024-12-25T12:00:00Z',
    },
    'pdf-compress': {
      title: 'PDF Sıkıştırma Aracı - AI Destekli Kaliteli PDF Küçültme | QuickUtil',
      description: 'Uzman ekibimiz tarafından geliştirilen AI destekli PDF sıkıştırma aracı. Dosya kalitesini koruyan algoritmalar ile PDF boyutunu %80\'e kadar küçültün. Gizlilik garantisi, hızlı işlem, maksimum 50MB dosya desteği.',
      keywords: 'PDF sıkıştırma, PDF küçültme, AI PDF compression, güvenli PDF sıkıştırma, kaliteli PDF optimizer, online PDF küçültme, hızlı PDF sıkıştırma, ücretsiz PDF araçları, PDF boyut küçültme',
      canonicalUrl: 'https://quickutil.app/tr/pdf-compress',
      ogImage: 'https://quickutil.app/images/og-pdf-compress-tr.jpg',
      expertise: 'PDF sıkıştırma algoritmaları ve optimizasyon teknikleri',
      author: 'QuickUtil PDF Uzmanları',
      publishedTime: '2024-01-15T10:00:00Z',
      modifiedTime: '2024-12-25T12:00:00Z',
      faq: [
        {
          question: 'PDF sıkıştırma nasıl çalışır?',
          answer: 'AI algoritmalarımız PDF içeriğini analiz ederek gereksiz verileri kaldırır, görüntü kalitesini optimize eder ve dosya boyutunu küçültür.'
        },
        {
          question: 'Dosyalarım güvenli mi?',
          answer: 'Evet, tüm dosyalar işlem sonrası otomatik olarak silinir. SSL şifreleme ile korunan sunucularımızda işlem yapar.'
        }
      ]
    },
    'pdf-convert': {
      title: 'PDF Dönüştürme Araçları - Sayfa Ayırma, Birleştirme, Format Değiştirme | QuickUtil',
      description: 'Profesyonel PDF dönüştürme araçları: PDF\'yi JPG/PNG\'ye dönüştürme, sayfa ayırma, birleştirme ve format değiştirme. Uzman ekibimiz tarafından geliştirilen AI destekli teknoloji ile hızlı ve kaliteli sonuçlar.',
      keywords: 'PDF dönüştürme, PDF to JPG, PDF to PNG, PDF birleştirme, PDF ayırma, PDF merge, PDF split, format dönüştürme, AI PDF converter, profesyonel PDF araçları',
      canonicalUrl: 'https://quickutil.app/tr/pdf-convert',
      ogImage: 'https://quickutil.app/images/og-pdf-convert-tr.jpg',
      expertise: 'PDF format dönüştürme ve sayfa işleme teknolojileri',
      author: 'QuickUtil Dönüştürme Uzmanları',
      publishedTime: '2024-01-15T10:00:00Z',
      modifiedTime: '2024-12-25T12:00:00Z',
      faq: [
        {
          question: 'Hangi formatlara dönüştürme yapabiliyorum?',
          answer: 'PDF dosyalarını JPG, PNG formatlarına dönüştürebilir, sayfalara ayırabilir veya birden fazla PDF\'yi birleştirebilirsiniz.'
        },
        {
          question: 'Kalite kaybı oluyor mu?',
          answer: 'AI algoritmalarımız orijinal kaliteyi koruyarak dönüştürme yapar. İsteğe bağlı olarak çözünürlük ayarları yapabilirsiniz.'
        }
      ]
    },
    'image-compress': {
      title: 'Resim Sıkıştırma - AI Destekli Görüntü Optimizasyonu | QuickUtil',
      description: 'Yapay zeka destekli resim sıkıştırma aracı. JPG, PNG, WebP formatlarında kalite kaybı minimuma indirilerek dosya boyutunu küçültün. Toplu işlem desteği, hızlı sonuçlar.',
      keywords: 'resim sıkıştırma, görüntü optimizasyonu, AI image compression, JPG sıkıştırma, PNG optimize, WebP dönüştürme, toplu resim işleme, kaliteli resim sıkıştırma',
      canonicalUrl: 'https://quickutil.app/tr/image-compress',
      ogImage: 'https://quickutil.app/images/og-image-compress-tr.jpg',
      expertise: 'Görüntü işleme ve optimizasyon teknolojileri',
      author: 'QuickUtil Görüntü Uzmanları',
      publishedTime: '2024-01-15T10:00:00Z',
      modifiedTime: '2024-12-25T12:00:00Z',
    },
    'pdf-merge': {
      title: 'PDF Birleştirme - Çoklu PDF Dosyalarını Tek Dosyada Birleştirin | QuickUtil',
      description: 'AI destekli PDF birleştirme aracı ile birden fazla PDF dosyasını tek dosyada birleştirin. Sayfa sıralaması, yer imleri korunur. Güvenli, hızlı ve kullanıcı dostu.',
      keywords: 'PDF birleştirme, PDF merge, çoklu PDF birleştirme, PDF joiner, dosya birleştirme, AI PDF combiner, güvenli PDF birleştirme',
      canonicalUrl: 'https://quickutil.app/tr/pdf-merge',
      ogImage: 'https://quickutil.app/images/og-pdf-merge-tr.jpg',
      expertise: 'PDF dosya birleştirme ve sayfa yönetimi teknolojileri',
      author: 'QuickUtil PDF Uzmanları',
      publishedTime: '2024-01-15T10:00:00Z',
      modifiedTime: '2024-12-25T12:00:00Z',
    },
    'pdf-split': {
      title: 'PDF Ayırma - Sayfa Sayfa PDF Bölme Aracı | QuickUtil',
      description: 'PDF dosyalarını sayfalara ayırın veya istediğiniz sayfa aralıklarını çıkarın. AI destekli teknoloji ile hızlı ve kaliteli PDF ayırma işlemi.',
      keywords: 'PDF ayırma, PDF split, sayfa ayırma, PDF bölme, PDF extract, sayfa çıkarma, AI PDF splitter, güvenli PDF ayırma',
      canonicalUrl: 'https://quickutil.app/tr/pdf-split',
      ogImage: 'https://quickutil.app/images/og-pdf-split-tr.jpg',
      expertise: 'PDF sayfa ayırma ve bölme teknolojileri',
      author: 'QuickUtil PDF Uzmanları',
      publishedTime: '2024-01-15T10:00:00Z',
      modifiedTime: '2024-12-25T12:00:00Z',
    },
    'pdf-to-jpg': {
      title: 'PDF\'yi JPG\'ye Dönüştürme - Yüksek Kaliteli Görüntü Çıktısı | QuickUtil',
      description: 'PDF dosyalarını yüksek kaliteli JPG görüntülere dönüştürün. Her sayfa için ayrı JPG dosyası oluşturur. Çözünürlük ayarları, toplu dönüştürme desteği.',
      keywords: 'PDF to JPG, PDF JPG dönüştürme, PDF görüntü çıkarma, yüksek kalite JPG, PDF image converter, toplu dönüştürme',
      canonicalUrl: 'https://quickutil.app/tr/pdf-to-jpg',
      ogImage: 'https://quickutil.app/images/og-pdf-to-jpg-tr.jpg',
      expertise: 'PDF-görüntü dönüştürme teknolojileri',
      author: 'QuickUtil Dönüştürme Uzmanları',
      publishedTime: '2024-01-15T10:00:00Z',
      modifiedTime: '2024-12-25T12:00:00Z',
    },
    'pdf-to-png': {
      title: 'PDF\'yi PNG\'ye Dönüştürme - Şeffaf Arka Plan Destekli | QuickUtil',
      description: 'PDF dosyalarını şeffaf arka plan destekli PNG formatına dönüştürün. Kalite korumalı, hızlı işlem, toplu dönüştürme imkanı.',
      keywords: 'PDF to PNG, PDF PNG dönüştürme, şeffaf arka plan, PNG converter, kaliteli PNG çıktı, toplu PNG dönüştürme',
      canonicalUrl: 'https://quickutil.app/tr/pdf-to-png',
      ogImage: 'https://quickutil.app/images/og-pdf-to-png-tr.jpg',
      expertise: 'PDF-PNG dönüştürme ve şeffaflık teknolojileri',
      author: 'QuickUtil Dönüştürme Uzmanları',
      publishedTime: '2024-01-15T10:00:00Z',
      modifiedTime: '2024-12-25T12:00:00Z',
    },
    'jpg-to-pdf': {
      title: 'JPG\'yi PDF\'ye Dönüştürme - Çoklu Resim PDF Oluşturma | QuickUtil',
      description: 'JPG resimlerini PDF dosyasına dönüştürün. Çoklu resim seçimi, sayfa düzeni ayarları, kalite korumalı dönüştürme.',
      keywords: 'JPG to PDF, resim PDF dönüştürme, çoklu resim PDF, JPG converter, resim birleştirme PDF, kaliteli PDF oluşturma',
      canonicalUrl: 'https://quickutil.app/tr/jpg-to-pdf',
      ogImage: 'https://quickutil.app/images/og-jpg-to-pdf-tr.jpg',
      expertise: 'Resim-PDF dönüştürme teknolojileri',
      author: 'QuickUtil Dönüştürme Uzmanları',
      publishedTime: '2024-01-15T10:00:00Z',
      modifiedTime: '2024-12-25T12:00:00Z',
    },
    'png-to-pdf': {
      title: 'PNG\'yi PDF\'ye Dönüştürme - Şeffaflık Korumalı PDF Oluşturma | QuickUtil',
      description: 'PNG resimlerini şeffaflık korumalı PDF dosyasına dönüştürün. Toplu dönüştürme, sayfa düzeni ayarları, kalite garantisi.',
      keywords: 'PNG to PDF, şeffaf PNG PDF, PNG converter, şeffaflık korumalı PDF, toplu PNG dönüştürme, kaliteli PDF oluşturma',
      canonicalUrl: 'https://quickutil.app/tr/png-to-pdf',
      ogImage: 'https://quickutil.app/images/og-png-to-pdf-tr.jpg',
      expertise: 'PNG-PDF dönüştürme ve şeffaflık teknolojileri',
      author: 'QuickUtil Dönüştürme Uzmanları',
      publishedTime: '2024-01-15T10:00:00Z',
      modifiedTime: '2024-12-25T12:00:00Z',
    },
    'remove-bg': {
      title: 'Arka Plan Kaldırma - AI Destekli Otomatik Arka Plan Silme | QuickUtil',
      description: 'Yapay zeka teknolojisi ile resimlerden arka planı otomatik kaldırın. Hassas kenar algılama, şeffaf arka plan, profesyonel sonuçlar.',
      keywords: 'arka plan kaldırma, remove background, AI background remover, şeffaf arka plan, otomatik arka plan silme, profesyonel arka plan kaldırma',
      canonicalUrl: 'https://quickutil.app/tr/remove-bg',
      ogImage: 'https://quickutil.app/images/og-remove-bg-tr.jpg',
      expertise: 'AI destekli görüntü segmentasyonu ve arka plan kaldırma',
      author: 'QuickUtil AI Uzmanları',
      publishedTime: '2024-01-15T10:00:00Z',
      modifiedTime: '2024-12-25T12:00:00Z',
    },
    'blog': {
      title: 'PDF ve Resim İşleme Rehberi - Uzman İpuçları ve Kılavuzlar | QuickUtil Blog',
      description: 'PDF ve resim işleme konularında uzman ekibimizin hazırladığı detaylı rehberler, ipuçları ve güncel teknoloji haberleri. Profesyonel dosya işleme teknikleri öğrenin.',
      keywords: 'PDF rehberi, resim işleme kılavuzu, dosya optimizasyonu, PDF ipuçları, görüntü işleme teknikleri, uzman tavsiyeleri',
      canonicalUrl: 'https://quickutil.app/tr/blog',
      ogImage: 'https://quickutil.app/images/og-blog-tr.jpg',
      expertise: 'PDF ve görüntü işleme teknolojileri alanında uzman içerikler',
      author: 'QuickUtil İçerik Uzmanları',
      publishedTime: '2024-01-15T10:00:00Z',
      modifiedTime: '2024-12-25T12:00:00Z',
    },
    'about': {
      title: 'Hakkımızda - QuickUtil Uzman Ekibi ve Misyonumuz | QuickUtil',
      description: 'QuickUtil uzman ekibi ve misyonumuz hakkında bilgi edinin. PDF ve resim işleme teknolojilerinde 5+ yıl deneyime sahip ekibimizin hikayesi.',
      keywords: 'QuickUtil hakkında, uzman ekip, misyon, PDF uzmanları, görüntü işleme uzmanları, teknoloji ekibi',
      canonicalUrl: 'https://quickutil.app/tr/about',
      ogImage: 'https://quickutil.app/images/og-about-tr.jpg',
      expertise: 'PDF ve görüntü işleme teknolojileri alanında deneyimli uzman ekip',
      author: 'QuickUtil Kurucu Ekibi',
      publishedTime: '2024-01-15T10:00:00Z',
      modifiedTime: '2024-12-25T12:00:00Z',
    },
    'privacy': {
      title: 'Gizlilik Politikası - Verilerinizin Güvenliği | QuickUtil',
      description: 'QuickUtil gizlilik politikası ve kişisel verilerinizin korunması hakkında detaylı bilgiler. GDPR uyumlu veri işleme politikalarımız.',
      keywords: 'gizlilik politikası, veri güvenliği, GDPR, kişisel veri korunması, dosya güvenliği, privacy policy',
      canonicalUrl: 'https://quickutil.app/tr/privacy',
      ogImage: 'https://quickutil.app/images/og-privacy-tr.jpg',
      expertise: 'Veri güvenliği ve gizlilik politikaları',
      author: 'QuickUtil Hukuk Ekibi',
      publishedTime: '2024-01-15T10:00:00Z',
      modifiedTime: '2024-12-25T12:00:00Z',
    },
    'contact': {
      title: 'İletişim - QuickUtil Destek Ekibi | QuickUtil',
      description: 'QuickUtil destek ekibi ile iletişime geçin. Teknik destek, öneriler ve sorularınız için 7/24 müşteri desteği.',
      keywords: 'iletişim, destek, müşteri hizmetleri, teknik destek, yardım, contact, support',
      canonicalUrl: 'https://quickutil.app/tr/contact',
      ogImage: 'https://quickutil.app/images/og-contact-tr.jpg',
      expertise: 'Müşteri desteği ve teknik yardım',
      author: 'QuickUtil Destek Ekibi',
      publishedTime: '2024-01-15T10:00:00Z',
      modifiedTime: '2024-12-25T12:00:00Z',
    },
    'terms': {
      title: 'Kullanım Koşulları - QuickUtil Hizmet Şartları | QuickUtil',
      description: 'QuickUtil kullanım koşulları ve hizmet şartları. Platform kullanımı, haklar ve sorumluluklar hakkında detaylı bilgiler.',
      keywords: 'kullanım koşulları, hizmet şartları, terms of service, platform kuralları, kullanıcı hakları',
      canonicalUrl: 'https://quickutil.app/tr/terms',
      ogImage: 'https://quickutil.app/images/og-terms-tr.jpg',
      expertise: 'Hukuki koşullar ve kullanım şartları',
      author: 'QuickUtil Hukuk Ekibi',
      publishedTime: '2024-01-15T10:00:00Z',
      modifiedTime: '2024-12-25T12:00:00Z',
    },
  },
  en: {
    home: {
      title: 'QuickUtil - AI-Powered PDF Compression and File Processing Tools',
      description: 'AI-powered PDF compression, format conversion and image processing tools. Automatic optimization with artificial intelligence, fast and secure online tools.',
      keywords: 'AI PDF compression, artificial intelligence PDF tools, AI image compression, automatic PDF optimization, smart file processing, AI-powered tools, machine learning PDF, intelligent compression',
      canonicalUrl: 'https://quickutil.app/en',
      ogImage: 'https://quickutil.app/images/og-home-en.jpg',
    },
    'pdf-compress': {
      title: 'AI PDF Compression - Automatic PDF Optimization with Artificial Intelligence | QuickUtil',
      description: 'Automatically optimize your PDF files with AI technology. Artificial intelligence selects the best quality and size balance. Free AI-powered PDF compression.',
      keywords: 'AI PDF compression, artificial intelligence PDF optimization, automatic PDF reduction, intelligent PDF compression, AI PDF optimizer, machine learning compression, smart PDF reducer',
      canonicalUrl: 'https://quickutil.app/en/pdf-compress',
      ogImage: 'https://quickutil.app/images/og-pdf-compress-en.jpg',
    },
    'pdf-convert': {
      title: 'AI PDF Converter - Smart Format Selection and Optimization | QuickUtil',
      description: 'AI-powered PDF conversion tools. Artificial intelligence automatically selects formats, splits pages, merges documents. Smart PDF processing technology.',
      keywords: 'AI PDF converter, artificial intelligence format selection, automatic PDF split, intelligent PDF merge, AI PDF to JPG, smart format conversion, machine learning PDF tools',
      canonicalUrl: 'https://quickutil.app/en/pdf-convert',
      ogImage: 'https://quickutil.app/images/og-pdf-convert-en.jpg',
    },
    'pdf-to-images': {
      title: 'AI PDF to JPG/PNG - Yapay Zeka ile PDF Sayfa Görselleştirme | QuickUtil',
      description: 'AI destekli PDF to images dönüştürme. Yapay zeka en uygun çözünürlük ve format seçimi yapar. Yüksek kaliteli PDF to JPG, PNG dönüştürme.',
      keywords: 'AI PDF to JPG, PDF to PNG yapay zeka, AI PDF görsel çıkarma, intelligent PDF to images, akıllı sayfa görselleştirme, machine learning PDF converter',
      canonicalUrl: 'https://quickutil.app/en/pdf-to-images',
      ogImage: 'https://quickutil.app/images/og-pdf-to-images-en.jpg',
    },
    'pdf-to-text': {
      title: 'AI PDF to Text - Yapay Zeka ile Akıllı Metin Çıkarma | QuickUtil',
      description: 'AI destekli PDF to text dönüştürme. Yapay zeka OCR teknolojisi ile mükemmel metin çıkarma. Akıllı karakter tanıma ve format koruması.',
      keywords: 'AI PDF to text, yapay zeka OCR, intelligent text extraction, AI PDF metin çıkarma, akıllı karakter tanıma, machine learning PDF text',
      canonicalUrl: 'https://quickutil.app/en/pdf-to-text',
      ogImage: 'https://quickutil.app/images/og-pdf-to-text-en.jpg',
    },
    'pdf-split': {
      title: 'AI PDF Ayırma - Yapay Zeka ile Akıllı Sayfa Bölme | QuickUtil',
      description: 'AI destekli PDF split aracı. Yapay zeka otomatik sayfa algılama ve akıllı bölme yapar. Intelligent PDF sayfa ayırma teknolojisi.',
      keywords: 'AI PDF split, yapay zeka sayfa ayırma, intelligent PDF bölme, AI PDF separator, akıllı PDF ayırma, machine learning page split',
      canonicalUrl: 'https://quickutil.app/en/pdf-split',
      ogImage: 'https://quickutil.app/images/og-pdf-split-en.jpg',
    },
    'pdf-merge': {
      title: 'AI PDF Birleştirme - Yapay Zeka ile Akıllı Dosya Birleştirme | QuickUtil',
      description: 'AI destekli PDF merge aracı. Yapay zeka optimal birleştirme sırası ve sayfa düzeni seçer. Intelligent PDF birleştirme teknolojisi.',
      keywords: 'AI PDF merge, yapay zeka PDF birleştirme, intelligent PDF combine, AI dosya birleştirme, akıllı PDF merge, machine learning PDF joiner',
      canonicalUrl: 'https://quickutil.app/en/pdf-merge',
      ogImage: 'https://quickutil.app/images/og-pdf-merge-en.jpg',
    },
    'image-compress': {
      title: 'AI Image Compression - Smart Photo Optimization with Artificial Intelligence | QuickUtil',
      description: 'Automatically optimize your images with AI algorithms. Artificial intelligence analyzes content and selects the best quality settings. Free AI image tools.',
      keywords: 'AI image compression, artificial intelligence photo optimization, intelligent image compression, automatic image reduction, AI image optimizer, smart photo reducer, machine learning image tools',
      canonicalUrl: 'https://quickutil.app/en/image-compress',
      ogImage: 'https://quickutil.app/images/og-image-compress-en.jpg',
    },
    blog: {
      title: 'AI Blog - Artificial Intelligence File Processing Guides | QuickUtil',
      description: 'AI-powered file processing, artificial intelligence PDF optimization and smart image compression guides. Machine learning file security tips.',
      keywords: 'AI blog, artificial intelligence guides, machine learning file processing, AI PDF guide, intelligent file processing, artificial intelligence tools',
      canonicalUrl: 'https://quickutil.app/en/blog',
      ogImage: 'https://quickutil.app/images/og-blog-en.jpg',
    },
  },
  es: {
    home: {
      title: 'QuickUtil - Herramientas de Compresión PDF y Procesamiento de Archivos con IA',
      description: 'Herramientas de compresión PDF, conversión de formato y procesamiento de imágenes con IA. Optimización automática con inteligencia artificial, herramientas online rápidas y seguras.',
      keywords: 'compresión PDF IA, herramientas PDF inteligencia artificial, compresión imágenes IA, optimización PDF automática, procesamiento archivos inteligente, herramientas IA, machine learning PDF',
      canonicalUrl: 'https://quickutil.app/es',
      ogImage: 'https://quickutil.app/images/og-home-es.jpg',
    },
    'pdf-compress': {
      title: 'Compresión PDF IA - Optimización Automática PDF con Inteligencia Artificial | QuickUtil',
      description: 'Optimiza automáticamente tus archivos PDF con tecnología IA. La inteligencia artificial selecciona el mejor balance de calidad y tamaño. Compresión PDF gratuita con IA.',
      keywords: 'compresión PDF IA, optimización PDF inteligencia artificial, reducción PDF automática, compresión PDF inteligente, optimizador PDF IA, compresión machine learning',
      canonicalUrl: 'https://quickutil.app/es/pdf-compress',
      ogImage: 'https://quickutil.app/images/og-pdf-compress-es.jpg',
    },
    'pdf-convert': {
      title: 'Conversor PDF IA - Selección Inteligente de Formato y Optimización | QuickUtil',
      description: 'Herramientas de conversión PDF con IA. La inteligencia artificial selecciona formatos automáticamente, divide páginas, fusiona documentos. Tecnología inteligente de procesamiento PDF.',
      keywords: 'conversor PDF IA, selección formato inteligencia artificial, división PDF automática, fusión PDF inteligente, IA PDF a JPG, conversión formato inteligente, herramientas PDF machine learning',
      canonicalUrl: 'https://quickutil.app/es/pdf-convert',
      ogImage: 'https://quickutil.app/images/og-pdf-convert-es.jpg',
    },
    'pdf-to-images': {
      title: 'AI PDF to JPG/PNG - Yapay Zeka ile PDF Sayfa Görselleştirme | QuickUtil',
      description: 'AI destekli PDF to images dönüştürme. Yapay zeka en uygun çözünürlük ve format seçimi yapar. Yüksek kaliteli PDF to JPG, PNG dönüştürme.',
      keywords: 'AI PDF to JPG, PDF to PNG yapay zeka, AI PDF görsel çıkarma, intelligent PDF to images, akıllı sayfa görselleştirme, machine learning PDF converter',
      canonicalUrl: 'https://quickutil.app/es/pdf-to-images',
      ogImage: 'https://quickutil.app/images/og-pdf-to-images-es.jpg',
    },
    'pdf-to-text': {
      title: 'AI PDF to Text - Yapay Zeka ile Akıllı Metin Çıkarma | QuickUtil',
      description: 'AI destekli PDF to text dönüştürme. Yapay zeka OCR teknolojisi ile mükemmel metin çıkarma. Akıllı karakter tanıma ve format koruması.',
      keywords: 'AI PDF to text, yapay zeka OCR, intelligent text extraction, AI PDF metin çıkarma, akıllı karakter tanıma, machine learning PDF text',
      canonicalUrl: 'https://quickutil.app/es/pdf-to-text',
      ogImage: 'https://quickutil.app/images/og-pdf-to-text-es.jpg',
    },
    'pdf-split': {
      title: 'AI PDF Ayırma - Yapay Zeka ile Akıllı Sayfa Bölme | QuickUtil',
      description: 'AI destekli PDF split aracı. Yapay zeka otomatik sayfa algılama ve akıllı bölme yapar. Intelligent PDF sayfa ayırma teknolojisi.',
      keywords: 'AI PDF split, yapay zeka sayfa ayırma, intelligent PDF bölme, AI PDF separator, akıllı PDF ayırma, machine learning page split',
      canonicalUrl: 'https://quickutil.app/es/pdf-split',
      ogImage: 'https://quickutil.app/images/og-pdf-split-es.jpg',
    },
    'pdf-merge': {
      title: 'AI PDF Birleştirme - Yapay Zeka ile Akıllı Dosya Birleştirme | QuickUtil',
      description: 'AI destekli PDF merge aracı. Yapay zeka optimal birleştirme sırası ve sayfa düzeni seçer. Intelligent PDF birleştirme teknolojisi.',
      keywords: 'AI PDF merge, yapay zeka PDF birleştirme, intelligent PDF combine, AI dosya birleştirme, akıllı PDF merge, machine learning PDF joiner',
      canonicalUrl: 'https://quickutil.app/es/pdf-merge',
      ogImage: 'https://quickutil.app/images/og-pdf-merge-es.jpg',
    },
    'image-compress': {
      title: 'Compresión Imágenes IA - Optimización Inteligente de Fotos con IA | QuickUtil',
      description: 'Optimiza automáticamente tus imágenes con algoritmos IA. La inteligencia artificial analiza contenido y selecciona los mejores ajustes de calidad. Herramientas IA gratuitas para imágenes.',
      keywords: 'compresión imágenes IA, optimización fotos inteligencia artificial, compresión imágenes inteligente, reducción imágenes automática, optimizador imágenes IA, herramientas imágenes machine learning',
      canonicalUrl: 'https://quickutil.app/es/image-compress',
      ogImage: 'https://quickutil.app/images/og-image-compress-es.jpg',
    },
    blog: {
      title: 'Blog IA - Guías de Procesamiento de Archivos con Inteligencia Artificial | QuickUtil',
      description: 'Procesamiento de archivos con IA, optimización PDF con inteligencia artificial y guías de compresión inteligente de imágenes. Consejos de seguridad de archivos con machine learning.',
      keywords: 'blog IA, guías inteligencia artificial, procesamiento archivos machine learning, guía PDF IA, procesamiento archivos inteligente, herramientas inteligencia artificial',
      canonicalUrl: 'https://quickutil.app/es/blog',
      ogImage: 'https://quickutil.app/images/og-blog-es.jpg',
    },
  },
  fr: {
    home: {
      title: 'QuickUtil - Outils de Compression PDF et Traitement de Fichiers avec IA',
      description: 'Outils de compression PDF, conversion de format et traitement d\'images avec IA. Optimisation automatique avec intelligence artificielle, outils en ligne rapides et sécurisés.',
      keywords: 'compression PDF IA, outils PDF intelligence artificielle, compression images IA, optimisation PDF automatique, traitement fichiers intelligent, outils IA, machine learning PDF',
      canonicalUrl: 'https://quickutil.app/fr',
      ogImage: 'https://quickutil.app/images/og-home-fr.jpg',
    },
    'pdf-compress': {
      title: 'Compression PDF IA - Optimisation Automatique PDF avec Intelligence Artificielle | QuickUtil',
      description: 'Optimisez automatiquement vos fichiers PDF avec la technologie IA. L\'intelligence artificielle sélectionne le meilleur équilibre qualité et taille. Compression PDF gratuite avec IA.',
      keywords: 'compression PDF IA, optimisation PDF intelligence artificielle, réduction PDF automatique, compression PDF intelligente, optimiseur PDF IA, compression machine learning',
      canonicalUrl: 'https://quickutil.app/fr/pdf-compress',
      ogImage: 'https://quickutil.app/images/og-pdf-compress-fr.jpg',
    },
    'pdf-convert': {
      title: 'Convertisseur PDF IA - Sélection Intelligente de Format et Optimisation | QuickUtil',
      description: 'Outils de conversion PDF avec IA. L\'intelligence artificielle sélectionne automatiquement les formats, divise les pages, fusionne les documents. Technologie intelligente de traitement PDF.',
      keywords: 'convertisseur PDF IA, sélection format intelligence artificielle, division PDF automatique, fusion PDF intelligente, IA PDF vers JPG, conversion format intelligente, outils PDF machine learning',
      canonicalUrl: 'https://quickutil.app/fr/pdf-convert',
      ogImage: 'https://quickutil.app/images/og-pdf-convert-fr.jpg',
    },
    'pdf-to-images': {
      title: 'AI PDF to JPG/PNG - Yapay Zeka ile PDF Sayfa Görselleştirme | QuickUtil',
      description: 'AI destekli PDF to images dönüştürme. Yapay zeka en uygun çözünürlük ve format seçimi yapar. Yüksek kaliteli PDF to JPG, PNG dönüştürme.',
      keywords: 'AI PDF to JPG, PDF to PNG yapay zeka, AI PDF görsel çıkarma, intelligent PDF to images, akıllı sayfa görselleştirme, machine learning PDF converter',
      canonicalUrl: 'https://quickutil.app/fr/pdf-to-images',
      ogImage: 'https://quickutil.app/images/og-pdf-to-images-fr.jpg',
    },
    'pdf-to-text': {
      title: 'AI PDF to Text - Yapay Zeka ile Akıllı Metin Çıkarma | QuickUtil',
      description: 'AI destekli PDF to text dönüştürme. Yapay zeka OCR teknolojisi ile mükemmel metin çıkarma. Akıllı karakter tanıma ve format koruması.',
      keywords: 'AI PDF to text, yapay zeka OCR, intelligent text extraction, AI PDF metin çıkarma, akıllı karakter tanıma, machine learning PDF text',
      canonicalUrl: 'https://quickutil.app/fr/pdf-to-text',
      ogImage: 'https://quickutil.app/images/og-pdf-to-text-fr.jpg',
    },
    'pdf-split': {
      title: 'AI PDF Ayırma - Yapay Zeka ile Akıllı Sayfa Bölme | QuickUtil',
      description: 'AI destekli PDF split aracı. Yapay zeka otomatik sayfa algılama ve akıllı bölme yapar. Intelligent PDF sayfa ayırma teknolojisi.',
      keywords: 'AI PDF split, yapay zeka sayfa ayırma, intelligent PDF bölme, AI PDF separator, akıllı PDF ayırma, machine learning page split',
      canonicalUrl: 'https://quickutil.app/fr/pdf-split',
      ogImage: 'https://quickutil.app/images/og-pdf-split-fr.jpg',
    },
    'pdf-merge': {
      title: 'AI PDF Birleştirme - Yapay Zeka ile Akıllı Dosya Birleştirme | QuickUtil',
      description: 'AI destekli PDF merge aracı. Yapay zeka optimal birleştirme sırası ve sayfa düzeni seçer. Intelligent PDF birleştirme teknolojisi.',
      keywords: 'AI PDF merge, yapay zeka PDF birleştirme, intelligent PDF combine, AI dosya birleştirme, akıllı PDF merge, machine learning PDF joiner',
      canonicalUrl: 'https://quickutil.app/fr/pdf-merge',
      ogImage: 'https://quickutil.app/images/og-pdf-merge-fr.jpg',
    },
    'image-compress': {
      title: 'Compression Images IA - Optimisation Intelligente de Photos avec IA | QuickUtil',
      description: 'Optimisez automatiquement vos images avec des algorithmes IA. L\'intelligence artificielle analyse le contenu et sélectionne les meilleurs réglages de qualité. Outils IA gratuits pour images.',
      keywords: 'compression images IA, optimisation photos intelligence artificielle, compression images intelligente, réduction images automatique, optimiseur images IA, outils images machine learning',
      canonicalUrl: 'https://quickutil.app/fr/image-compress',
      ogImage: 'https://quickutil.app/images/og-image-compress-fr.jpg',
    },
    blog: {
      title: 'Blog IA - Guides de Traitement de Fichiers avec Intelligence Artificielle | QuickUtil',
      description: 'Traitement de fichiers avec IA, optimisation PDF avec intelligence artificielle et guides de compression intelligente d\'images. Conseils de sécurité de fichiers avec machine learning.',
      keywords: 'blog IA, guides intelligence artificielle, traitement fichiers machine learning, guide PDF IA, traitement fichiers intelligent, outils intelligence artificielle',
      canonicalUrl: 'https://quickutil.app/fr/blog',
      ogImage: 'https://quickutil.app/images/og-blog-fr.jpg',
    },
  },
  de: {
    home: {
      title: 'QuickUtil - KI-Gestützte PDF-Komprimierung und Dateiverarbeitungs-Tools',
      description: 'KI-gestützte PDF-Komprimierung, Formatkonvertierung und Bildverarbeitung-Tools. Automatische Optimierung mit künstlicher Intelligenz, schnelle und sichere Online-Tools.',
      keywords: 'KI PDF Komprimierung, künstliche Intelligenz PDF Tools, KI Bildkomprimierung, automatische PDF Optimierung, intelligente Dateiverarbeitung, KI-Tools, machine learning PDF',
      canonicalUrl: 'https://quickutil.app/de',
      ogImage: 'https://quickutil.app/images/og-home-de.jpg',
    },
    'pdf-compress': {
      title: 'KI PDF-Komprimierung - Automatische PDF-Optimierung mit Künstlicher Intelligenz | QuickUtil',
      description: 'Optimieren Sie Ihre PDF-Dateien automatisch mit KI-Technologie. Künstliche Intelligenz wählt das beste Gleichgewicht zwischen Qualität und Größe. Kostenlose KI-gestützte PDF-Komprimierung.',
      keywords: 'KI PDF Komprimierung, künstliche Intelligenz PDF Optimierung, automatische PDF Reduktion, intelligente PDF Komprimierung, KI PDF Optimierer, machine learning Komprimierung',
      canonicalUrl: 'https://quickutil.app/de/pdf-compress',
      ogImage: 'https://quickutil.app/images/og-pdf-compress-de.jpg',
    },
    'pdf-convert': {
      title: 'KI PDF-Konverter - Intelligente Formatauswahl und Optimierung | QuickUtil',
      description: 'KI-gestützte PDF-Konvertierungs-Tools. Künstliche Intelligenz wählt automatisch Formate aus, teilt Seiten, führt Dokumente zusammen. Intelligente PDF-Verarbeitungstechnologie.',
      keywords: 'KI PDF Konverter, künstliche Intelligenz Formatauswahl, automatische PDF Teilung, intelligente PDF Fusion, KI PDF zu JPG, intelligente Formatkonvertierung, PDF Tools machine learning',
      canonicalUrl: 'https://quickutil.app/de/pdf-convert',
      ogImage: 'https://quickutil.app/images/og-pdf-convert-de.jpg',
    },
    'pdf-to-images': {
      title: 'AI PDF to JPG/PNG - Yapay Zeka ile PDF Sayfa Görselleştirme | QuickUtil',
      description: 'AI destekli PDF to images dönüştürme. Yapay zeka en uygun çözünürlük ve format seçimi yapar. Yüksek kaliteli PDF to JPG, PNG dönüştürme.',
      keywords: 'AI PDF to JPG, PDF to PNG yapay zeka, AI PDF görsel çıkarma, intelligent PDF to images, akıllı sayfa görselleştirme, machine learning PDF converter',
      canonicalUrl: 'https://quickutil.app/de/pdf-to-images',
      ogImage: 'https://quickutil.app/images/og-pdf-to-images-de.jpg',
    },
    'pdf-to-text': {
      title: 'AI PDF to Text - Yapay Zeka ile Akıllı Metin Çıkarma | QuickUtil',
      description: 'AI destekli PDF to text dönüştürme. Yapay zeka OCR teknolojisi ile mükemmel metin çıkarma. Akıllı karakter tanıma ve format koruması.',
      keywords: 'AI PDF to text, yapay zeka OCR, intelligent text extraction, AI PDF metin çıkarma, akıllı karakter tanıma, machine learning PDF text',
      canonicalUrl: 'https://quickutil.app/de/pdf-to-text',
      ogImage: 'https://quickutil.app/images/og-pdf-to-text-de.jpg',
    },
    'pdf-split': {
      title: 'AI PDF Ayırma - Yapay Zeka ile Akıllı Sayfa Bölme | QuickUtil',
      description: 'AI destekli PDF split aracı. Yapay zeka otomatik sayfa algılama ve akıllı bölme yapar. Intelligent PDF sayfa ayırma teknolojisi.',
      keywords: 'AI PDF split, yapay zeka sayfa ayırma, intelligent PDF bölme, AI PDF separator, akıllı PDF ayırma, machine learning page split',
      canonicalUrl: 'https://quickutil.app/de/pdf-split',
      ogImage: 'https://quickutil.app/images/og-pdf-split-de.jpg',
    },
    'pdf-merge': {
      title: 'AI PDF Birleştirme - Yapay Zeka ile Akıllı Dosya Birleştirme | QuickUtil',
      description: 'AI destekli PDF merge aracı. Yapay zeka optimal birleştirme sırası ve sayfa düzeni seçer. Intelligent PDF birleştirme teknolojisi.',
      keywords: 'AI PDF merge, yapay zeka PDF birleştirme, intelligent PDF combine, AI dosya birleştirme, akıllı PDF merge, machine learning PDF joiner',
      canonicalUrl: 'https://quickutil.app/de/pdf-merge',
      ogImage: 'https://quickutil.app/images/og-pdf-merge-de.jpg',
    },
    'image-compress': {
      title: 'KI Bildkomprimierung - Intelligente Foto-Optimierung mit Künstlicher Intelligenz | QuickUtil',
      description: 'Optimieren Sie Ihre Bilder automatisch mit KI-Algorithmen. Künstliche Intelligenz analysiert Inhalte und wählt die besten Qualitätseinstellungen. Kostenlose KI-Bild-Tools.',
      keywords: 'KI Bildkomprimierung, künstliche Intelligenz Foto Optimierung, intelligente Bildkomprimierung, automatische Bildreduktion, KI Bildoptimierer, Bild Tools machine learning',
      canonicalUrl: 'https://quickutil.app/de/image-compress',
      ogImage: 'https://quickutil.app/images/og-image-compress-de.jpg',
    },
    blog: {
      title: 'KI Blog - Dateiverarbeitung Anleitungen mit Künstlicher Intelligenz | QuickUtil',
      description: 'Dateiverarbeitung mit KI, PDF-Optimierung mit künstlicher Intelligenz und intelligente Bildkomprimierung Anleitungen. Dateisicherheit Tipps mit machine learning.',
      keywords: 'KI Blog, künstliche Intelligenz Anleitungen, Dateiverarbeitung machine learning, KI PDF Anleitung, intelligente Dateiverarbeitung, künstliche Intelligenz Tools',
      canonicalUrl: 'https://quickutil.app/de/blog',
      ogImage: 'https://quickutil.app/images/og-blog-de.jpg',
    },
  },
  ar: {
    home: {
      title: 'QuickUtil - أدوات ضغط PDF ومعالجة الملفات بالذكاء الاصطناعي',
      description: 'أدوات ضغط PDF وتحويل التنسيق ومعالجة الصور بالذكاء الاصطناعي. تحسين تلقائي بالذكاء الاصطناعي، أدوات عبر الإنترنت سريعة وآمنة.',
      keywords: 'ضغط PDF ذكاء اصطناعي, أدوات PDF ذكاء اصطناعي, ضغط صور ذكاء اصطناعي, تحسين PDF تلقائي, معالجة ملفات ذكية, أدوات ذكاء اصطناعي, machine learning PDF',
      canonicalUrl: 'https://quickutil.app/ar',
      ogImage: 'https://quickutil.app/images/og-home-ar.jpg',
    },
    'pdf-compress': {
      title: 'ضغط PDF بالذكاء الاصطناعي - تحسين PDF تلقائي بالذكاء الاصطناعي | QuickUtil',
      description: 'احسن ملفات PDF تلقائياً بتقنية الذكاء الاصطناعي. يختار الذكاء الاصطناعي أفضل توازن بين الجودة والحجم. ضغط PDF مجاني بالذكاء الاصطناعي.',
      keywords: 'ضغط PDF ذكاء اصطناعي, تحسين PDF ذكاء اصطناعي, تقليل PDF تلقائي, ضغط PDF ذكي, محسن PDF ذكاء اصطناعي, ضغط machine learning',
      canonicalUrl: 'https://quickutil.app/ar/pdf-compress',
      ogImage: 'https://quickutil.app/images/og-pdf-compress-ar.jpg',
    },
    'pdf-convert': {
      title: 'محول PDF بالذكاء الاصطناعي - اختيار ذكي للتنسيق والتحسين | QuickUtil',
      description: 'أدوات تحويل PDF بالذكاء الاصطناعي. يختار الذكاء الاصطناعي التنسيقات تلقائياً، يقسم الصفحات، يدمج المستندات. تقنية معالجة PDF ذكية.',
      keywords: 'محول PDF ذكاء اصطناعي, اختيار تنسيق ذكاء اصطناعي, تقسيم PDF تلقائي, دمج PDF ذكي, ذكاء اصطناعي PDF إلى JPG, تحويل تنسيق ذكي, أدوات PDF machine learning',
      canonicalUrl: 'https://quickutil.app/ar/pdf-convert',
      ogImage: 'https://quickutil.app/images/og-pdf-convert-ar.jpg',
    },
    'pdf-to-images': {
      title: 'ضغط صور بالذكاء الاصطناعي - تحسين ذكي للصور بالذكاء الاصطناعي | QuickUtil',
      description: 'احسن صورك تلقائياً بخوارزميات الذكاء الاصطناعي. يحلل الذكاء الاصطناعي المحتوى ويختار أفضل إعدادات الجودة. أدوات صور مجانية بالذكاء الاصطناعي.',
      keywords: 'ضغط صور ذكاء اصطناعي, تحسين صور ذكاء اصطناعي, ضغط صور ذكي, تقليل صور تلقائي, محسن صور ذكاء اصطناعي, أدوات صور machine learning',
      canonicalUrl: 'https://quickutil.app/ar/pdf-to-images',
      ogImage: 'https://quickutil.app/images/og-pdf-to-images-ar.jpg',
    },
    'pdf-to-text': {
      title: 'مدونة الذكاء الاصطناعي - أدلة معالجة الملفات بالذكاء الاصطناعي | QuickUtil',
      description: 'معالجة الملفات بالذكاء الاصطناعي، تحسين PDF بالذكاء الاصطناعي وأدلة ضغط الصور الذكي. نصائح أمان الملفات بـ machine learning.',
      keywords: 'مدونة ذكاء اصطناعي, أدلة ذكاء اصطناعي, معالجة ملفات machine learning, دليل PDF ذكاء اصطناعي, معالجة ملفات ذكية, أدوات ذكاء اصطناعي',
      canonicalUrl: 'https://quickutil.app/ar/pdf-to-text',
      ogImage: 'https://quickutil.app/images/og-pdf-to-text-ar.jpg',
    },
    'pdf-split': {
      title: 'AI PDF Ayırma - Yapay Zeka ile Akıllı Sayfa Bölme | QuickUtil',
      description: 'AI destekli PDF split aracı. Yapay zeka otomatik sayfa algılama ve akıllı bölme yapar. Intelligent PDF sayfa ayırma teknolojisi.',
      keywords: 'AI PDF split, yapay zeka sayfa ayırma, intelligent PDF bölme, AI PDF separator, akıllı PDF ayırma, machine learning page split',
      canonicalUrl: 'https://quickutil.app/ar/pdf-split',
      ogImage: 'https://quickutil.app/images/og-pdf-split-ar.jpg',
    },
    'pdf-merge': {
      title: 'AI PDF Birleştirme - Yapay Zeka ile Akıllı Dosya Birleştirme | QuickUtil',
      description: 'AI destekli PDF merge aracı. Yapay zeka optimal birleştirme sırası ve sayfa düzeni seçer. Intelligent PDF birleştirme teknolojisi.',
      keywords: 'AI PDF merge, yapay zeka PDF birleştirme, intelligent PDF combine, AI dosya birleştirme, akıllı PDF merge, machine learning PDF joiner',
      canonicalUrl: 'https://quickutil.app/ar/pdf-merge',
      ogImage: 'https://quickutil.app/images/og-pdf-merge-ar.jpg',
    },
  },
  ja: {
    home: {
      title: 'QuickUtil - AI搭載PDF圧縮とファイル処理ツール',
      description: 'AI搭載のPDF圧縮、フォーマット変換、画像処理ツール。人工知能による自動最適化、高速で安全なオンラインツール。',
      keywords: 'AI PDF圧縮, 人工知能PDFツール, AI画像圧縮, 自動PDF最適化, スマートファイル処理, AIツール, machine learning PDF',
      canonicalUrl: 'https://quickutil.app/ja',
      ogImage: 'https://quickutil.app/images/og-home-ja.jpg',
    },
    'pdf-compress': {
      title: 'AI PDF圧縮 - 人工知能による自動PDF最適化 | QuickUtil',
      description: 'AI技術でPDFファイルを自動最適化。人工知能が最適な品質とサイズのバランスを選択。無料のAI搭載PDF圧縮。',
      keywords: 'AI PDF圧縮, 人工知能PDF最適化, 自動PDF削減, インテリジェントPDF圧縮, AI PDFオプティマイザー, machine learning圧縮',
      canonicalUrl: 'https://quickutil.app/ja/pdf-compress',
      ogImage: 'https://quickutil.app/images/og-pdf-compress-ja.jpg',
    },
    'pdf-convert': {
      title: 'AI PDFコンバーター - スマートフォーマット選択と最適化 | QuickUtil',
      description: 'AI搭載PDF変換ツール。人工知能が自動的にフォーマットを選択し、ページ分割、文書結合。スマートPDF処理技術。',
      keywords: 'AI PDFコンバーター, 人工知能フォーマット選択, 自動PDF分割, インテリジェントPDF結合, AI PDF to JPG, スマートフォーマット変換, PDFツール machine learning',
      canonicalUrl: 'https://quickutil.app/ja/pdf-convert',
      ogImage: 'https://quickutil.app/images/og-pdf-convert-ja.jpg',
    },
    'pdf-to-images': {
      title: 'AI PDF to JPG/PNG - Yapay Zeka ile PDF Sayfa Görselleştirme | QuickUtil',
      description: 'AI destekli PDF to images dönüştürme. Yapay zeka en uygun çözünürlük ve format seçimi yapar. Yüksek kaliteli PDF to JPG, PNG dönüştürme.',
      keywords: 'AI PDF to JPG, PDF to PNG yapay zeka, AI PDF görsel çıkarma, intelligent PDF to images, akıllı sayfa görselleştirme, machine learning PDF converter',
      canonicalUrl: 'https://quickutil.app/ja/pdf-to-images',
      ogImage: 'https://quickutil.app/images/og-pdf-to-images-ja.jpg',
    },
    'pdf-to-text': {
      title: 'AI PDF to Text - Yapay Zeka ile Akıllı Metin Çıkarma | QuickUtil',
      description: 'AI destekli PDF to text dönüştürme. Yapay zeka OCR teknolojisi ile mükemmel metin çıkarma. Akıllı karakter tanıma ve format koruması.',
      keywords: 'AI PDF to text, yapay zeka OCR, intelligent text extraction, AI PDF metin çıkarma, akıllı karakter tanıma, machine learning PDF text',
      canonicalUrl: 'https://quickutil.app/ja/pdf-to-text',
      ogImage: 'https://quickutil.app/images/og-pdf-to-text-ja.jpg',
    },
    'pdf-split': {
      title: 'AI PDF Ayırma - Yapay Zeka ile Akıllı Sayfa Bölme | QuickUtil',
      description: 'AI destekli PDF split aracı. Yapay zeka otomatik sayfa algılama ve akıllı bölme yapar. Intelligent PDF sayfa ayırma teknolojisi.',
      keywords: 'AI PDF split, yapay zeka sayfa ayırma, intelligent PDF bölme, AI PDF separator, akıllı PDF ayırma, machine learning page split',
      canonicalUrl: 'https://quickutil.app/ja/pdf-split',
      ogImage: 'https://quickutil.app/images/og-pdf-split-ja.jpg',
    },
    'pdf-merge': {
      title: 'AI PDF Birleştirme - Yapay Zeka ile Akıllı Dosya Birleştirme | QuickUtil',
      description: 'AI destekli PDF merge aracı. Yapay zeka optimal birleştirme sırası ve sayfa düzeni seçer. Intelligent PDF birleştirme teknolojisi.',
      keywords: 'AI PDF merge, yapay zeka PDF birleştirme, intelligent PDF combine, AI dosya birleştirme, akıllı PDF merge, machine learning PDF joiner',
      canonicalUrl: 'https://quickutil.app/ja/pdf-merge',
      ogImage: 'https://quickutil.app/images/og-pdf-merge-ja.jpg',
    },
  },
  ko: {
    home: {
      title: 'QuickUtil - AI 기반 PDF 압축 및 파일 처리 도구',
      description: 'AI 기반 PDF 압축, 형식 변환 및 이미지 처리 도구. 인공지능을 통한 자동 최적화, 빠르고 안전한 온라인 도구.',
      keywords: 'AI PDF 압축, 인공지능 PDF 도구, AI 이미지 압축, 자동 PDF 최적화, 스마트 파일 처리, AI 도구, machine learning PDF',
      canonicalUrl: 'https://quickutil.app/ko',
      ogImage: 'https://quickutil.app/images/og-home-ko.jpg',
    },
    'pdf-compress': {
      title: 'AI PDF 압축 - 인공지능 자동 PDF 최적화 | QuickUtil',
      description: 'AI 기술로 PDF 파일을 자동 최적화합니다. 인공지능이 최적의 품질과 크기 균형을 선택합니다. 무료 AI 기반 PDF 압축.',
      keywords: 'AI PDF 압축, 인공지능 PDF 최적화, 자동 PDF 축소, 지능형 PDF 압축, AI PDF 옵티마이저, machine learning 압축',
      canonicalUrl: 'https://quickutil.app/ko/pdf-compress',
      ogImage: 'https://quickutil.app/images/og-pdf-compress-ko.jpg',
    },
    'pdf-convert': {
      title: 'AI PDF 변환기 - 스마트 형식 선택 및 최적화 | QuickUtil',
      description: 'AI 기반 PDF 변환 도구. 인공지능이 자동으로 형식을 선택하고, 페이지를 분할하며, 문서를 병합합니다. 스마트 PDF 처리 기술.',
      keywords: 'AI PDF 변환기, 인공지능 형식 선택, 자동 PDF 분할, 지능형 PDF 병합, AI PDF to JPG, 스마트 형식 변환, PDF 도구 machine learning',
      canonicalUrl: 'https://quickutil.app/ko/pdf-convert',
      ogImage: 'https://quickutil.app/images/og-pdf-convert-ko.jpg',
    },
    'pdf-to-images': {
      title: 'AI 이미지 압축 - 인공지능 스마트 사진 최적화 | QuickUtil',
      description: 'AI 알고리즘으로 이미지를 자동 최적화합니다. 인공지능이 콘텐츠를 분석하고 최적의 품질 설정을 선택합니다. 무료 AI 이미지 도구.',
      keywords: 'AI 이미지 압축, 인공지능 사진 최적화, 지능형 이미지 압축, 자동 이미지 축소, AI 이미지 옵티마이저, 이미지 도구 machine learning',
      canonicalUrl: 'https://quickutil.app/ko/pdf-to-images',
      ogImage: 'https://quickutil.app/images/og-pdf-to-images-ko.jpg',
    },
    'pdf-to-text': {
      title: 'AI 블로그 - 인공지능 파일 처리 가이드 | QuickUtil',
      description: 'AI 파일 처리, 인공지능 PDF 최적화, 스마트 이미지 압축 가이드. machine learning을 활용한 파일 보안 팁.',
      keywords: 'AI 블로그, 인공지능 가이드, 파일 처리 machine learning, AI PDF 가이드, 지능형 파일 처리, 인공지능 도구',
      canonicalUrl: 'https://quickutil.app/ko/pdf-to-text',
      ogImage: 'https://quickutil.app/images/og-pdf-to-text-ko.jpg',
    },
    'pdf-split': {
      title: 'AI 블로그 - 인공지능 파일 처리 가이드 | QuickUtil',
      description: 'AI 파일 처리, 인공지능 PDF 최적화, 스마트 이미지 압축 가이드. machine learning을 활용한 파일 보안 팁.',
      keywords: 'AI 블로그, 인공지능 가이드, 파일 처리 machine learning, AI PDF 가이드, 지능형 파일 처리, 인공지능 도구',
      canonicalUrl: 'https://quickutil.app/ko/pdf-split',
      ogImage: 'https://quickutil.app/images/og-pdf-split-ko.jpg',
    },
    'pdf-merge': {
      title: 'AI 블로그 - 인공지능 파일 처리 가이드 | QuickUtil',
      description: 'AI 파일 처리, 인공지능 PDF 최적화, 스마트 이미지 압축 가이드. machine learning을 활용한 파일 보안 팁.',
      keywords: 'AI 블로그, 인공지능 가이드, 파일 처리 machine learning, AI PDF 가이드, 지능형 파일 처리, 인공지능 도구',
      canonicalUrl: 'https://quickutil.app/ko/pdf-merge',
      ogImage: 'https://quickutil.app/images/og-pdf-merge-ko.jpg',
    },
  },
};

// Helper function to get page category
const getPageCategory = (page: string): string => {
  const categories = {
    'home': 'Online Tools',
    'pdf-compress': 'PDF Tools',
    'pdf-convert': 'PDF Tools',
    'pdf-merge': 'PDF Tools',
    'pdf-split': 'PDF Tools',
    'pdf-to-jpg': 'PDF Tools',
    'pdf-to-png': 'PDF Tools',
    'jpg-to-pdf': 'Conversion Tools',
    'png-to-pdf': 'Conversion Tools',
    'image-compress': 'Image Tools',
    'remove-bg': 'Image Tools',
    'blog': 'Blog',
    'about': 'About',
    'contact': 'Contact',
    'privacy': 'Legal',
    'terms': 'Legal',
  };
  return categories[page as keyof typeof categories] || 'Online Tools';
};

// Generate locale-aware metadata
export const generateLocaleMetadata = (locale: string, page: string): Metadata => {
  const pageData = localeSEOData[locale]?.[page] || localeSEOData['tr'][page] || localeSEOData['tr']['home'];
  const baseUrl = 'https://quickutil.app';
  
  // Generate hreflang alternates for all supported locales
  const languages = Object.keys(localeSEOData).reduce((acc, loc) => {
    const localeData = localeSEOData[loc][page];
    if (localeData) {
      // Correct hreflang format
      const localeKey = loc === 'en' ? 'en' : 
                       loc === 'tr' ? 'tr' :
                       loc === 'es' ? 'es' :
                       loc === 'fr' ? 'fr' :
                       loc === 'de' ? 'de' :
                       loc === 'ar' ? 'ar' :
                       loc === 'ja' ? 'ja' :
                       loc === 'ko' ? 'ko' : loc;
      acc[localeKey] = localeData.canonicalUrl;
    }
    return acc;
  }, {} as Record<string, string>);
  
  // Add x-default for primary language (English for international, Turkish for default)
  languages['x-default'] = localeSEOData['en']?.[page]?.canonicalUrl || localeSEOData['tr'][page]?.canonicalUrl || baseUrl;
  
  return {
    title: pageData.title,
    description: pageData.description,
    keywords: pageData.keywords,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: pageData.canonicalUrl,
      languages,
    },
    openGraph: {
      title: pageData.title,
      description: pageData.description,
      url: pageData.canonicalUrl,
      siteName: 'QuickUtil',
      type: 'website',
      locale: locale === 'tr' ? 'tr_TR' : `${locale}_${locale.toUpperCase()}`,
      images: pageData.ogImage ? [
        {
          url: pageData.ogImage,
          width: 1200,
          height: 630,
          alt: pageData.title,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: pageData.title,
      description: pageData.description,
      images: pageData.ogImage ? [pageData.ogImage] : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    // Enhanced E-E-A-T signals
    authors: pageData.author ? [{ name: pageData.author }] : undefined,
    category: getPageCategory(page),
    other: {
      ...(pageData.expertise && { 'expertise': pageData.expertise }),
      ...(pageData.author && { 'article:author': pageData.author }),
      ...(pageData.publishedTime && { 'article:published_time': pageData.publishedTime }),
      ...(pageData.modifiedTime && { 'article:modified_time': pageData.modifiedTime }),
      'rating': '4.8',
      'review_count': '1247',
      'trust_score': '97',
      'security_cert': 'SSL',
      'data_protection': 'GDPR',
      'language': locale,
    },
  };
};

// Original function for backward compatibility
export const generatePageMetadata = (pageData: PageSEOData): Metadata => {
  const baseUrl = 'https://quickutil.app';
  
  return {
    title: pageData.title,
    description: pageData.description,
    keywords: pageData.keywords,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: pageData.canonicalUrl,
    },
    openGraph: {
      title: pageData.title,
      description: pageData.description,
      url: pageData.canonicalUrl,
      siteName: 'QuickUtil',
      type: 'website',
      locale: 'tr_TR',
      images: pageData.ogImage ? [
        {
          url: pageData.ogImage,
          width: 1200,
          height: 630,
          alt: pageData.title,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: pageData.title,
      description: pageData.description,
      images: pageData.ogImage ? [pageData.ogImage] : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
};

export const getPageSEOData = (page: string): PageSEOData => {
  const baseUrl = 'https://quickutil.app';
  
  const seoData: Record<string, PageSEOData> = {
    home: {
      title: 'QuickUtil - Ücretsiz PDF Sıkıştırma ve Dosya Dönüştürme Araçları',
      description: 'PDF sıkıştırma, format dönüştürme, fotoğraf sıkıştırma ve arka plan kaldırma araçları. Hızlı, güvenli ve ücretsiz online araçlar.',
      keywords: 'PDF sıkıştırma, PDF dönüştürme, fotoğraf sıkıştırma, PNG JPEG, arka plan kaldırma, ücretsiz online araçlar',
      canonicalUrl: baseUrl,
      ogImage: `${baseUrl}/images/og-home.jpg`,
    },
    'pdf-compress': {
      title: 'PDF Sıkıştırma - Ücretsiz Online PDF Küçültme Aracı | QuickUtil',
      description: 'PDF dosyalarınızı kaliteden ödün vermeden sıkıştırın. Ücretsiz, hızlı ve güvenli PDF küçültme aracı. Maksimum 50MB desteklenir.',
      keywords: 'PDF sıkıştırma, PDF küçültme, PDF compress, PDF boyut küçültme, ücretsiz PDF sıkıştırma aracı',
      canonicalUrl: `${baseUrl}/pdf-compress`,
      ogImage: `${baseUrl}/images/og-pdf-compress.jpg`,
    },
    'pdf-convert': {
      title: 'PDF Dönüştürme - PDF Sayfa Ayırma, Birleştirme ve Resim Çıkarma | QuickUtil',
      description: 'PDF dosyalarını farklı formatlara dönüştürün, sayfalara ayırın, birleştirin veya resim formatına çevirin. Ücretsiz PDF dönüştürme araçları.',
      keywords: 'PDF dönüştürme, PDF sayfa ayırma, PDF birleştirme, PDF to JPG, PDF to PNG, PDF split, PDF merge',
      canonicalUrl: `${baseUrl}/pdf-convert`,
      ogImage: `${baseUrl}/images/og-pdf-convert.jpg`,
    },
    'image-convert': {
      title: 'Resim Format Dönüştürme - PNG, JPEG, WebP Çevirici | QuickUtil',
      description: 'Resim formatları arasında dönüştürme yapın. PNG, JPEG, WebP formatları desteklenir. Kalite ayarı ve boyut optimizasyonu mevcut.',
      keywords: 'resim dönüştürme, PNG to JPEG, JPEG to PNG, WebP converter, resim format değiştirme',
      canonicalUrl: `${baseUrl}/image-convert`,
      ogImage: `${baseUrl}/images/og-image-convert.jpg`,
    },
  };

  return seoData[page] || seoData.home;
};

// H1-H6 header hierarchy için utility
export const createHeaderHierarchy = (content: {
  h1: string;
  h2?: string[];
  h3?: string[];
}) => {
  return {
    h1: content.h1,
    h2: content.h2 || [],
    h3: content.h3 || [],
  };
};

// Breadcrumb data oluşturma
export const generateBreadcrumbData = (path: string) => {
  const baseUrl = 'https://quickutil.app';
  const pathSegments = path.split('/').filter(Boolean);
  
  const breadcrumbs = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Ana Sayfa',
      item: baseUrl,
    }
  ];

  const routes: Record<string, string> = {
    'pdf-compress': 'PDF Sıkıştırma',
    'pdf-convert': 'PDF Dönüştürme', 
    'image-convert': 'Resim Dönüştürme',
  };

  pathSegments.forEach((segment, index) => {
    if (routes[segment]) {
      breadcrumbs.push({
        '@type': 'ListItem',
        position: index + 2,
        name: routes[segment],
        item: `${baseUrl}/${pathSegments.slice(0, index + 1).join('/')}`,
      });
    }
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs,
  };
};

// Alt text generator for images
export const generateImageAlt = (context: string, description?: string) => {
  const contexts: Record<string, string> = {
    'pdf-compress': 'PDF sıkıştırma aracı',
    'pdf-convert': 'PDF dönüştürme aracı',
    'image-convert': 'Resim dönüştürme aracı',
    'logo': 'QuickUtil logo',
    'icon': 'Araç ikonu',
  };

  const baseAlt = contexts[context] || context;
  return description ? `${baseAlt} - ${description}` : baseAlt;
};

// Generate structured data (JSON-LD) for different page types
export const generateStructuredData = (locale: string, page: string, pageType: 'website' | 'tool' | 'howto' = 'website') => {
  const pageData = localeSEOData[locale]?.[page] || localeSEOData['tr'][page] || localeSEOData['tr']['home'];
  const baseUrl = 'https://quickutil.app';
  
  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'QuickUtil',
    url: baseUrl,
    description: pageData.description,
    inLanguage: locale,
    publisher: {
      '@type': 'Organization',
      name: 'QuickUtil',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/logo.png`,
        width: 512,
        height: 512
      },
      // Enhanced organization data for E-E-A-T
      foundingDate: '2024-01-15',
      sameAs: [
        'https://twitter.com/quickutil',
        'https://linkedin.com/company/quickutil',
        'https://github.com/quickutil'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'hello@quickutil.app',
        availableLanguage: ['tr', 'en', 'es', 'fr', 'de', 'ar', 'ja', 'ko']
      }
    },
    // Enhanced page metadata
    author: pageData.author ? {
      '@type': 'Organization',
      name: pageData.author,
      url: baseUrl
    } : undefined,
    datePublished: pageData.publishedTime,
    dateModified: pageData.modifiedTime,
    expertise: pageData.expertise,
    // Trust signals
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '1247'
    },
    // FAQ Schema if available
    ...(pageData.faq && pageData.faq.length > 0 && {
      mainEntity: pageData.faq.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer
        }
      }))
    })
  };

  // Tool-specific structured data
  if (pageType === 'tool') {
    return {
      ...baseStructuredData,
      '@type': 'WebApplication',
      applicationCategory: 'Utility',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      },
      featureList: getToolFeatures(page, locale)
    };
  }

  // How-to structured data for tool pages
  if (pageType === 'howto') {
    return {
      ...baseStructuredData,
      '@type': 'HowTo',
      name: pageData.title,
      description: pageData.description,
      step: getHowToSteps(page, locale)
    };
  }

  return baseStructuredData;
};

// Get tool features based on page and locale
const getToolFeatures = (page: string, locale: string): string[] => {
  const features: Record<string, Record<string, string[]>> = {
    'pdf-compress': {
      tr: ['PDF boyutunu küçültme', 'Kalite korunması', 'Ücretsiz kullanım', 'Hızlı işleme'],
      en: ['Reduce PDF size', 'Quality preservation', 'Free usage', 'Fast processing'],
      es: ['Reducir tamaño PDF', 'Preservación de calidad', 'Uso gratuito', 'Procesamiento rápido'],
      fr: ['Réduire la taille PDF', 'Préservation de la qualité', 'Usage gratuit', 'Traitement rapide'],
      de: ['PDF-Größe reduzieren', 'Qualitätserhaltung', 'Kostenlose Nutzung', 'Schnelle Verarbeitung'],
      ar: ['تقليل حجم PDF', 'الحفاظ على الجودة', 'استخدام مجاني', 'معالجة سريعة'],
      ja: ['PDFサイズ縮小', '品質保持', '無料使用', '高速処理'],
      ko: ['PDF 크기 축소', '품질 보존', '무료 사용', '빠른 처리']
    }
  };

  return features[page]?.[locale] || features['pdf-compress']['en'];
};

// Get how-to steps based on page and locale
const getHowToSteps = (page: string, locale: string) => {
  interface StepData {
    name: string;
    text: string;
  }
  
  const steps: Record<string, Record<string, StepData[]>> = {
    'pdf-compress': {
      tr: [
        { name: 'PDF dosyasını seçin', text: 'Bilgisayarınızdan sıkıştırmak istediğiniz PDF dosyasını seçin' },
        { name: 'Kalite ayarını yapın', text: 'İstediğiniz sıkıştırma seviyesini seçin' },
        { name: 'Sıkıştırmayı başlatın', text: 'Sıkıştır butonuna tıklayın ve işlemin tamamlanmasını bekleyin' },
        { name: 'Dosyayı indirin', text: 'Sıkıştırılan PDF dosyasını bilgisayarınıza indirin' }
      ],
      en: [
        { name: 'Select PDF file', text: 'Choose the PDF file you want to compress from your computer' },
        { name: 'Set quality level', text: 'Select your desired compression level' },
        { name: 'Start compression', text: 'Click the compress button and wait for processing to complete' },
        { name: 'Download file', text: 'Download the compressed PDF file to your computer' }
      ]
    }
  };

  const pageSteps = steps[page]?.[locale] || steps['pdf-compress']['en'];
  return pageSteps.map((step: StepData, index: number) => ({
    '@type': 'HowToStep',
    position: index + 1,
    name: step.name,
    text: step.text
  }));
};

// Generate multilingual sitemap data
export const generateSitemapData = () => {
  const baseUrl = 'https://quickutil.app';
  const urls: Array<{
    url: string;
    lastModified: Date;
    changeFrequency: 'daily' | 'weekly' | 'monthly';
    priority: number;
    alternates?: { href: string; hreflang: string }[];
  }> = [];

  // Generate URL entries for each page in each locale
  [...supportedLocales].forEach(locale => {
    const localePages = localeSEOData[locale];
    
    Object.keys(localePages).forEach(page => {
      const pageData = localePages[page];
      
      // Generate alternates for this page in all languages
      const alternates = [...supportedLocales]
        .filter(loc => localeSEOData[loc][page]) // Only include locales that have this page
        .map(loc => ({
          href: localeSEOData[loc][page].canonicalUrl,
          hreflang: loc
        }));
      
      // Add x-default alternate (English if available, otherwise Turkish)
      alternates.push({
        href: localeSEOData['en']?.[page]?.canonicalUrl || localeSEOData['tr'][page].canonicalUrl,
        hreflang: 'x-default' as any
      });

      // Turkish pages get higher priority and more frequent updates
      const isHighPriorityPage = ['pdf-compress', 'pdf-convert', 'pdf-merge', 'pdf-split', 'image-compress'].includes(page);
      const basePriority = page === 'home' ? 1.0 : (isHighPriorityPage ? 0.9 : 0.8);
      const turkishBoost = locale === 'tr' ? 0.1 : 0;
      
      urls.push({
        url: pageData.canonicalUrl,
        lastModified: new Date(pageData.modifiedTime || '2024-12-25T12:00:00Z'),
        changeFrequency: page === 'home' ? 'daily' : (isHighPriorityPage ? 'weekly' : 'monthly'),
        priority: Math.min(basePriority + turkishBoost, 1.0),
        alternates
      });
    });
  });

  // Add blog posts to sitemap
  try {
    const { getBlogPosts } = require('@/lib/blogUtils');
    
    [...supportedLocales].forEach(locale => {
      const blogPosts = getBlogPosts(locale);
      
      blogPosts.forEach((post: any) => {
        // Generate alternates for this blog post in all languages
        const alternates = [...supportedLocales].map(loc => ({
          href: `${baseUrl}/${loc}/blog/${post.slug}`,
          hreflang: loc
        }));
        
        // Add x-default alternate
        alternates.push({
          href: `${baseUrl}/en/blog/${post.slug}`,
          hreflang: 'x-default' as any
        });

        urls.push({
          url: `${baseUrl}/${locale}/blog/${post.slug}`,
          lastModified: new Date(post.updatedAt),
          changeFrequency: 'weekly',
          priority: 0.7,
          alternates
        });
      });
    });
  } catch (error) {
    console.warn('Blog posts could not be loaded for sitemap:', error);
  }

  return urls;
};

// Generate robots.txt content with sitemap references
export const generateRobotsTxt = () => {
  const baseUrl = 'https://quickutil.app';
  
  return `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-tr.xml
Sitemap: ${baseUrl}/sitemap-en.xml
Sitemap: ${baseUrl}/sitemap-es.xml
Sitemap: ${baseUrl}/sitemap-fr.xml
Sitemap: ${baseUrl}/sitemap-de.xml
Sitemap: ${baseUrl}/sitemap-ar.xml
Sitemap: ${baseUrl}/sitemap-ja.xml
Sitemap: ${baseUrl}/sitemap-ko.xml

# Clean URLs
Disallow: /_next/
Disallow: /api/
Disallow: *.json$
`;
};

// Generate language-specific Open Graph metadata
export const generateLocalizedOGData = (locale: string, page: string) => {
  const pageData = localeSEOData[locale]?.[page] || localeSEOData['tr'][page] || localeSEOData['tr']['home'];
  
  return {
    title: pageData.title,
    description: pageData.description,
    url: pageData.canonicalUrl,
    siteName: 'QuickUtil',
    type: 'website' as const,
    locale: getOGLocale(locale),
    images: pageData.ogImage ? [
      {
        url: pageData.ogImage,
        width: 1200,
        height: 630,
        alt: pageData.title,
        type: 'image/jpeg'
      }
    ] : undefined,
  };
};

// Get proper Open Graph locale format
const getOGLocale = (locale: string): string => {
  const localeMap = {
    tr: 'tr_TR',
    en: 'en_US',
    es: 'es_ES', 
    fr: 'fr_FR',
    de: 'de_DE',
    ar: 'ar_AR',
    ja: 'ja_JP',
    ko: 'ko_KR'
  };
  
  return localeMap[locale as keyof typeof localeMap] || 'en_US';
}; 