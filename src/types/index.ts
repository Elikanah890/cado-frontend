export interface Service {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  overview: string | null;
  benefits: any;
  process: any;
  icon: string | null;
  featuredImage: string | null;
  startingPrice: number | null;
  isActive: boolean;
  sortOrder: number | null;
  packages: ServicePackage[];
  createdAt: string;
  updatedAt: string;
}

export interface ServicePackage {
  id: string;
  serviceId: string;
  name: string;
  price: number;
  currency: string;
  features: any;
  isHighlighted: boolean;
  sortOrder: number | null;
}

export interface Portfolio {
  id: string;
  slug: string;
  title: string;
  clientName: string | null;
  clientLogo: string | null;
  industry: string | null;
  category: string;
  challenge: string | null;
  solution: string | null;
  results: string | null;
  testimonialText: string | null;
  testimonialAuthor: string | null;
  testimonialPosition: string | null;
  featuredImage: string | null;
  galleryImages: any;
  servicesProvided: any;
  resultMetrics: any;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoreProduct {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  currency: string;
  fileUrl: string | null;
  fileSize: string | null;
  previewImages: any;
  isActive: boolean;
  isFeatured: boolean;
  downloadsCount: number;
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
  price: number;
  currency: string;
  level: string | null;
  category: string | null;
  estimatedHours: number | null;
  isPublished: boolean;
  isFeatured: boolean;
  enrolledCount: number;
  lessons: CourseLesson[];
  _count?: { lessons: number };
  createdAt: string;
  updatedAt: string;
}

export interface CourseLesson {
  id: string;
  courseId: string;
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
  categoryId: string | null;
  category: BlogCategory | null;
  authorName: string | null;
  status: string;
  views: number;
  publishedAt: string | null;
  tags: BlogPostTag[];
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

export interface BlogPostTag {
  postId: string;
  tagId: string;
  tag: { id: string; name: string };
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
  isActive: boolean;
  sortOrder: number | null;
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
