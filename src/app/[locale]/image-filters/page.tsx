import ImageFiltersClient from './ImageFiltersClient';

// Debug: Server Component
console.log('🌐 Image Filters Server Component loaded');

interface ImageFiltersPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ImageFiltersPage({ params }: ImageFiltersPageProps) {
  const { locale } = await params;
  
  console.log('🌐 Server Component - locale resolved:', locale);

  return <ImageFiltersClient locale={locale} />;
} 