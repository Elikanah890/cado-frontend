'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { adminApi } from '@/lib/api';
import PortfolioForm from '@/components/admin/PortfolioForm';
import { toast } from 'sonner';

export default function EditPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    adminApi.getPortfolioById(id)
      .then((res) => {
        if (!mounted) return;
        const p = res.data;
        // Normalize for form
        setData({
          id: p.id,
          slug: p.slug || '',
          title: p.title || '',
          clientName: p.clientName || '',
          industry: p.industry || '',
          category: p.category || '',
          projectUrl: p.projectUrl || '',
          status: p.status || 'COMPLETED',
          completionDate: p.completionDate ? new Date(p.completionDate).toISOString().slice(0, 10) : '',
          isFeatured: p.isFeatured || false,
          challenge: p.challenge || '',
          solution: p.solution || '',
          results: p.results || '',
          featuredImage: p.featuredImage || '',
          galleryImages: Array.isArray(p.galleryImages) ? p.galleryImages : [],
          videoUrl: p.videoUrl || '',
          clientTestimonial: p.clientTestimonial || { quote: '', author: '', role: '' },
          techStack: Array.isArray(p.techStack) ? p.techStack : [],
          seo: p.seo || { metaTitle: '', metaDescription: '', keywords: '', ogImage: '' },
          sortOrder: p.sortOrder || 0,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        });
      })
      .catch(() => {
        if (!mounted) return;
        setError('Failed to load project');
        toast.error('Failed to load project');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading project...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">{error || 'Project not found'}</p>
        <Link href="/admin/portfolio" className="btn-primary">Back to Portfolio</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/portfolio" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gold-600">
          <ArrowLeft className="w-4 h-4" /> Back to Portfolio
        </Link>
        <h1 className="text-2xl font-bold text-primary-900 mt-2">Edit Project</h1>
        <p className="text-gray-500 mt-1">Update portfolio project: {data.title}</p>
      </div>
      <PortfolioForm mode="edit" initialData={data} />
    </div>
  );
}
