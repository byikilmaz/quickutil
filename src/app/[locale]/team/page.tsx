import StructuredData from '@/components/StructuredData';
import { getTranslations } from '@/lib/translations';
import { 
  UserGroupIcon,
  ClockIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  BriefcaseIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  
  const titles = {
    tr: 'Ekibimiz | QuickUtil.app - Takım Üyelerimiz',
    en: 'Our Team | QuickUtil.app - Meet Our Team',
    es: 'Nuestro Equipo | QuickUtil.app - Conoce a Nuestro Equipo',
    fr: 'Notre Équipe | QuickUtil.app - Rencontrez Notre Équipe',
    de: 'Unser Team | QuickUtil.app - Lernen Sie Unser Team Kennen',
    ar: 'فريقنا | QuickUtil.app',
    ja: '私たちのチーム | QuickUtil.app',
    ko: '우리 팀 | QuickUtil.app'
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.tr,
    description: 'Meet our experienced team at QuickUtil.app focused on creating innovative file processing solutions.',
  };
}

export default async function TeamPage({ params }: Props) {
  const { locale } = await params;
  const finalLocale = locale || 'en';
  const t = getTranslations(finalLocale);

  // Helper function for translations
  const getText = (key: string, fallback: string) => {
    return (t as any)?.[key] || fallback;
  };

  const stats = [
    {
      number: '3+',
      label: getText('team.stats.teamMembers', 'Ekip Üyesi')
    },
    {
      number: '30+',
      label: getText('team.stats.yearsExperience', 'Yıl Deneyim')
    },
    {
      number: '10K+',
      label: getText('team.stats.happyUsers', 'Mutlu Kullanıcı')
    },
    {
      number: '24/7',
      label: getText('team.stats.support', 'Destek')
    }
  ];

  const teamMembers = [
    {
      name: getText('team.alexandra.name', 'Alexandra Thompson'),
      role: getText('team.alexandra.role', 'Kurucu & CEO'),
      bio: getText('team.alexandra.bio', 'Stanford Bilgisayar Mühendisliği mezunu. 10+ yıl teknoloji deneyimi ile QuickUtil.app\'i kurdu.'),
      image: '/images/team/alexandra.jpg'
    },
    {
      name: getText('team.michael.name', 'Michael Rodriguez'),
      role: getText('team.michael.role', 'Teknik Direktör (CTO)'),
      bio: getText('team.michael.bio', 'MIT Yazılım Mühendisliği mezunu. 12 yıl kurumsal yazılım geliştirme deneyimi.'),
      image: '/images/team/michael.jpg'
    },
    {
      name: getText('team.sarah.name', 'Sarah Williams'),
      role: getText('team.sarah.role', 'Baş Tasarımcı'),
      bio: getText('team.sarah.bio', 'Parsons School of Design mezunu. 8 yıl UX/UI tasarım deneyimi.'),
      image: '/images/team/sarah.jpg'
    }
  ];

  return (
    <>
      <StructuredData type="website" />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Hero Section */}
        <div className="relative bg-white shadow-sm">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center max-w-4xl mx-auto">
              <UserGroupIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                👥 {getText('team.title', 'Ekibimiz')}
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                {getText('team.subtitle', 'İnovatif çözümler üretmeye odaklanan deneyimli ekibimiz')}
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                {getText('team.intro', 'QuickUtil.app\'i güçlü kılan şey, sürekli gelişim ve yenilik odaklı yaklaşımımızdır.')}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                  <div className="text-gray-700 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Members Section */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {getText('team.meetOurTeam', 'Takım Üyelerimiz')}
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-700 leading-relaxed text-sm">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Join Team Section */}
        <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-700">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <BriefcaseIcon className="w-16 h-16 text-white mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">
                {getText('team.joinTeam', 'Ekibimize Katılın')}
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                {getText('team.joinDescription', 'Büyüyen ekibimizin bir parçası olmak ister misiniz?')}
              </p>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <GlobeAltIcon className="w-12 h-12 text-white mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    {getText('team.remoteWork', 'Uzaktan Çalışma')}
                  </h3>
                  <p className="text-blue-100">
                    {getText('team.remoteWorkDesc', 'Dünyanın her yerinden çalışabilme imkanı')}
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <HeartIcon className="w-12 h-12 text-white mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    {getText('team.greatCulture', 'Harika Kültür')}
                  </h3>
                  <p className="text-blue-100">
                    {getText('team.greatCultureDesc', 'İnovasyonu destekleyen pozitif çalışma ortamı')}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:hello@quickutil.app"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200"
                >
                  {getText('team.openPositions', 'Açık Pozisyonlar')}
                </a>
                <a
                  href="mailto:hello@quickutil.app"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200"
                >
                  {getText('team.contact', 'İletişim')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 