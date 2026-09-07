'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { visitorApi } from '@/lib/api';

const STORAGE_KEY = 'cador_visitor_id';

function getOrCreateVisitorId(): { id: string; isReturning: boolean } {
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) return { id: existing, isReturning: true };
    const id = `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(STORAGE_KEY, id);
    return { id, isReturning: false };
  } catch {
    return { id: `v_${Date.now().toString(36)}`, isReturning: false };
  }
}

function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) return 'tablet';
  if (/Mobile|Android|iPhone|iPod|Windows Phone|Opera Mini/i.test(ua)) return 'mobile';
  return 'desktop';
}

export default function VisitorTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith('/admin') || pathname === '/login') return;
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    const { id, isReturning } = getOrCreateVisitorId();

    visitorApi
      .track({
        path: pathname,
        deviceType: getDeviceType(),
        isReturning,
        visitorId: id,
      })
      .catch(() => {});
  }, [pathname]);

  return null;
}
