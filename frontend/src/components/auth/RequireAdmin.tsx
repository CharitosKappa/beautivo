'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { getAccessToken } from '@/lib/auth';

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  useEffect(() => {
    if (pathname?.endsWith('/admin/login')) {
      return;
    }
    const token = getAccessToken();
    if (!token) {
      router.replace(`/${locale}/admin/login`);
    }
  }, [router, locale, pathname]);

  return <>{children}</>;
}
