import { getBlogPosts, getBlogCategories } from '@/lib/blogUtils';
import Image from 'next/image';
import Link from 'next/link';
import { generateLocaleMetadata } from '@/lib/seoUtils';
import StructuredData from '@/components/StructuredData';

interface BlogPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: BlogPageProps) {
  const { locale } = await params;
  
  return generateLocaleMetadata(locale, 'blog');
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;
  const posts = getBlogPosts(locale);
  const categories = getBlogCategories(locale);

  // const t = useTranslations('blog');

  const pageData = {
    tr: {
      title: 'Blog',
      subtitle: 'Dosya işleme konularında en güncel rehberler ve ipuçları',
      allCategories: 'Tüm Kategoriler',
      readMore: 'Devamını Oku',
      readTime: 'dakika okuma',
      publishedOn: 'yayınlandı',
    },
    en: {
      title: 'Blog',
      subtitle: 'Latest guides and tips on file processing topics',
      allCategories: 'All Categories',
      readMore: 'Read More',
      readTime: 'min read',
      publishedOn: 'published on',
    },
    es: {
      title: 'Blog',
      subtitle: 'Las guías y consejos más recientes sobre temas de procesamiento de archivos',
      allCategories: 'Todas las Categorías',
      readMore: 'Leer Más',
      readTime: 'min de lectura',
      publishedOn: 'publicado el',
    },
    fr: {
      title: 'Blog',
      subtitle: 'Les derniers guides et conseils sur les sujets de traitement de fichiers',
      allCategories: 'Toutes les Catégories',
      readMore: 'Lire Plus',
      readTime: 'min de lecture',
      publishedOn: 'publié le',
    },
    de: {
      title: 'Blog',
      subtitle: 'Neueste Anleitungen und Tipps zu Dateiverarbeitungsthemen',
      allCategories: 'Alle Kategorien',
      readMore: 'Mehr Lesen',
      readTime: 'Min. Lesezeit',
      publishedOn: 'veröffentlicht am',
    },
    ar: {
      title: 'المدونة',
      subtitle: 'أحدث الأدلة والنصائح حول مواضيع معالجة الملفات',
      allCategories: 'جميع الفئات',
      readMore: 'اقرأ المزيد',
      readTime: 'دقيقة قراءة',
      publishedOn: 'نُشر في',
    },
    ja: {
      title: 'ブログ',
      subtitle: 'ファイル処理に関する最新のガイドとヒント',
      allCategories: 'すべてのカテゴリ',
      readMore: '続きを読む',
      readTime: '分で読める',
      publishedOn: '公開日',
    },
    ko: {
      title: '블로그',
      subtitle: '파일 처리 주제에 대한 최신 가이드 및 팁',
      allCategories: '모든 카테고리',
      readMore: '더 읽기',
      readTime: '분 읽기',
      publishedOn: '게시일',
    },
  };

  const content = pageData[locale as keyof typeof pageData] || pageData.en;

  return (
    <>
      <StructuredData
        page="blog"
        type="website"
        locale={locale}
        customData={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: content.title,
          description: content.subtitle,
          url: `https://quickutil.app/${locale}/blog`,
        }}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{content.title}</h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">{content.subtitle}</p>
        </div>

        {/* Kategoriler */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors">
            {content.allCategories}
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className="bg-gray-100 text-gray-800 px-6 py-2 rounded-full font-medium hover:bg-gray-200 transition-colors"
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Blog Yazıları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <span>{post.readingTime} {content.readTime}</span>
                  <span className="mx-2">•</span>
                  <span>{content.publishedOn} {new Date(post.publishedAt).toLocaleDateString(locale)}</span>
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  <Link href={`/${locale}/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h2>
                
                <p className="text-gray-700 mb-4 line-clamp-3">{post.excerpt}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <Link
                    href={`/${locale}/blog/${post.slug}`}
                    className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
                  >
                    {content.readMore} →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {locale === 'tr' ? 'Henüz blog yazısı bulunmuyor.' : 'No blog posts available yet.'}
            </p>
          </div>
        )}
      </div>
    </>
  );
} 