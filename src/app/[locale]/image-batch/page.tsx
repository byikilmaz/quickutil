import ImageBatchClient from './ImageBatchClient';

// Debug: Server Component
console.log('🌐 Image Batch Server Component loaded');

interface ImageBatchPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ImageBatchPage({ params }: ImageBatchPageProps) {
  const { locale } = await params;
  
  console.log('🌐 Server Component - locale resolved:', locale);

  return <ImageBatchClient locale={locale} />;
} 