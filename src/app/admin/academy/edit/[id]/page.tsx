'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { adminApi } from '@/lib/api';
import CourseForm from '@/components/admin/CourseForm';
import { toast } from 'sonner';

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    adminApi.getCourses()
      .then((res) => {
        if (!mounted) return;
        const all = Array.isArray(res.data) ? res.data : [];
        const item = all.find((c: any) => c.id === id);
        if (item) setData({ ...item, id });
        else setError('Course not found');
      })
      .catch(() => {
        if (!mounted) return;
        setError('Failed to load course');
        toast.error('Failed to load course');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="p-6"><p className="text-gray-500">Loading course...</p></div>;

  if (error || !data) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">{error || 'Course not found'}</p>
        <Link href="/admin/academy" className="btn-primary">Back to Academy</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/academy" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gold-600">
          <ArrowLeft className="w-4 h-4" /> Back to Academy
        </Link>
        <h1 className="text-2xl font-bold text-primary-900 mt-2">Edit Course</h1>
        <p className="text-gray-500 mt-1">Update course: {data.title}</p>
      </div>
      <CourseForm mode="edit" initialData={data} />
    </div>
  );
}