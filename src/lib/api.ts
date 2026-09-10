import axios from 'axios';
import type {
  Service, Portfolio, Course, BlogPost,
  BlogCategory, Testimonial, HostingPlan, Lead, Comment,
  ApiResponse, PaginatedResponse
} from '@/types';

const getBaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  return url;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache, no-store, must-revalidate' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  config.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  config.headers.set('Pragma', 'no-cache');
  config.headers.set('Expires', '0');
  return config;
});

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
  getHomepage: () => api.get<ApiResponse<{
    services: Service[];
    portfolio: Portfolio[];
    blog: BlogPost[];
    pricing: { plans: any[]; hosting: any[]; custom: any[] };
    academy: Course[];
    testimonials: number;
  }>>('/homepage').then((r) => r.data),
  getServicesPage: () => api.get<ApiResponse<{ services: Service[]; testimonials: Testimonial[] }>>('/services-page').then((r) => r.data),
  getPortfolioPage: () => api.get<ApiResponse<{ portfolio: Portfolio[]; categories: string[] }>>('/portfolio-page').then((r) => r.data),
  getBlogPage: (params?: { category?: string; search?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<{ posts: BlogPost[]; categories: BlogCategory[]; tags: any[]; pagination: { page: number; limit: number; total: number; pages: number } }>>('/blog-page', { params, cache: 'no-store' } as any).then((r) => r.data),
  getAcademyPage: () => api.get<ApiResponse<{ courses: Course[]; categories: string[] }>>('/academy-page').then((r) => r.data),
  getPricingPage: () => api.get<ApiResponse<{ plans: any[]; hosting: any[]; custom: any[] }>>('/pricing-page').then((r) => r.data),
  getPricing: () => api.get<ApiResponse<{ categories: any[]; hosting: any[]; custom: any[] }>>('/pricing', { cache: 'no-store' } as any).then((r) => r.data),
  getServices: () => api.get<ApiResponse<Service[]>>('/services', { cache: 'no-store' } as any).then((r) => r.data),
  getService: (slug: string) => api.get<ApiResponse<Service>>(`/services/${slug}`, { cache: 'no-store' } as any).then((r) => r.data),
  getPortfolio: (params?: { category?: string; featured?: string }) =>
    api.get<ApiResponse<Portfolio[]>>('/portfolio', { params, cache: 'no-store' } as any).then((r) => r.data),
  getPortfolioItem: (slug: string) => api.get<ApiResponse<Portfolio>>(`/portfolio/${slug}`, { cache: 'no-store' } as any).then((r) => r.data),
  getPortfolioCategories: () => api.get<ApiResponse<string[]>>('/portfolio/categories', { cache: 'no-store' } as any).then((r) => r.data),
  getCourses: (params?: { category?: string; level?: string }) =>
    api.get<ApiResponse<Course[]>>('/academy', { params, cache: 'no-store' } as any).then((r) => r.data),
  getCourse: (slug: string) => api.get<ApiResponse<Course>>(`/academy/${slug}`, { cache: 'no-store' } as any).then((r) => r.data),
  getBlogPosts: (params?: { category?: string; tag?: string; search?: string; page?: number }) =>
    api.get<any>('/blog', { params, cache: 'no-store' } as any).then((r) => r.data),
  getBlogPost: (slug: string) => api.get<ApiResponse<BlogPost>>(`/blog/${slug}`, { cache: 'no-store' } as any).then((r) => r.data),
  getBlogCategories: () => api.get<ApiResponse<BlogCategory[]>>('/blog/categories', { cache: 'no-store' } as any).then((r) => r.data),
  getBlogTags: () => api.get<ApiResponse<any[]>>('/blog/tags', { cache: 'no-store' } as any).then((r) => r.data),
  getRelatedPosts: (slug: string) => api.get<ApiResponse<BlogPost[]>>(`/blog/related/${slug}`, { cache: 'no-store' } as any).then((r) => r.data),
  getPostComments: (slug: string) => api.get<ApiResponse<Comment[]>>(`/blog/${slug}/comments`, { cache: 'no-store' } as any).then((r) => r.data),
  createComment: (slug: string, data: { name: string; email?: string; content: string }) =>
    api.post<ApiResponse<Comment>>(`/blog/${slug}/comments`, data).then((r) => r.data),
  getTestimonials: () => api.get<ApiResponse<Testimonial[]>>('/testimonials', { cache: 'no-store' } as any).then((r) => r.data),
  getHostingPlans: () => api.get<ApiResponse<HostingPlan[]>>('/hosting/plans', { cache: 'no-store' } as any).then((r) => r.data),
  getPricingPlans: () => api.get<ApiResponse<any[]>>('/pricing/plans', { cache: 'no-store' } as any).then((r) => r.data),
  getPricingHosting: () => api.get<ApiResponse<any[]>>('/pricing/hosting', { cache: 'no-store' } as any).then((r) => r.data),
  getPricingCustom: () => api.get<ApiResponse<any[]>>('/pricing/custom', { cache: 'no-store' } as any).then((r) => r.data),
  getSettings: () => api.get<ApiResponse<Record<string, string | null>>>('/settings', { cache: 'no-store' } as any).then((r) => r.data),
  submitContact: (data: any) => api.post('/contact', data).then((r) => r.data),
  subscribeNewsletter: (email: string) => api.post('/newsletter', { email }).then((r) => r.data),
};

export const visitorApi = {
  track: (data: { path: string; deviceType: string; isReturning: boolean; visitorId?: string }) =>
    api.post('/visitors/track', data).then((r) => r.data),
  getStats: () => api.get('/admin/visitors/stats').then((r) => r.data),
  getChart: (range?: 'day' | 'week' | 'month' | 'year') =>
    api.get('/admin/visitors/chart', { params: { range } }).then((r) => r.data),
  clearAll: () => api.delete('/admin/visitors/clear-all').then((r) => r.data),
};

export const adminApi = {
  login: (email: string, password: string) =>
    api.post('/admin/login', { email, password }).then((r) => r.data),
  logout: () => api.post('/admin/logout').then((r) => r.data),
  getProfile: () => api.get('/admin/me').then((r) => r.data),
  updateProfile: (data: any) => api.put('/admin/profile', data).then((r) => r.data),
  changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
    api.put('/admin/password', data).then((r) => r.data),
  updatePassword: (data: any) => api.put('/admin/password', data).then((r) => r.data),
  getDashboard: () => api.get('/admin/dashboard/stats').then((r) => r.data),
  getServices: () => api.get('/admin/services').then((r) => r.data),
  createService: (data: any) => api.post('/admin/services', data).then((r) => r.data),
  updateService: (id: string, data: any) => api.put(`/admin/services/${id}`, data).then((r) => r.data),
  deleteService: (id: string) => api.delete(`/admin/services/${id}`).then((r) => r.data),
  getPortfolio: () => api.get('/admin/portfolio').then((r) => r.data),
  getPortfolioById: (id: string) => api.get(`/admin/portfolio/${id}`).then((r) => r.data),
  createPortfolio: (data: any) => api.post('/admin/portfolio', data).then((r) => r.data),
  updatePortfolio: (id: string, data: any) => api.put(`/admin/portfolio/${id}`, data).then((r) => r.data),
  deletePortfolio: (id: string) => api.delete(`/admin/portfolio/${id}`).then((r) => r.data),
  getPortfolioCategories: () => api.get('/admin/portfolio/categories').then((r) => r.data),
  deletePortfolioCategory: (categoryName: string) => api.delete(`/admin/portfolio/categories/${encodeURIComponent(categoryName)}`).then((r) => r.data),
  getLeads: (params?: any) => api.get('/admin/leads', { params }).then((r) => r.data),
  getLeadStats: () => api.get('/admin/leads/stats').then((r) => r.data),
  updateLead: (id: string, data: any) => api.put(`/admin/leads/${id}`, data).then((r) => r.data),
  deleteLead: (id: string) => api.delete(`/admin/leads/${id}`).then((r) => r.data),
  getBlogPosts: () => api.get('/admin/blog/posts').then((r) => r.data),
  getBlogPostById: (id: string) => api.get(`/admin/blog/posts/${id}`).then((r) => r.data),
  createBlogPost: (data: any) => api.post('/admin/blog/posts', data).then((r) => r.data),
  updateBlogPost: (id: string, data: any) => api.put(`/admin/blog/posts/${id}`, data).then((r) => r.data),
  deleteBlogPost: (id: string) => api.delete(`/admin/blog/posts/${id}`).then((r) => r.data),
  getBlogCategories: () => api.get('/admin/blog/categories').then((r) => r.data),
  createBlogCategory: (data: any) => api.post('/admin/blog/categories', data).then((r) => r.data),
  updateBlogCategory: (id: string, data: any) => api.put(`/admin/blog/categories/${id}`, data).then((r) => r.data),
  deleteBlogCategory: (id: string) => api.delete(`/admin/blog/categories/${id}`).then((r) => r.data),
  getBlogTags: () => api.get('/admin/blog/tags').then((r) => r.data),
  createBlogTag: (data: any) => api.post('/admin/blog/tags', data).then((r) => r.data),
  updateBlogTag: (id: string, data: any) => api.put(`/admin/blog/tags/${id}`, data).then((r) => r.data),
  deleteBlogTag: (id: string) => api.delete(`/admin/blog/tags/${id}`).then((r) => r.data),
  getBlogComments: (params?: { postId?: string }) => api.get('/admin/blog/comments', { params }).then((r) => r.data),
  approveBlogComment: (id: string) => api.put(`/admin/blog/comments/${id}/approve`).then((r) => r.data),
  deleteBlogComment: (id: string) => api.delete(`/admin/blog/comments/${id}`).then((r) => r.data),
  getCourses: () => api.get('/admin/academy').then((r) => r.data),
  createCourse: (data: any) => api.post('/admin/academy', data).then((r) => r.data),
  updateCourse: (id: string, data: any) => api.put(`/admin/academy/${id}`, data).then((r) => r.data),
  deleteCourse: (id: string) => api.delete(`/admin/academy/${id}`).then((r) => r.data),
  // Academy Lessons
  getCourseLessons: (courseId: string) => api.get(`/admin/academy/${courseId}/lessons`).then((r) => r.data),
  createLesson: (courseId: string, data: any) => api.post(`/admin/academy/${courseId}/lessons`, data).then((r) => r.data),
  updateLesson: (courseId: string, lessonId: string, data: any) => api.put(`/admin/academy/${courseId}/lessons/${lessonId}`, data).then((r) => r.data),
  updateLessonById: (lessonId: string, data: any) => api.put(`/admin/academy/lessons/${lessonId}`, data).then((r) => r.data),
  deleteLesson: (courseId: string, lessonId: string) => api.delete(`/admin/academy/${courseId}/lessons/${lessonId}`).then((r) => r.data),
  deleteLessonById: (lessonId: string) => api.delete(`/admin/academy/lessons/${lessonId}`).then((r) => r.data),
  // Academy Modules
  createModule: (courseId: string, data: any) => api.post(`/admin/academy/${courseId}/modules`, data).then((r) => r.data),
  updateModule: (moduleId: string, data: any) => api.put(`/admin/academy/modules/${moduleId}`, data).then((r) => r.data),
  deleteModule: (moduleId: string) => api.delete(`/admin/academy/modules/${moduleId}`).then((r) => r.data),
  // Lessons under module
  createModuleLesson: (moduleId: string, data: any) => api.post(`/admin/academy/modules/${moduleId}/lessons`, data).then((r) => r.data),
  updateModuleLesson: (moduleId: string, lessonId: string, data: any) => api.put(`/admin/academy/modules/${moduleId}/lessons/${lessonId}`, data).then((r) => r.data),
  deleteModuleLesson: (moduleId: string, lessonId: string) => api.delete(`/admin/academy/modules/${moduleId}/lessons/${lessonId}`).then((r) => r.data),
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
  deleteActivity: (id: string) => api.delete(`/admin/activities/${id}`).then((r) => r.data),
  clearActivities: () => api.delete('/admin/activities/clear-all').then((r) => r.data),
  // Pricing Admin
  getPricingCategories: () => api.get('/admin/pricing/categories').then((r) => r.data),
  createPricingCategory: (data: any) => api.post('/admin/pricing/categories', data).then((r) => r.data),
  updatePricingCategory: (id: string, data: any) => api.put(`/admin/pricing/categories/${id}`, data).then((r) => r.data),
  deletePricingCategory: (id: string) => api.delete(`/admin/pricing/categories/${id}`).then((r) => r.data),
  getPricingPlans: () => api.get('/admin/pricing/plans').then((r) => r.data),
  createPricingPlan: (data: any) => api.post('/admin/pricing/plans', data).then((r) => r.data),
  updatePricingPlan: (id: string, data: any) => api.put(`/admin/pricing/plans/${id}`, data).then((r) => r.data),
  deletePricingPlan: (id: string) => api.delete(`/admin/pricing/plans/${id}`).then((r) => r.data),
  getHostingPlansAdmin: () => api.get('/admin/pricing/hosting').then((r) => r.data),
  createHostingPlan: (data: any) => api.post('/admin/pricing/hosting', data).then((r) => r.data),
  updateHostingPlan: (id: string, data: any) => api.put(`/admin/pricing/hosting/${id}`, data).then((r) => r.data),
  deleteHostingPlan: (id: string) => api.delete(`/admin/pricing/hosting/${id}`).then((r) => r.data),
  getCustomServices: () => api.get('/admin/pricing/custom').then((r) => r.data),
  createCustomService: (data: any) => api.post('/admin/pricing/custom', data).then((r) => r.data),
  updateCustomService: (id: string, data: any) => api.put(`/admin/pricing/custom/${id}`, data).then((r) => r.data),
  deleteCustomService: (id: string) => api.delete(`/admin/pricing/custom/${id}`).then((r) => r.data),
};

export default api;
