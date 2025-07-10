import ImageFormatConvertClient from './ImageFormatConvertClient';

// Debug: Server Component
console.log('🌐 Image Format Convert Server Component loaded');

interface ImageFormatConvertPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ImageFormatConvertPage({ params }: ImageFormatConvertPageProps) {
  const { locale } = await params;
  
  console.log('🌐 Server Component - locale resolved:', locale);

  return <ImageFormatConvertClient locale={locale} />;
} 