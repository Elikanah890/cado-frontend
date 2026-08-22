'use client';

import Link from 'next/link';
import { use } from 'react';
import { ArrowRight } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import { publicApi } from '@/lib/api';
import { useEffect, useState } from 'react';

const projects: Record<string, any> = {
  'tourism-booking-platform': { title: 'Tourism Booking Platform', client: 'Safari Adventures Ltd', industry: 'Tourism', services: ['Website Development', 'UI/UX Design'], challenge: 'The client needed a modern booking platform to replace their manual reservation system.', solution: 'We built a custom booking platform with booking workflows, real-time availability, and an admin dashboard.', results: ['300% increase in online bookings', '70% reduction in manual processing time', '95% customer satisfaction rate'] },
  'elearning-system': { title: 'E-Learning Management System', client: 'EduTech Tanzania', industry: 'Education', services: ['Website Development', 'AI Chatbot'], challenge: 'Needed a scalable online learning platform with video hosting and student management.', solution: 'Built a full LMS with course management, video streaming, quizzes, and automated certificates.', results: ['5,000+ students enrolled', '40% improvement in completion rates', 'Reduced administrative costs by 60%'] },
  'restaurant-branding': { title: 'Restaurant Brand Identity', client: 'Spice Garden Restaurant', industry: 'Hospitality', services: ['Brand Identity', 'Creative Studio'], challenge: 'New restaurant needed a complete brand identity to stand out in a competitive market.', solution: 'Created logo, menu design, signage, and full brand guidelines with a modern African aesthetic.', results: ['45% increase in foot traffic', 'Featured in 3 food magazines', 'Brand recognition score up 80%'] },
};

export default function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [project, setProject] = useState(projects[slug]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    publicApi.getPortfolioItem(slug).then((response) => {
      const item = response.data;
      setProject({
        title: item.title,
        client: item.clientName || '',
        industry: item.industry || '',
        services: Array.isArray(item.servicesProvided) ? item.servicesProvided : [],
        challenge: item.challenge || '',
        solution: item.solution || '',
        results: Array.isArray(item.results) ? item.results : (item.results ? [item.results] : []),
      });
    }).catch(() => {}).finally(() => setLoaded(true));
  }, [slug]);

  if (!project && !loaded) {
    return <PublicLayout><div className="section-padding text-center">Loading project...</div></PublicLayout>;
  }

  if (loaded && !project) {
    return (
      <PublicLayout>
        <div className="section-padding text-center">
          <h1 className="text-3xl font-bold">Project not found</h1>
          <Link href="/portfolio" className="btn-primary mt-4">Back to Portfolio</Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="section-padding bg-gradient-to-b from-primary-900 to-primary-800 text-white">
        <div className="container-custom max-w-4xl">
          <Link href="/portfolio" className="text-white/60 hover:text-gold-500 text-sm mb-4 inline-block">← Back to Portfolio</Link>
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="bg-white/10 text-white px-3 py-1 rounded-full text-sm">{project.industry}</span>
            {project.services.map((s: string) => (
              <span key={s} className="bg-gold-500/20 text-gold-400 px-3 py-1 rounded-full text-sm">{s}</span>
            ))}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-2">{project.title}</h1>
          <p className="text-xl text-white/70">{project.client}</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="card p-8">
              <h3 className="text-xl font-bold text-primary-900 mb-4">The Challenge</h3>
              <p className="text-gray-600">{project.challenge}</p>
            </div>
            <div className="card p-8">
              <h3 className="text-xl font-bold text-primary-900 mb-4">Our Solution</h3>
              <p className="text-gray-600">{project.solution}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="container-custom max-w-4xl">
          <h2 className="text-3xl font-bold text-primary-900 text-center mb-12">Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {project.results.map((result: string) => (
              <div key={result} className="card p-8 text-center">
                <p className="text-lg font-semibold text-primary-900">{result}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-primary-900 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">Want Similar Results?</h2>
          <Link href="/contact" className="btn-primary text-lg px-8 py-4 gap-2 inline-flex">
            Start Your Project <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
