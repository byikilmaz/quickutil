import { getBlogPost, getBlogPosts } from '@/lib/blogUtils';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import StructuredData from '@/components/StructuredData';

interface BlogPostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const locales = ['tr', 'en', 'es', 'fr', 'de', 'ar', 'ja', 'ko'];
  const paths: { locale: string; slug: string }[] = [];

  locales.forEach(locale => {
    const posts = getBlogPosts(locale);
    posts.forEach(post => {
      paths.push({ locale, slug: post.slug });
    });
  });

  return paths;
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  const post = getBlogPost(locale, slug);

  if (!post) {
    return {
      title: 'Blog Yazısı Bulunamadı | QuickUtil',
      description: 'Aradığınız blog yazısı bulunamadı.',
    };
  }

  return {
    title: post.seoTitle,
    description: post.seoDescription,
    keywords: post.seoKeywords,
    metadataBase: new URL('https://quickutil.app'),
    alternates: {
      canonical: `https://quickutil.app/${locale}/blog/${slug}`,
    },
    openGraph: {
      title: post.seoTitle,
      description: post.seoDescription,
      url: `https://quickutil.app/${locale}/blog/${slug}`,
      siteName: 'QuickUtil',
      type: 'article',
      locale: locale === 'tr' ? 'tr_TR' : `${locale}_${locale.toUpperCase()}`,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: post.tags,
      images: post.image ? [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seoTitle,
      description: post.seoDescription,
      images: post.image ? [post.image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  const post = getBlogPost(locale, slug);

  if (!post) {
    notFound();
  }

  const content = {
    tr: {
      backToBlog: '← Blog\'a Dön',
      publishedOn: 'yayınlandı',
      readTime: 'dakika okuma',
      author: 'Yazar',
      tags: 'Etiketler',
      shareArticle: 'Makaleyi Paylaş',
      relatedPosts: 'İlgili Yazılar',
    },
    en: {
      backToBlog: '← Back to Blog',
      publishedOn: 'published on',
      readTime: 'min read',
      author: 'Author',
      tags: 'Tags',
      shareArticle: 'Share Article',
      relatedPosts: 'Related Posts',
    },
    es: {
      backToBlog: '← Volver al Blog',
      publishedOn: 'publicado el',
      readTime: 'min de lectura',
      author: 'Autor',
      tags: 'Etiquetas',
      shareArticle: 'Compartir Artículo',
      relatedPosts: 'Artículos Relacionados',
    },
    fr: {
      backToBlog: '← Retour au Blog',
      publishedOn: 'publié le',
      readTime: 'min de lecture',
      author: 'Auteur',
      tags: 'Tags',
      shareArticle: 'Partager l\'Article',
      relatedPosts: 'Articles Connexes',
    },
    de: {
      backToBlog: '← Zurück zum Blog',
      publishedOn: 'veröffentlicht am',
      readTime: 'Min. Lesezeit',
      author: 'Autor',
      tags: 'Tags',
      shareArticle: 'Artikel Teilen',
      relatedPosts: 'Ähnliche Artikel',
    },
    ar: {
      backToBlog: '← العودة للمدونة',
      publishedOn: 'نُشر في',
      readTime: 'دقيقة قراءة',
      author: 'الكاتب',
      tags: 'العلامات',
      shareArticle: 'مشاركة المقال',
      relatedPosts: 'مقالات ذات صلة',
    },
    ja: {
      backToBlog: '← ブログに戻る',
      publishedOn: '公開日',
      readTime: '分で読める',
      author: '著者',
      tags: 'タグ',
      shareArticle: '記事をシェア',
      relatedPosts: '関連記事',
    },
    ko: {
      backToBlog: '← 블로그로 돌아가기',
      publishedOn: '게시일',
      readTime: '분 읽기',
      author: '저자',
      tags: '태그',
      shareArticle: '기사 공유',
      relatedPosts: '관련 게시물',
    },
  };

  const text = content[locale as keyof typeof content] || content.en;

  // Article structured data
  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    author: {
      '@type': 'Organization',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'QuickUtil',
      logo: {
        '@type': 'ImageObject',
        url: 'https://quickutil.app/images/logo.png',
      },
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://quickutil.app/${locale}/blog/${slug}`,
    },
    keywords: post.tags.join(', '),
  };

  return (
    <>
      <StructuredData
        customData={articleStructuredData}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back to blog */}
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-8 transition-colors"
        >
          {text.backToBlog}
        </Link>

        {/* Article header */}
        <header className="mb-8">
          <div className="mb-6">
            <Image
              src={post.image}
              alt={post.title}
              width={1200}
              height={400}
              className="w-full h-64 md:h-96 object-cover rounded-xl"
              priority
            />
          </div>

          <div className="flex items-center text-sm text-gray-600 mb-4 space-x-4">
            <span>{text.author}: {post.author}</span>
            <span>•</span>
            <span>{text.publishedOn} {new Date(post.publishedAt).toLocaleDateString(locale)}</span>
            <span>•</span>
            <span>{post.readingTime} {text.readTime}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>

          <p className="text-xl text-gray-700 leading-relaxed">
            {post.excerpt}
          </p>
        </header>

        {/* Article content */}
        <article className="prose prose-lg max-w-none">
          <div 
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
            className="blog-content"
          />
        </article>

        {/* Tags */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{text.tags}</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Share buttons */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{text.shareArticle}</h3>
            <div className="flex gap-4">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://quickutil.app/${locale}/blog/${slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Twitter
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://quickutil.app/${locale}/blog/${slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
              >
                Facebook
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://quickutil.app/${locale}/blog/${slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-950 transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>


    </>
  );
} 