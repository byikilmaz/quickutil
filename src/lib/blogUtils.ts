import { BlogPost, BlogCategory } from '@/types/database';

// Blog kategorileri
export const blogCategories: Record<string, BlogCategory[]> = {
  tr: [
    { id: 'pdf-tools', name: 'PDF Araçları', slug: 'pdf-araclari', description: 'PDF dosyalarını işlemek için rehberler', locale: 'tr' },
    { id: 'image-tools', name: 'Resim Araçları', slug: 'resim-araclari', description: 'Resim düzenleme ve dönüştürme rehberleri', locale: 'tr' },
    { id: 'security', name: 'Güvenlik', slug: 'guvenlik', description: 'Dosya güvenliği ve gizlilik rehberleri', locale: 'tr' },
  ],
  en: [
    { id: 'pdf-tools', name: 'PDF Tools', slug: 'pdf-tools', description: 'Guides for processing PDF files', locale: 'en' },
    { id: 'image-tools', name: 'Image Tools', slug: 'image-tools', description: 'Image editing and conversion guides', locale: 'en' },
    { id: 'security', name: 'Security', slug: 'security', description: 'File security and privacy guides', locale: 'en' },
  ],
  es: [
    { id: 'pdf-tools', name: 'Herramientas PDF', slug: 'herramientas-pdf', description: 'Guías para procesar archivos PDF', locale: 'es' },
    { id: 'image-tools', name: 'Herramientas de Imagen', slug: 'herramientas-imagen', description: 'Guías de edición y conversión de imágenes', locale: 'es' },
    { id: 'security', name: 'Seguridad', slug: 'seguridad', description: 'Guías de seguridad y privacidad de archivos', locale: 'es' },
  ],
  fr: [
    { id: 'pdf-tools', name: 'Outils PDF', slug: 'outils-pdf', description: 'Guides pour traiter les fichiers PDF', locale: 'fr' },
    { id: 'image-tools', name: "Outils d'Image", slug: 'outils-image', description: "Guides d'édition et de conversion d'images", locale: 'fr' },
    { id: 'security', name: 'Sécurité', slug: 'securite', description: 'Guides de sécurité et de confidentialité des fichiers', locale: 'fr' },
  ],
  de: [
    { id: 'pdf-tools', name: 'PDF-Tools', slug: 'pdf-tools', description: 'Anleitungen zur Verarbeitung von PDF-Dateien', locale: 'de' },
    { id: 'image-tools', name: 'Bild-Tools', slug: 'bild-tools', description: 'Bildbearbeitung und Konvertierungsanleitungen', locale: 'de' },
    { id: 'security', name: 'Sicherheit', slug: 'sicherheit', description: 'Dateisicherheit und Datenschutzanleitungen', locale: 'de' },
  ],
  ar: [
    { id: 'pdf-tools', name: 'أدوات PDF', slug: 'adawat-pdf', description: 'أدلة لمعالجة ملفات PDF', locale: 'ar' },
    { id: 'image-tools', name: 'أدوات الصور', slug: 'adawat-suwar', description: 'أدلة تحرير وتحويل الصور', locale: 'ar' },
    { id: 'security', name: 'الأمان', slug: 'al-aman', description: 'أدلة أمان الملفات والخصوصية', locale: 'ar' },
  ],
  ja: [
    { id: 'pdf-tools', name: 'PDFツール', slug: 'pdf-tsuru', description: 'PDFファイル処理のガイド', locale: 'ja' },
    { id: 'image-tools', name: '画像ツール', slug: 'gazou-tsuru', description: '画像編集と変換のガイド', locale: 'ja' },
    { id: 'security', name: 'セキュリティ', slug: 'sekyuriti', description: 'ファイルセキュリティとプライバシーのガイド', locale: 'ja' },
  ],
  ko: [
    { id: 'pdf-tools', name: 'PDF 도구', slug: 'pdf-dogu', description: 'PDF 파일 처리 가이드', locale: 'ko' },
    { id: 'image-tools', name: '이미지 도구', slug: 'image-dogu', description: '이미지 편집 및 변환 가이드', locale: 'ko' },
    { id: 'security', name: '보안', slug: 'boan', description: '파일 보안 및 프라이버시 가이드', locale: 'ko' },
  ],
};

