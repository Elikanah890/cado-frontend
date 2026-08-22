import axios from 'axios';
import type {
  Service, Portfolio, StoreProduct, Course, BlogPost,
  BlogCategory, Testimonial, HostingPlan, Lead,
  ApiResponse, PaginatedResponse
} from '@/types';

const getBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // If frontend is served via network IP (172.*) but env is localhost, auto-switch to same host
    if (envUrl.includes('localhost') && host !== 'localhost' && host !== '127.0.0.1' && host !== '') {
      const dynamicUrl = envUrl.replace('localhost', host);
      console.log('[API] Dynamic baseURL (localhost->host):', dynamicUrl, 'from env:', envUrl);
      return dynamicUrl;
    }
    console.log('[API] Using baseURL:', envUrl, 'hostname:', host);
  }
  return envUrl;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
  withCredentials: true,
});

// Update baseURL on client side if hostname differs (for HMR)
if (typeof window !== 'undefined') {
  api.defaults.baseURL = getBaseUrl();
  // Also intercept to ensure correct host per request
  api.interceptors.request.use((config) => {
    config.baseURL = getBaseUrl();
    return config;
  });
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && error.config && !error.config._retry) {
      error.config._retry = true;
      try {
        await axios.post(`${api.defaults.baseURL}/admin/refresh`, {}, { withCredentials: true });
        return api(error.config);
      } catch {
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const publicApi = {
  getServices: () => api.get<ApiResponse<Service[]>>('/services', { params: { _t: Date.now() }, headers: { 'Cache-Control': 'no-cache' } }).then((r) => r.data),
  getService: (slug: string) => api.get<ApiResponse<Service>>(`/services/${slug}`, { params: { _t: Date.now() }, headers: { 'Cache-Control': 'no-cache' } }).then((r) => r.data),
  getPortfolio: (params?: { category?: string; featured?: string }) =>
    api.get<ApiResponse<Portfolio[]>>('/portfolio', { params: { ...params, _t: Date.now() }, headers: { 'Cache-Control': 'no-cache' } }).then((r) => r.data),
  getPortfolioItem: (slug: string) => api.get<ApiResponse<Portfolio>>(`/portfolio/${slug}`, { params: { _t: Date.now() }, headers: { 'Cache-Control': 'no-cache' } }).then((r) => r.data),
  getStoreProducts: (params?: { category?: string }) =>
    api.get<ApiResponse<StoreProduct[]>>('/store/products', { params: { ...params, _t: Date.now() }, headers: { 'Cache-Control': 'no-cache' } }).then((r) => r.data),
  getStoreProduct: (slug: string) => api.get<ApiResponse<StoreProduct>>(`/store/products/${slug}`, { params: { _t: Date.now() }, headers: { 'Cache-Control': 'no-cache' } }).then((r) => r.data),
  getCourses: (params?: { category?: string; level?: string }) =>
    api.get<ApiResponse<Course[]>>('/courses', { params: { ...params, _t: Date.now() }, headers: { 'Cache-Control': 'no-cache' } }).then((r) => r.data),
  getCourse: (slug: string) => api.get<ApiResponse<Course>>(`/courses/${slug}`, { params: { _t: Date.now() }, headers: { 'Cache-Control': 'no-cache' } }).then((r) => r.data),
  getBlogPosts: (params?: { category?: string; tag?: string; search?: string; page?: number }) =>
    api.get<any>('/blog/posts', { params: { ...params, _t: Date.now() }, headers: { 'Cache-Control': 'no-cache' } }).then((r) => r.data),
  getBlogPost: (slug: string) => api.get<ApiResponse<BlogPost>>(`/blog/posts/${slug}`, { params: { _t: Date.now() }, headers: { 'Cache-Control': 'no-cache' } }).then((r) => r.data),
  getBlogCategories: () => api.get<ApiResponse<BlogCategory[]>>('/blog/categories', { params: { _t: Date.now() }, headers: { 'Cache-Control': 'no-cache' } }).then((r) => r.data),
  getTestimonials: () => api.get<ApiResponse<Testimonial[]>>('/testimonials', { params: { _t: Date.now() }, headers: { 'Cache-Control': 'no-cache' } }).then((r) => r.data),
  getHostingPlans: () => api.get<ApiResponse<HostingPlan[]>>('/hosting/plans', { params: { _t: Date.now() }, headers: { 'Cache-Control': 'no-cache' } }).then((r) => r.data),
  getSettings: () => api.get<ApiResponse<Record<string, string | null>>>('/settings', { params: { _t: Date.now() }, headers: { 'Cache-Control': 'no-cache' } }).then((r) => r.data),
  submitContact: (data: any) => api.post('/contact', data).then((r) => r.data),
  subscribeNewsletter: (email: string) => api.post('/newsletter', { email }).then((r) => r.data),
};

export const adminApi = {
  login: (email: string, password: string) =>
    api.post('/admin/login', { email, password }).then((r) => r.data),
  logout: () => api.post('/admin/logout').then((r) => r.data),
  getProfile: () => api.get('/admin/me').then((r) => r.data),
  updateProfile: (data: any) => api.put('/admin/profile', data).then((r) => r.data),
  updatePassword: (data: any) => api.put('/admin/password', data).then((r) => r.data),
  getDashboard: () => api.get('/admin/dashboard/stats').then((r) => r.data),
  getServices: () => api.get('/admin/services').then((r) => r.data),
  createService: (data: any) => api.post('/admin/services', data).then((r) => r.data),
  updateService: (id: string, data: any) => api.put(`/admin/services/${id}`, data).then((r) => r.data),
  deleteService: (id: string) => api.delete(`/admin/services/${id}`).then((r) => r.data),
  getPortfolio: () => api.get('/admin/portfolio').then((r) => r.data),
  createPortfolio: (data: any) => api.post('/admin/portfolio', data).then((r) => r.data),
  updatePortfolio: (id: string, data: any) => api.put(`/admin/portfolio/${id}`, data).then((r) => r.data),
  deletePortfolio: (id: string) => api.delete(`/admin/portfolio/${id}`).then((r) => r.data),
  getLeads: (params?: any) => api.get('/admin/leads', { params }).then((r) => r.data),
  getLeadStats: () => api.get('/admin/leads/stats').then((r) => r.data),
  updateLead: (id: string, data: any) => api.put(`/admin/leads/${id}`, data).then((r) => r.data),
  deleteLead: (id: string) => api.delete(`/admin/leads/${id}`).then((r) => r.data),
  getBlogPosts: () => api.get('/admin/blog/posts').then((r) => r.data),
  createBlogPost: (data: any) => api.post('/admin/blog/posts', data).then((r) => r.data),
  updateBlogPost: (id: string, data: any) => api.put(`/admin/blog/posts/${id}`, data).then((r) => r.data),
  deleteBlogPost: (id: string) => api.delete(`/admin/blog/posts/${id}`).then((r) => r.data),
  getBlogCategories: () => api.get('/admin/blog/categories').then((r) => r.data),
  createBlogCategory: (data: any) => api.post('/admin/blog/categories', data).then((r) => r.data),
  updateBlogCategory: (id: string, data: any) => api.put(`/admin/blog/categories/${id}`, data).then((r) => r.data),
  deleteBlogCategory: (id: string) => api.delete(`/admin/blog/categories/${id}`).then((r) => r.data),
  getCourses: () => api.get('/admin/courses').then((r) => r.data),
  createCourse: (data: any) => api.post('/admin/courses', data).then((r) => r.data),
  updateCourse: (id: string, data: any) => api.put(`/admin/courses/${id}`, data).then((r) => r.data),
  deleteCourse: (id: string) => api.delete(`/admin/courses/${id}`).then((r) => r.data),
  getAdminStoreProducts: () => api.get('/admin/store/products').then((r) => r.data),
  createStoreProduct: (data: any) => api.post('/admin/store/products', data).then((r) => r.data),
  updateStoreProduct: (id: string, data: any) => api.put(`/admin/store/products/${id}`, data).then((r) => r.data),
  deleteStoreProduct: (id: string) => api.delete(`/admin/store/products/${id}`).then((r) => r.data),
  getTestimonials: () => api.get('/admin/testimonials').then((r) => r.data),
  createTestimonial: (data: any) => api.post('/admin/testimonials', data).then((r) => r.data),
  updateTestimonial: (id: string, data: any) => api.put(`/admin/testimonials/${id}`, data).then((r) => r.data),
  deleteTestimonial: (id: string) => api.delete(`/admin/testimonials/${id}`).then((r) => r.data),
  getSettings: () => api.get('/admin/settings').then((r) => r.data),
  updateSettings: (settings: any) => api.put('/admin/settings', { settings }).then((r) => r.data),
  uploadMedia: (formData: FormData) =>
    api.post('/admin/media/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  getMedia: (params?: any) => api.get('/admin/media', { params }).then((r) => r.data),
  deleteMedia: (id: string) => api.delete(`/admin/media/${id}`).then((r) => r.data),
  getActivities: (params?: any) => api.get('/admin/activities', { params }).then((r) => r.data),
};

export default api;
