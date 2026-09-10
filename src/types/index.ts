export type { Service, ServicePackage } from './service';

export interface Portfolio {
  id: string;
  slug: string;
  title: string;
  clientName: string | null;
  clientLogo: string | null;
  industry: string | null;
  category: string | null;
  projectUrl: string | null;
  challenge: string | null;
  solution: string | null;
  results: string | null;
  testimonialText: string | null;
  testimonialAuthor: string | null;
  testimonialPosition: string | null;
  clientTestimonial: { quote: string; author: string; role: string } | null;
  featuredImage: string | null;
  galleryImages: { url: string; alt?: string }[] | null;
  videoUrl: string | null;
  pdfUrl: string | null;
  pdfName: string | null;
  techStack: string[];
  status: 'COMPLETED' | 'IN_PROGRESS';
  completionDate: string | null;
  sortOrder: number;
  seo: { metaTitle?: string; metaDescription?: string; keywords?: string; ogImage?: string } | null;
  servicesProvided: any;
  resultMetrics: any;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  instructorName: string | null;
  instructorBio: string | null;
  instructorAvatar: string | null;
  thumbnail: string | null;
  featuredImage: string | null;
  introVideo: string | null;
  whatsappNumber: string | null;
  price: number | null;
  currency: string;
  level: string | null;
  category: string | null;
  estimatedHours: number | null;
  isPublished: boolean;
  isFeatured: boolean;
  enrolledCount: number;
  modules: CourseModule[];
  instructor: string | null;
  sortOrder: number;
  isActive: boolean;
  _count?: { lessons: number; modules: number };
  createdAt: string;
  updatedAt: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string | null;
  sortOrder: number;
  lessons: CourseLesson[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseLesson {
  id: string;
  moduleId: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  videoDuration: number | null;
  lessonType: string;
  content: string | null;
  sortOrder: number | null;
  isFree: boolean;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  featuredImage: string | null;
  galleryImages: { url: string; alt?: string }[] | null;
  categoryId: string | null;
  category: BlogCategory | null;
  authorName: string | null;
  status: string;
  views: number;
  viewCount: number;
  readTime: number | null;
  sortOrder: number;
  scheduledAt: string | null;
  seo: { metaTitle?: string; metaDescription?: string; keywords?: string; ogImage?: string } | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  ogImage: string | null;
  publishedAt: string | null;
  tags: BlogPostTag[];
  comments?: Comment[];
  _count?: { comments: number };
  createdAt: string;
  updatedAt: string;
}

export interface BlogCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  _count?: { posts: number };
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  _count?: { posts: number };
  createdAt?: string;
}

export interface BlogPostTag {
  postId: string;
  tagId: string;
  tag: { id: string; name: string };
}

export interface Comment {
  id: string;
  name: string;
  email: string | null;
  content: string;
  postId: string;
  post?: { title: string; slug: string };
  isApproved: boolean;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  clientName: string;
  clientCompany: string | null;
  clientAvatar: string | null;
  content: string;
  rating: number | null;
  serviceId: string | null;
  service: { name: string; slug: string } | null;
  isFeatured: boolean;
  isApproved: boolean;
  sortOrder: number | null;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  company: string | null;
  serviceNeeded: string | null;
  budgetRange: string | null;
  message: string | null;
  status: string;
  source: string;
  notes: string | null;
  createdAt: string;
}

export interface HostingPlan {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  billingPeriod: string;
  features: any;
  isPopular?: boolean;
  isActive: boolean;
  sortOrder: number | null;
}

export interface PricingPlan {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  price: number;
  currency: string;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomService {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  status: string;
  code: number;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  status: string;
  code: number;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  role: string;
  lastLogin: string | null;
}
