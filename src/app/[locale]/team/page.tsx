import StructuredData from '@/components/StructuredData';
import { getTranslations } from '@/lib/translations';
import Image from 'next/image';
import { 
  UserGroupIcon,
  HeartIcon,
  BoltIcon,
  ChartBarIcon,
  UserIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  ArrowTopRightOnSquareIcon
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
    tr: 'Ekibimiz | QuickUtil.app - Innovatif PDF ve Dosya İşleme Araçları',
    en: 'Our Team | QuickUtil.app - Innovative PDF and File Processing Tools',
    es: 'Nuestro Equipo | QuickUtil.app - Herramientas Innovadoras de PDF y Archivos',
    fr: 'Notre Équipe | QuickUtil.app - Outils PDF et Fichiers Innovants',
    de: 'Unser Team | QuickUtil.app - Innovative PDF- und Dateiverarbeitungstools',
    ar: 'فريقنا | QuickUtil.app - أدوات مبتكرة لمعالجة PDF والملفات',
    ja: 'チーム | QuickUtil.app - 革新的なPDFおよびファイル処理ツール',
    ko: '팀 | QuickUtil.app - 혁신적인 PDF 및 파일 처리 도구'
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.tr,
    description: locale === 'tr' ? 'QuickUtil.app ekibimizle tanışın - deneyimli ve tutkulu profesyoneller' : 
                 locale === 'en' ? 'Meet the QuickUtil.app team - experienced and passionate professionals' :
                 'Conoce al equipo de QuickUtil.app - profesionales experimentados y apasionados',
    openGraph: {
      title: titles[locale as keyof typeof titles] || titles.tr,
      description: locale === 'tr' ? 'Innovatif çözümler üreten ekibimiz' : 'Our team creating innovative solutions',
      type: 'website',
    }
  };
}

