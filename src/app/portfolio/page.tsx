'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import { publicApi } from '@/lib/api';
import { useEffect, useState } from 'react';

const fallbackProjects = [
  { title: 'Tourism Booking Platform', category: 'Websites', client: 'Safari Adventures Ltd', industry: 'Tourism', image: '/placeholder-project.jpg', slug: 'tourism-booking-platform' },
  { title: 'E-Learning Management System', category: 'Websites', client: 'EduTech Tanzania', industry: 'Education', image: '/placeholder-project.jpg', slug: 'elearning-system' },
  { title: 'Restaurant Brand Identity', category: 'Branding', client: 'Spice Garden Restaurant', industry: 'Hospitality', image: '/placeholder-project.jpg', slug: 'restaurant-branding' },
  { title: 'NGO Donation Platform', category: 'Websites', client: 'Tanzania Health Foundation', industry: 'NGOs', image: '/placeholder-project.jpg', slug: 'ngo-donation-platform' },
  { title: 'Construction Company Website', category: 'Websites', client: 'BuildRight Construction', industry: 'Construction', image: '/placeholder-project.jpg', slug: 'construction-website' },
  { title: 'Social Media Campaign', category: 'Marketing', client: 'Fashion Hub Tanzania', industry: 'Retail', image: '/placeholder-project.jpg', slug: 'social-media-campaign' },
  { title: 'ERP System for Manufacturing', category: 'Automation', client: 'Tanzania Packers Ltd', industry: 'Manufacturing', image: '/placeholder-project.jpg', slug: 'erp-manufacturing' },
  { title: 'Healthcare Mobile App', category: 'Design', client: 'MediCare Tanzania', industry: 'Healthcare', image: '/placeholder-project.jpg', slug: 'healthcare-mobile-app' },
  { title: 'Real Estate Platform', category: 'Websites', client: 'DreamHome Properties', industry: 'Real Estate', image: '/placeholder-project.jpg', slug: 'real-estate-platform' },
];

const categories = ['All', 'Branding', 'Websites', 'Marketing', 'Design', 'Automation'];

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [projects, setProjects] = useState(fallbackProjects);

  useEffect(() => {
    const fetchProjects = () => {
      publicApi.getPortfolio().then((response) => {
        if (Array.isArray(response.data) && response.data.length > 0) {
          setProjects(response.data.map((project) => ({
            title: project.title,
            category: project.category,
            client: project.clientName || '',
            industry: project.industry || '',
            image: project.featuredImage || '',
            slug: project.slug,
          })));
        } else if (Array.isArray(response.data) && response.data.length === 0) {
          setProjects([]);
        }
      }).catch((err) => console.error('Failed to fetch portfolio:', err?.message));
    };
    fetchProjects();
    const onFocus = () => fetchProjects();
    const onVis = () => { if (!document.hidden) fetchProjects(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  const filtered = activeCategory === 'All' ? projects : projects.filter((p) => p.category === activeCategory);

  return (
    <PublicLayout>
      <section className="section-padding bg-gradient-to-b from-primary-900 to-primary-800 text-white">
        <div className="container-custom text-center max-w-3xl">
          <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">Portfolio</span>
          <h1 className="text-4xl md:text-6xl font-bold mt-4 mb-6">Our Work</h1>
          <p className="text-xl text-white/70">Explore our projects and see how we help businesses grow.</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-gold-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((project, i) => (
              <Link key={project.slug} href={`/portfolio/${project.slug}`} className="card group overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-primary-200 to-primary-400 relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary-900/0 group-hover:bg-primary-900/40 transition-colors flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-semibold flex items-center gap-1">
                      View Project <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                  <span className="absolute top-3 left-3 bg-white/90 text-primary-900 px-3 py-1 rounded-full text-xs font-medium">
                    {project.category}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-primary-900 group-hover:text-gold-500 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{project.client}</p>
                  <span className="inline-block mt-3 text-xs bg-primary-50 text-primary-600 px-3 py-1 rounded-full">
                    {project.industry}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
