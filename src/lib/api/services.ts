import api from '../api';
import type { Service } from '@/types/service';

type ServicesResponse = {
  status: string;
  code: number;
  data: Service[] | { services: Service[]; pagination?: any };
};

// Simple in-memory cache + deduplication to prevent 429s from multiple components fetching simultaneously
let servicesCache: Service[] | null = null;
let servicesCacheAt = 0;
let servicesPending: Promise<Service[]> | null = null;
const CACHE_TTL = 30_000; // 30s

function extractServices(body: ServicesResponse | any): Service[] {
  if (!body) return [];
  // body is axios response data: { status, code, data: ... }
  const data = body.data ?? body;
  if (Array.isArray(data)) return data as Service[];
  if (Array.isArray(data?.services)) return data.services as Service[];
  if (Array.isArray(body?.services)) return body.services as Service[];
  if (Array.isArray(body)) return body as Service[];
  return [];
}

function extractService(body: any): Service {
  if (!body) throw new Error('Service not found');
  const data = body.data ?? body;
  if (data?.service) return data.service as Service;
  if (data && typeof data === 'object' && data.slug) return data as Service;
  if (body?.service) return body.service as Service;
  if (body && typeof body === 'object' && body.slug) return body as Service;
  throw new Error('Service not found');
}

export const getServices = async (opts?: { force?: boolean }): Promise<Service[]> => {
  const now = Date.now();
  if (!opts?.force && servicesCache && now - servicesCacheAt < CACHE_TTL) {
    return servicesCache;
  }
  if (!opts?.force && servicesPending) {
    return servicesPending;
  }
  const promise = api
    .get<ServicesResponse>('/services')
    .then((r) => {
      const services = extractServices(r.data);
      servicesCache = services;
      servicesCacheAt = Date.now();
      return services;
    })
    .catch((err) => {
      // On error, don't cache empty, let caller handle
      throw err;
    })
    .finally(() => {
      servicesPending = null;
    });
  servicesPending = promise;
  return promise;
};

export const getServiceBySlug = async (slug: string): Promise<Service> => {
  const r = await api.get<any>(`/services/${slug}`);
  return extractService(r.data);
};

// Optional cache invalidation for admin mutations
export const invalidateServicesCache = () => {
  servicesCache = null;
  servicesCacheAt = 0;
  servicesPending = null;
};
