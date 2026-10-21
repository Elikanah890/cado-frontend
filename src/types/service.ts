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
  createdAt: string;
  updatedAt: string;
}