// Blog yazıları
export const blogPosts: Record<string, BlogPost[]> = {
  tr: [
    {
      id: 'pdf-sikistirma-rehberi',
      slug: 'pdf-sikistirma-rehberi',
      title: 'PDF Sıkıştırma Rehberi: Dosya Boyutunu %70 Azaltın',
      excerpt: 'PDF dosyalarınızı kaliteden ödün vermeden nasıl sıkıştıracağınızı öğrenin. Dosya boyutunu önemli ölçüde azaltmak için profesyonel teknikler ve araçlar.',
      content: `# PDF Sıkıştırma Rehberi: Dosya Boyutunu %70 Azaltın

PDF dosyaları dijital hayatımızın ayrılmaz bir parçası haline geldi. İş sunumlarından e-kitaplara, resmi belgelerden ödev teslimlerine kadar her yerde kullanıyoruz. Ancak yüksek kaliteli PDF dosyaları genellikle oldukça büyük olabiliyor ve paylaşım, depolama ve yükleme süreçlerinde zorluklar yaşatıyor.

## PDF Sıkıştırma Nedir?

PDF sıkıştırma, dosya boyutunu azaltmak için kullanılan teknik bir süreçtir. Bu süreç, dosyanın içeriğini korurken gereksiz veri parçacıklarını kaldırır ve görüntü kalitesini optimize eder.

### Sıkıştırma Türleri

1. **Kayıpsız Sıkıştırma**: Orijinal kaliteyi korur
2. **Kayıplı Sıkıştırma**: Dosya boyutunu daha fazla azaltır ancak hafif kalite kaybına neden olur
3. **Hibrit Sıkıştırma**: Her iki yöntemi de kullanır

## PDF Sıkıştırmanın Faydaları

### 1. Depolama Alanı Tasarrufu
Sıkıştırılmış PDF dosyaları %70'e kadar daha az yer kaplar. Bu, özellikle bulut depolama hizmetleri kullananlar için önemli tasarruf sağlar.

### 2. Hızlı Paylaşım
Küçük dosyalar daha hızlı yüklenir ve indirilir. E-posta eklerinde boyut sınırları varsa, sıkıştırma kaçınılmaz hale gelir.

### 3. Bant Genişliği Optimizasyonu
Web sitelerinde kullanılan PDF dosyaları sıkıştırıldığında, sayfa yükleme süreleri önemli ölçüde iyileşir.

## PDF Sıkıştırma Teknikleri

### Görüntü Optimizasyonu
- **DPI Ayarları**: Web için 150 DPI, baskı için 300 DPI yeterlidir
- **Renk Derinliği**: Gereksiz renk kanallarını kaldırın
- **Formatlar**: JPEG sıkıştırması kullanın

### Font Optimizasyonu
- **Alt Kümeli Fontlar**: Sadece kullanılan karakterleri dahil edin
- **Gömülü Fontlar**: Gereksiz olanları kaldırın

### Metadata Temizliği
- **Yorumlar ve Notlar**: Gereksiz açıklamaları silin
- **Sürüm Geçmişi**: Eski revizyon bilgilerini kaldırın

## QuickUtil ile PDF Sıkıştırma

QuickUtil.app, PDF sıkıştırmayı inanılmaz derecede basit hale getirir:

### Adım 1: Dosyayı Yükleyin
Sürükle-bırak özelliği ile dosyanızı kolayca yükleyin.

### Adım 2: Sıkıştırma Seviyesini Seçin
- **Düşük Sıkıştırma**: %30-40 boyut azalması
- **Orta Sıkıştırma**: %50-60 boyut azalması
- **Yüksek Sıkıştırma**: %70-80 boyut azalması

### Adım 3: İndirin
Sıkıştırılmış dosyanız saniyeler içinde hazır!

## Güvenlik ve Gizlilik

QuickUtil.app'te tüm dosyalar:
- **SSL şifrelemesi** ile korunur
- **Otomatik silme** özelliği ile 24 saat sonra silinir
- **Sunucu tarafında işleme** yoktur, tüm işlemler tarayıcınızda yapılır

## Sonuç

PDF sıkıştırma, modern dijital dünyada vazgeçilmez bir beceridir. Doğru araçlar ve tekniklerle, dosyalarınızı kaliteden ödün vermeden %70'e kadar küçültebilirsiniz. QuickUtil.app ile bu işlem hiç olmadığı kadar kolay ve güvenli!

**PDF sıkıştırma hakkında daha fazla bilgi almak veya hemen başlamak için [QuickUtil.app](https://quickutil.app/tr/pdf-compress) adresini ziyaret edin.**`,
      author: 'QuickUtil Ekibi',
      publishedAt: '2024-01-15',
      updatedAt: '2024-01-15',
      readingTime: 8,
      category: 'pdf-tools',
      tags: ['PDF', 'Sıkıştırma', 'Dosya Boyutu', 'Optimizasyon'],
      image: '/images/blog/pdf-compression-guide.jpg',
      locale: 'tr',
      seoTitle: 'PDF Sıkıştırma Rehberi: Dosya Boyutunu %70 Azaltın | QuickUtil',
      seoDescription: 'PDF dosyalarınızı kaliteden ödün vermeden nasıl sıkıştıracağınızı öğrenin. Ücretsiz araçlar ve profesyonel teknikler.',
      seoKeywords: 'PDF sıkıştırma, dosya boyutu azaltma, PDF optimizasyon, online PDF araçları',
    },
    {
      id: 'resim-formatlari-rehberi',
      slug: 'resim-formatlari-rehberi',
      title: 'Resim Formatları ve Dönüştürme: Hangi Format Ne Zaman Kullanılır?',
      excerpt: 'JPEG, PNG, WebP, SVG... Hangi resim formatını ne zaman kullanacağınızı öğrenin ve görsellerinizi optimize edin.',
      content: `# Resim Formatları ve Dönüştürme: Hangi Format Ne Zaman Kullanılır?

Dijital dünyada resim formatları, görsel içeriklerin kalitesi ve performansı açısından kritik öneme sahiptir. Doğru formatı seçmek, web sitenizin yüklenme hızından dosya boyutuna kadar birçok faktörü etkileyebilir.

## Popüler Resim Formatları

### JPEG (Joint Photographic Experts Group)
JPEG, fotoğraflar için en yaygın kullanılan formattır.

**Avantajları:**
- Küçük dosya boyutu
- Milyonlarca renk desteği
- Evrensel uyumluluk
- Ayarlanabilir kalite seviyesi

**Dezavantajları:**
- Kayıplı sıkıştırma
- Şeffaflık desteği yok
- Animasyon desteği yok

**Ne Zaman Kullanılır:**
- Fotoğraflar
- Gerçekçi görüntüler
- Sosyal medya paylaşımları

### PNG (Portable Network Graphics)
PNG, şeffaflık gerektiren görseller için ideal formattır.

**Avantajları:**
- Kayıpsız sıkıştırma
- Şeffaflık desteği
- Yüksek kalite
- Web desteği

**Dezavantajları:**
- Büyük dosya boyutu
- Animasyon desteği yok

**Ne Zaman Kullanılır:**
- Logolar
- İkonlar
- Şeffaf arka plan gerektiren görseller
- Keskin kenarlı görseller

### WebP
Google tarafından geliştirilen modern format.

**Avantajları:**
- JPEG'den %25-35 daha küçük
- PNG'den %26 daha küçük
- Şeffaflık desteği
- Animasyon desteği

**Dezavantajları:**
- Sınırlı tarayıcı desteği
- Eski sistemlerde sorunlar

**Ne Zaman Kullanılır:**
- Modern web siteleri
- Performans kritik uygulamalar
- Mobil uygulamalar

## QuickUtil ile Resim Dönüştürme

QuickUtil.app, resim dönüştürme işlemini son derece basit hale getirir:

### Desteklenen Formatlar
- **Giriş**: JPEG, PNG, WebP, BMP, TIFF, GIF
- **Çıkış**: JPEG, PNG, WebP, PDF

### Özellikler
- **Toplu dönüştürme**: Birden fazla dosya
- **Kalite ayarları**: Özelleştirilebilir
- **Boyut ayarları**: Genişlik ve yükseklik
- **Anlık önizleme**: Sonucu görmek

## Sonuç

Doğru resim formatını seçmek, web performansı ve kullanıcı deneyimi açısından kritik öneme sahiptir. QuickUtil.app ile bu dönüştürme işlemlerini kolayca gerçekleştirebilir ve görsellerinizi optimize edebilirsiniz.

**Resim dönüştürme araçlarını keşfetmek için [QuickUtil.app](https://quickutil.app/tr/image-convert) adresini ziyaret edin.**`,
      author: 'QuickUtil Ekibi',
      publishedAt: '2024-01-10',
      updatedAt: '2024-01-10',
      readingTime: 12,
      category: 'image-tools',
      tags: ['Resim Formatları', 'Dönüştürme', 'Web Optimizasyonu', 'JPEG', 'PNG', 'WebP'],
      image: '/images/blog/image-formats-guide.jpg',
      locale: 'tr',
      seoTitle: 'Resim Formatları Rehberi: JPEG, PNG, WebP Karşılaştırması | QuickUtil',
      seoDescription: 'Hangi resim formatını ne zaman kullanacağınızı öğrenin. JPEG, PNG, WebP, SVG formatlarının avantajları ve kullanım alanları.',
      seoKeywords: 'resim formatları, JPEG vs PNG, WebP dönüştürme, resim optimizasyonu, web performance',
    },
    {
      id: 'dosya-guvenligi-rehberi',
      slug: 'dosya-guvenligi-rehberi',
      title: 'Dosya Güvenliği ve Gizlilik: Online Araçları Güvenle Kullanın',
      excerpt: 'Online dosya işleme araçlarını kullanırken dikkat etmeniz gereken güvenlik önlemleri ve gizlilik koruması.',
      content: `# Dosya Güvenliği ve Gizlilik: Online Araçları Güvenle Kullanın

Dijital çağda dosya güvenliği, kişisel ve profesyonel hayatımızın vazgeçilmez bir parçası haline geldi. Online araçlar kullanırken verilerimizin güvende olduğundan emin olmak, hem bireysel kullanıcılar hem de kurumlar için kritik öneme sahiptir.

## Dosya Güvenliği Nedir?

Dosya güvenliği, dijital dosyaların yetkisiz erişim, değişiklik veya silme işlemlerinden korunmasını sağlayan önlemler bütünüdür.

## QuickUtil.app Güvenlik Önlemleri

### 1. Client-Side Processing
Dosyalarınız sunucularımıza yüklenmez, tüm işlemler tarayıcınızda yapılır.

### 2. SSL Şifrelemesi
256-bit SSL şifrelemesi ile tüm veri aktarımları korunur.

### 3. Otomatik Silme
Geçici dosyalar 24 saat sonra otomatik olarak silinir.

## Sonuç

Online araçlar kullanırken güvenlik, her zaman önceliğiniz olmalıdır. QuickUtil.app olarak, kullanıcılarımızın güvenliğini en üst seviyede tutmak için sürekli çalışıyoruz.

**Güvenli dosya işleme araçlarını keşfetmek için [QuickUtil.app](https://quickutil.app/tr) adresini ziyaret edin.**`,
      author: 'QuickUtil Güvenlik Ekibi',
      publishedAt: '2024-01-05',
      updatedAt: '2024-01-05',
      readingTime: 15,
      category: 'security',
      tags: ['Güvenlik', 'Gizlilik', 'SSL', 'Veri Koruma', 'GDPR', 'Online Araçlar'],
      image: '/images/blog/file-security-guide.jpg',
      locale: 'tr',
      seoTitle: 'Online Dosya Güvenliği Rehberi: Verilerinizi Koruyun | QuickUtil',
      seoDescription: 'Online dosya işleme araçlarını güvenle kullanın. SSL şifrelemesi, GDPR uyumluluğu ve güvenlik önlemleri hakkında kapsamlı rehber.',
      seoKeywords: 'dosya güvenliği, online araç güvenliği, veri koruma, SSL şifrelemesi, GDPR, gizlilik',
    },
  ],
  en: [
    {
      id: 'pdf-compression-guide',
      slug: 'pdf-compression-guide',
      title: 'PDF Compression Guide: Reduce File Size by 70% Without Quality Loss',
      excerpt: 'Learn how to compress PDF files without compromising quality. Professional techniques and tools to reduce file size significantly.',
      content: `# PDF Compression Guide: Reduce File Size by 70% Without Quality Loss

PDF files have become an integral part of our digital lives. From business presentations to e-books, official documents to homework submissions, we use them everywhere.

## What is PDF Compression?

PDF compression is a technical process used to reduce file size. This process removes unnecessary data fragments while preserving the file's content and optimizes image quality.

## Benefits of PDF Compression

### 1. Storage Space Saving
Compressed PDF files take up to 70% less space.

### 2. Fast Sharing
Smaller files upload and download faster.

### 3. Bandwidth Optimization
When PDF files used on websites are compressed, page loading times improve significantly.

## PDF Compression with QuickUtil

QuickUtil.app makes PDF compression incredibly simple:

### Step 1: Upload File
Easily upload your file with drag-and-drop feature.

### Step 2: Choose Compression Level
- **Low Compression**: 30-40% size reduction
- **Medium Compression**: 50-60% size reduction
- **High Compression**: 70-80% size reduction

### Step 3: Download
Your compressed file is ready in seconds!

## Conclusion

PDF compression is an indispensable skill in the modern digital world. With QuickUtil.app, this process has never been easier and more secure!

**Visit [QuickUtil.app](https://quickutil.app/en/pdf-compress) to learn more about PDF compression.**`,
      author: 'QuickUtil Team',
      publishedAt: '2024-01-15',
      updatedAt: '2024-01-15',
      readingTime: 8,
      category: 'pdf-tools',
      tags: ['PDF', 'Compression', 'File Size', 'Optimization'],
      image: '/images/blog/pdf-compression-guide.jpg',
      locale: 'en',
      seoTitle: 'PDF Compression Guide: Reduce File Size by 70% | QuickUtil',
      seoDescription: 'Learn how to compress PDF files without quality loss. Free tools and professional techniques for optimal file size reduction.',
      seoKeywords: 'PDF compression, reduce file size, PDF optimization, online PDF tools',
    },
    {
      id: 'image-formats-guide',
      slug: 'image-formats-guide',
      title: 'Image Formats Guide: When to Use JPEG, PNG, WebP, and SVG',
      excerpt: 'JPEG, PNG, WebP, SVG... Learn which image format to use when and optimize your visuals for best performance.',
      content: `# Image Formats Guide: When to Use JPEG, PNG, WebP, and SVG

In the digital world, image formats are critically important for visual content quality and performance.

## Popular Image Formats

### JPEG (Joint Photographic Experts Group)
JPEG is the most widely used format for photographs.

**Advantages:**
- Small file size
- Support for millions of colors
- Universal compatibility

**When to Use:**
- Photographs
- Realistic images
- Social media posts

### PNG (Portable Network Graphics)
PNG is the ideal format for images requiring transparency.

**Advantages:**
- Lossless compression
- Transparency support
- High quality

**When to Use:**
- Logos
- Icons
- Images requiring transparent background

## Image Conversion with QuickUtil

QuickUtil.app makes image conversion extremely simple:

### Supported Formats
- **Input**: JPEG, PNG, WebP, BMP, TIFF, GIF
- **Output**: JPEG, PNG, WebP, PDF

## Conclusion

Choosing the right image format is critically important for web performance. With QuickUtil.app, you can easily optimize your visuals.

**Visit [QuickUtil.app](https://quickutil.app/en/image-convert) to explore image conversion tools.**`,
      author: 'QuickUtil Team',
      publishedAt: '2024-01-10',
      updatedAt: '2024-01-10',
      readingTime: 12,
      category: 'image-tools',
      tags: ['Image Formats', 'Conversion', 'Web Optimization', 'JPEG', 'PNG', 'WebP'],
      image: '/images/blog/image-formats-guide.jpg',
      locale: 'en',
      seoTitle: 'Image Formats Guide: JPEG vs PNG vs WebP Comparison | QuickUtil',
      seoDescription: 'Learn which image format to use when. Advantages and use cases of JPEG, PNG, WebP, and SVG formats.',
      seoKeywords: 'image formats, JPEG vs PNG, WebP conversion, image optimization, web performance',
    },
    {
      id: 'file-security-guide',
      slug: 'file-security-guide',
      title: 'File Security and Privacy: Using Online Tools Safely',
      excerpt: 'Security measures and privacy protection you should consider when using online file processing tools.',
      content: `# File Security and Privacy: Using Online Tools Safely

In the digital age, file security has become an indispensable part of our personal and professional lives.

## What is File Security?

File security is a set of measures that protect digital files from unauthorized access, modification, or deletion.

## QuickUtil.app Security Measures

### 1. Client-Side Processing
Your files are not uploaded to our servers; all processing is done in your browser.

### 2. SSL Encryption
All data transmissions are protected with 256-bit SSL encryption.

### 3. Automatic Deletion
Temporary files are automatically deleted after 24 hours.

## Conclusion

When using online tools, security should always be your priority. As QuickUtil.app, we continuously work to keep our users' security at the highest level.

**Visit [QuickUtil.app](https://quickutil.app/en) to explore secure file processing tools.**`,
      author: 'QuickUtil Security Team',
      publishedAt: '2024-01-05',
      updatedAt: '2024-01-05',
      readingTime: 15,
      category: 'security',
      tags: ['Security', 'Privacy', 'SSL', 'Data Protection', 'GDPR', 'Online Tools'],
      image: '/images/blog/file-security-guide.jpg',
      locale: 'en',
      seoTitle: 'Online File Security Guide: Protect Your Data | QuickUtil',
      seoDescription: 'Use online file processing tools safely. Comprehensive guide on SSL encryption, GDPR compliance, and security measures.',
      seoKeywords: 'file security, online tool security, data protection, SSL encryption, GDPR, privacy',
    },
  ],
  // Diğer dillerdeki blog yazıları kısaltılmış halde
  es: [],
  fr: [],
  de: [],
  ar: [],
  ja: [],
  ko: [],
};

// Blog utility functions
export function getBlogPosts(locale: string): BlogPost[] {
  return blogPosts[locale] || [];
}

export function getBlogPost(locale: string, slug: string): BlogPost | null {
  const posts = getBlogPosts(locale);
  return posts.find(post => post.slug === slug) || null;
}

export function getBlogCategories(locale: string): BlogCategory[] {
  return blogCategories[locale] || [];
}

export function getBlogPostsByCategory(locale: string, categorySlug: string): BlogPost[] {
  const posts = getBlogPosts(locale);
  const category = getBlogCategories(locale).find(cat => cat.slug === categorySlug);
  
  if (!category) return [];
  
  return posts.filter(post => post.category === category.id);
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
} 