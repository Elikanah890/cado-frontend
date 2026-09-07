'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CourseForm from '@/components/admin/CourseForm';

export default function NewCoursePage() {
  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/academy" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gold-600">
          <ArrowLeft className="w-4 h-4" /> Back to Academy
        </Link>
        <h1 className="text-2xl font-bold text-primary-900 mt-2">New Course</h1>
        <p className="text-gray-500 mt-1">Create a course with modules and lessons. Fill in the tabs below.</p>
      </div>
      <CourseForm mode="create" />
    </div>
  );
}