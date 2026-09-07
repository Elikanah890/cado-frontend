'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getServices } from '@/lib/api/services';
import type { Service } from '@/types';

const ServicesContext = createContext<Service[]>([]);

export function ServicesProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    let mounted = true;
    getServices()
      .then((list) => {
        if (mounted) setServices(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}

export function useServices() {
  return useContext(ServicesContext);
}
