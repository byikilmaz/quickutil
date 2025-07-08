import StructuredData from '@/components/StructuredData';
import { getTranslations } from '@/lib/translations';
import Image from 'next/image';
import Link from 'next/link';
import {
  SparklesIcon,
  UserGroupIcon,
  RocketLaunchIcon,
  CogIcon,
  ChartBarIcon,
  GlobeAltIcon,
  EyeIcon,
  StarIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  HeartIcon,
  GlobeAltIcon as LeafIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  
  const titles = {
    tr: 'Hikayemiz | QuickUtil.app - Kurulumdan Bugüne Yolculuğumuz',
    en: 'Our Story | QuickUtil.app - Journey from Foundation to Today',
    es: 'Nuestra Historia | QuickUtil.app - Viaje desde la Fundación hasta Hoy',
    fr: 'Notre Histoire | QuickUtil.app - Voyage de la Fondation à Aujourd\'hui',
    de: 'Unsere Geschichte | QuickUtil.app - Reise von der Gründung bis Heute',
    ar: 'قصتنا | QuickUtil.app - الرحلة من التأسيس إلى اليوم',
    ja: '私たちの物語 | QuickUtil.app - 創設から今日までの道のり',
    ko: '우리의 이야기 | QuickUtil.app - 창립부터 오늘까지의 여정'
  };
  
  const descriptions = {
    tr: 'QuickUtil.app\'in kuruluş hikayesi, vizyonumuz ve değerlerimiz. Stanford mezunu girişimcilerin dosya işleme alanında devrim yaratma yolculuğu.',
    en: 'The founding story, vision and values of QuickUtil.app. The journey of Stanford graduate entrepreneurs revolutionizing the file processing field.',
    es: 'La historia de fundación, visión y valores de QuickUtil.app. El viaje de emprendedores graduados de Stanford revolucionando el campo del procesamiento de archivos.',
    fr: 'L\'histoire de fondation, la vision et les valeurs de QuickUtil.app. Le voyage d\'entrepreneurs diplômés de Stanford révolutionnant le domaine du traitement de fichiers.',
    de: 'Die Gründungsgeschichte, Vision und Werte von QuickUtil.app. Die Reise von Stanford-Absolventen-Unternehmern, die das Dateiverarbeitungsfeld revolutionieren.',
    ar: 'قصة التأسيس والرؤية والقيم لـ QuickUtil.app. رحلة رواد الأعمال خريجي ستانفورد في ثورة مجال معالجة الملفات.',
    ja: 'QuickUtil.appの創設ストーリー、ビジョン、価値観。スタンフォード卒の起業家たちがファイル処理分野を革命する旅。',
    ko: 'QuickUtil.app의 창립 이야기, 비전 및 가치. 스탠포드 졸업 기업가들이 파일 처리 분야를 혁신하는 여정.'
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.tr,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.tr,
    openGraph: {
      title: titles[locale as keyof typeof titles] || titles.tr,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.tr,
      images: ['/images/logo.svg'],
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale as keyof typeof titles] || titles.tr,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.tr,
    },
  };
}