export default async function TeamPage({ params }: Props) {
  const { locale } = await params;
  const finalLocale = locale || 'tr';
  const t = getTranslations(finalLocale);

  // Safe access to team data with fallbacks
  const teamData = t && typeof t === 'object' && 'team' in t ? (t as any).team : null;

  const stats = [
    {
      icon: <UserGroupIcon className="w-8 h-8" />,
      number: '3+',
      label: finalLocale === 'tr' ? 'Ekip Üyesi' : finalLocale === 'en' ? 'Team Members' : finalLocale === 'fr' ? 'Membres de l\'Équipe' : 'Miembros del Equipo'
    },
    {
      icon: <ChartBarIcon className="w-8 h-8" />,
      number: '10+',
      label: finalLocale === 'tr' ? 'Yıl Deneyim' : finalLocale === 'en' ? 'Years Experience' : finalLocale === 'fr' ? 'Années d\'Expérience' : 'Años de Experiencia'
    },
    {
      icon: <HeartIcon className="w-8 h-8" />,
      number: '100K+',
      label: finalLocale === 'tr' ? 'Mutlu Kullanıcı' : finalLocale === 'en' ? 'Happy Users' : finalLocale === 'fr' ? 'Utilisateurs Satisfaits' : 'Usuarios Felices'
    },
    {
      icon: <BoltIcon className="w-8 h-8" />,
      number: '24/7',
      label: finalLocale === 'tr' ? 'Destek' : finalLocale === 'en' ? 'Support' : finalLocale === 'fr' ? 'Support 24/7' : 'Soporte'
    }
  ];

  const teamMembers = [
    {
      name: teamData?.alexandra?.name || 'Alexandra Thompson',
      role: teamData?.alexandra?.role || 'Founder & CEO',
      bio: teamData?.alexandra?.bio || 'Computer Engineering graduate from Stanford. Founded QuickUtil.app with 10+ years of technology experience.',
      image: '/images/team/alexandra-thompson.webp',
      social: {
        linkedin: '#',
        twitter: '#'
      }
    },
    {
      name: teamData?.michael?.name || 'Michael Rodriguez',
      role: teamData?.michael?.role || 'Chief Technology Officer (CTO)',
      bio: teamData?.michael?.bio || 'Software Engineering graduate from MIT. 12 years of enterprise software development experience.',
      image: '/images/team/michael-rodriguez.webp',
      social: {
        linkedin: '#',
        github: '#'
      }
    },
    {
      name: teamData?.sarah?.name || 'Sarah Williams',
      role: teamData?.sarah?.role || 'Lead Designer',
      bio: teamData?.sarah?.bio || 'Graduate of Parsons School of Design. 8 years of experience in UX/UI design.',
      image: '/images/team/sarah-williams.webp',
      social: {
        linkedin: '#',
        dribbble: '#'
      }
    }
  ];

  return (
    <>
      <StructuredData type="website" />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative container mx-auto px-4 py-20">
            <div className="text-center max-w-4xl mx-auto">
              <UserGroupIcon className="w-20 h-20 text-blue-200 mx-auto mb-6" />
              <h1 className="text-5xl font-bold mb-6">
                {teamData?.title || (finalLocale === 'tr' ? 'Ekibimiz' : finalLocale === 'en' ? 'Our Team' : 'Nuestro Equipo')}
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                {teamData?.subtitle || (finalLocale === 'tr' ? 'İnovatif çözümler üretmeye odaklanan deneyimli ekibimiz' : finalLocale === 'en' ? 'Meet our experienced and passionate team focused on creating innovative solutions' : 'Conoce nuestro equipo experimentado y apasionado')}
              </p>
              <p className="text-lg text-blue-50 max-w-3xl mx-auto">
                {teamData?.intro || (finalLocale === 'tr' ? 'QuickUtil.app\'i güçlü kılan şey, sürekli gelişim ve yenilik odaklı yaklaşımımızdır.' : finalLocale === 'en' ? 'What makes QuickUtil.app powerful is our approach focused on continuous development and innovation.' : 'Lo que hace poderoso a QuickUtil.app es nuestro enfoque centrado en el desarrollo continuo.')}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white py-16 border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</h3>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Members Section */}
        <div className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {finalLocale === 'tr' ? 'Takım Üyelerimiz' : 
                 finalLocale === 'en' ? 'Meet Our Team' :
                 finalLocale === 'fr' ? 'Rencontrez Notre Équipe' :
                 'Conoce a Nuestro Equipo'}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {teamMembers.map((member, index) => (
                <div key={index} className="group">
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-200">
                    {/* Photo Container */}
                    <div className="relative h-80 overflow-hidden">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Social Links Overlay */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex space-x-3">
                          {Object.entries(member.social || {}).map(([platform, url]) => (
                            <a
                              key={platform}
                              href={url as string}
                              className="w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-gray-700 hover:text-blue-600 transition-colors duration-300"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                        {member.name}
                      </h3>
                      <p className="text-blue-600 font-semibold mb-4 uppercase tracking-wide text-sm">
                        {member.role}
                      </p>
                      <p className="text-gray-600 leading-relaxed text-sm">
                        {member.bio}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Join Team Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <BuildingOfficeIcon className="w-16 h-16 text-blue-200 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-6">
              {teamData?.joinTeam || (finalLocale === 'tr' ? 'Ekibimize Katılın' : finalLocale === 'en' ? 'Join Our Team' : 'Únete a Nuestro Equipo')}
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              {teamData?.joinDescription || (finalLocale === 'tr' ? 'Büyüyen ekibimizin bir parçası olmak ister misiniz?' : finalLocale === 'en' ? 'Would you like to be part of our growing team and make a difference?' : '¿Te gustaría ser parte de nuestro equipo en crecimiento?')}
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <MapPinIcon className="w-8 h-8 text-blue-200 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {finalLocale === 'tr' ? 'Uzaktan Çalışma' : 
                   finalLocale === 'en' ? 'Remote Work' :
                   finalLocale === 'fr' ? 'Travail à Distance' :
                   'Trabajo Remoto'}
                </h3>
                <p className="text-blue-100">
                  {finalLocale === 'tr' ? 'Dünyanın her yerinden çalışabilme imkanı' : 
                   finalLocale === 'en' ? 'Work from anywhere in the world' :
                   finalLocale === 'fr' ? 'Travaillez de n\'importe où dans le monde' :
                   'Trabaja desde cualquier lugar del mundo'}
                </p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <HeartIcon className="w-8 h-8 text-blue-200 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {finalLocale === 'tr' ? 'Harika Kültür' : 
                   finalLocale === 'en' ? 'Great Culture' :
                   finalLocale === 'fr' ? 'Grande Culture' :
                   'Gran Cultura'}
                </h3>
                <p className="text-blue-100">
                  {finalLocale === 'tr' ? 'İnovasyonu destekleyen pozitif çalışma ortamı' : 
                   finalLocale === 'en' ? 'Positive work environment supporting innovation' :
                   finalLocale === 'fr' ? 'Environnement de travail positif favorisant l\'innovation' :
                   'Ambiente de trabajo positivo que apoya la innovación'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:careers@quickutil.app"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors duration-300 shadow-lg hover:shadow-xl"
              >
                <UserIcon className="w-5 h-5 mr-2" />
                {teamData?.openPositions || (finalLocale === 'tr' ? 'Açık Pozisyonlar' : finalLocale === 'en' ? 'View Open Positions' : 'Posiciones Abiertas')}
              </a>
              <a
                href="mailto:hello@quickutil.app"
                className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-colors duration-300"
              >
                {teamData?.contact || (finalLocale === 'tr' ? 'İletişim' : finalLocale === 'en' ? 'Contact Us' : 'Contacto')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 