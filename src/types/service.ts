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