export default async function StoryPage({ params }: Props) {
  const { locale } = await params;
  const finalLocale = locale || 'tr';
  const t = getTranslations(finalLocale);

  // Safe access to story data with fallbacks
  const storyData = t && typeof t === 'object' && 'story' in t ? (t as any).story : null;

  // Timeline data with icons
  const timelineItems = [
    {
      year: '2019',
      title: storyData?.timeline?.[2019]?.title || (finalLocale === 'tr' ? 'Fikirlerin Doğuşu' : 'Birth of Ideas'),
      description: storyData?.timeline?.[2019]?.description || '',
      icon: LightBulbIcon,
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      year: '2020',
      title: storyData?.timeline?.[2020]?.title || (finalLocale === 'tr' ? 'Ekibin Bir Araya Gelmesi' : 'Team Coming Together'),
      description: storyData?.timeline?.[2020]?.description || '',
      icon: UserGroupIcon,
      color: 'from-blue-400 to-purple-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      year: '2021',
      title: storyData?.timeline?.[2021]?.title || (finalLocale === 'tr' ? 'İlk Adımlar' : 'First Steps'),
      description: storyData?.timeline?.[2021]?.description || '',
      icon: RocketLaunchIcon,
      color: 'from-green-400 to-blue-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      year: '2022',
      title: storyData?.timeline?.[2022]?.title || (finalLocale === 'tr' ? 'Platform Lansmanı' : 'Platform Launch'),
      description: storyData?.timeline?.[2022]?.description || '',
      icon: SparklesIcon,
      color: 'from-purple-400 to-pink-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      year: '2023',
      title: storyData?.timeline?.[2023]?.title || (finalLocale === 'tr' ? 'Büyüme ve Gelişim' : 'Growth and Development'),
      description: storyData?.timeline?.[2023]?.description || '',
      icon: ChartBarIcon,
      color: 'from-indigo-400 to-blue-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600'
    },
    {
      year: '2024',
      title: storyData?.timeline?.[2024]?.title || (finalLocale === 'tr' ? 'Global Genişleme' : 'Global Expansion'),
      description: storyData?.timeline?.[2024]?.description || '',
      icon: GlobeAltIcon,
      color: 'from-teal-400 to-green-500',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600'
    },
    {
      year: '2025',
      title: storyData?.timeline?.[2025]?.title || (finalLocale === 'tr' ? 'Gelecek Vizyonu' : 'Future Vision'),
      description: storyData?.timeline?.[2025]?.description || '',
      icon: EyeIcon,
      color: 'from-rose-400 to-pink-500',
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-600'
    }
  ];

  const values = [
    {
      name: storyData?.values?.items?.[0]?.name || (finalLocale === 'tr' ? 'Kullanıcı Odaklılık' : 'User Focus'),
      description: storyData?.values?.items?.[0]?.description || '',
      icon: HeartIcon,
      color: 'from-red-400 to-pink-500'
    },
    {
      name: storyData?.values?.items?.[1]?.name || (finalLocale === 'tr' ? 'Gizlilik & Güvenlik' : 'Privacy & Security'),
      description: storyData?.values?.items?.[1]?.description || '',
      icon: ShieldCheckIcon,
      color: 'from-blue-400 to-indigo-500'
    },
    {
      name: storyData?.values?.items?.[2]?.name || (finalLocale === 'tr' ? 'Sürekli İnovasyon' : 'Continuous Innovation'),
      description: storyData?.values?.items?.[2]?.description || '',
      icon: CogIcon,
      color: 'from-purple-400 to-pink-500'
    },
    {
      name: storyData?.values?.items?.[3]?.name || (finalLocale === 'tr' ? 'Sürdürülebilirlik' : 'Sustainability'),
      description: storyData?.values?.items?.[3]?.description || '',
      icon: LeafIcon,
      color: 'from-green-400 to-teal-500'
    }
  ];

  return (
    <>
      <StructuredData type="website" />
      
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 text-white overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-20 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-10 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <Image
                  src="/images/logo.svg"
                  alt="QuickUtil.app"
                  width={120}
                  height={120}
                  className="animate-bounce-in"
                />
                <div className="absolute -inset-4 rounded-full bg-white/10 blur-xl"></div>
              </div>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              {storyData?.title || (finalLocale === 'tr' ? 'Hikayemiz' : 'Our Story')}
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              {storyData?.subtitle || (finalLocale === 'tr' ? 'QuickUtil.app\'in kuruluş hikayesi ve vizyonumuz' : 'The founding story and vision of QuickUtil.app')}
            </p>
            
            <p className="text-lg text-blue-50 max-w-3xl mx-auto mb-12">
              {storyData?.intro || (finalLocale === 'tr' ? 'QuickUtil.app, dosya işleme alanında devrim yaratma hayaliyle kuruldu...' : 'QuickUtil.app was founded with the dream of revolutionizing the file processing field...')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/${finalLocale}/team`}
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                <UserGroupIcon className="w-5 h-5 mr-2" />
                {finalLocale === 'tr' ? 'Ekibimizle Tanışın' : 'Meet Our Team'}
              </Link>
              
              <Link
                href={`/${finalLocale}/#tools`}
                className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                {storyData?.cta?.button || (finalLocale === 'tr' ? 'Hemen Başlayın' : 'Get Started Now')}
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {finalLocale === 'tr' ? 'Yolculuğumuz' : 'Our Journey'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {finalLocale === 'tr' ? 'QuickUtil.app\'in kuruluşundan bugüne kadar geçirdiği önemli aşamalar' : 'The important milestones QuickUtil.app has gone through from its foundation to today'}
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-0.5 h-full w-1 bg-gradient-to-b from-blue-400 via-purple-500 to-pink-500 rounded-full"></div>
            
            <div className="space-y-24">
              {timelineItems.map((item, index) => (
                <div key={item.year} className={`relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <div className={`w-5/12 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12 text-left'}`}>
                    <div className={`bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-500 hover:scale-105 border-l-4 ${index % 2 === 0 ? 'animate-slide-in-left' : 'animate-slide-in-right'}`}
                         style={{borderLeftColor: `rgb(${index % 2 === 0 ? '59 130 246' : '147 51 234'})`}}>
                      
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${item.color} text-white mb-6 ${index % 2 === 0 ? 'ml-auto' : 'mr-auto'}`}>
                        <item.icon className="w-8 h-8" />
                      </div>
                      
                      <div className="text-4xl font-bold text-gray-900 mb-4">{item.year}</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                  
                  {/* Timeline Dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white border-4 border-blue-500 rounded-full shadow-lg z-10"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision Section */}
      <div className="py-24 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-8">
                <RocketLaunchIcon className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-bold mb-6">
                {storyData?.mission?.title || (finalLocale === 'tr' ? 'Misyonumuz' : 'Our Mission')}
              </h3>
              <p className="text-xl text-blue-100 leading-relaxed">
                {storyData?.mission?.description || (finalLocale === 'tr' ? 'Dosya işleme işlemlerini herkes için kolay, hızlı ve güvenli hale getirmek...' : 'To make file processing operations easy, fast, and secure for everyone...')}
              </p>
            </div>
            
            <div className="text-center md:text-left">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-8">
                <EyeIcon className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-bold mb-6">
                {storyData?.vision?.title || (finalLocale === 'tr' ? 'Vizyonumuz' : 'Our Vision')}
              </h3>
              <p className="text-xl text-blue-100 leading-relaxed">
                {storyData?.vision?.description || (finalLocale === 'tr' ? 'Dünya\'nın en güvenilir ve kullanıcı dostu dosya işleme platformu olmak...' : 'To be the world\'s most reliable and user-friendly file processing platform...')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {storyData?.values?.title || (finalLocale === 'tr' ? 'Değerlerimiz' : 'Our Values')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {finalLocale === 'tr' ? 'QuickUtil.app\'i yönlendiren temel değerler ve ilkeler' : 'The core values and principles that guide QuickUtil.app'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-xl p-8 text-center transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${value.color} text-white mb-6`}>
                  <value.icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.name}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <StarIcon className="w-16 h-16 mx-auto mb-8 text-yellow-400" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {storyData?.cta?.title || (finalLocale === 'tr' ? 'Hikayemizin Parçası Olun' : 'Be Part of Our Story')}
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            {storyData?.cta?.description || (finalLocale === 'tr' ? 'Milyonlarca kullanıcının tercih ettiği QuickUtil.app ile dosya işleme deneyiminizi dönüştürün' : 'Transform your file processing experience with QuickUtil.app, the choice of millions of users')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/${finalLocale}/#tools`}
              className="inline-flex items-center px-12 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              {storyData?.cta?.button || (finalLocale === 'tr' ? 'Hemen Başlayın' : 'Get Started Now')}
              <ArrowRightIcon className="w-6 h-6 ml-2" />
            </Link>
            
            <Link
              href={`/${finalLocale}/team`}
              className="inline-flex items-center px-12 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300"
            >
              <UserGroupIcon className="w-6 h-6 mr-2" />
              {finalLocale === 'tr' ? 'Ekibimiz' : 'Our Team'}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
} 