'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function LocaleDetector() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Sadece root path'de çalış
    if (pathname !== '/') return;

    // Varsayılan olarak TR'ye yönlendir
    router.replace('/tr');
  }, [pathname, router]);

  // Bu component görsel bir şey render etmez
  return null;
} 