'use client';

import Link from 'next/link';
import { use } from 'react';
import { ArrowRight, Check, Palette, Globe, Megaphone, Cpu, Briefcase, Camera, Building2, MessageCircle } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import { publicApi } from '@/lib/api';
import { useEffect, useState } from 'react';
import { whatsappLink } from '@/lib/utils';

const serviceIcons: Record<string, any> = {
  'brand-identity': Palette,
  'website-development': Globe,
  'digital-marketing': Megaphone,
  'ai-automation': Cpu,
  'business-solutions': Briefcase,
  'creative-studio': Camera,
  'company-registration': Building2,
};

const serviceData: Record<string, any> = {
  'brand-identity': {
    name: 'Brand Identity',
    desc: 'Build a memorable brand that stands out from the competition and resonates with your target audience.',
    benefits: ['Professional brand perception', 'Increased customer trust', 'Consistent visual identity', 'Better market positioning'],
    process: ['Brand Discovery', 'Strategy Development', 'Visual Design', 'Brand Guidelines', 'Implementation'],
  },
  'website-development': {
    name: 'Website Development',
    desc: 'Professional websites optimized for performance, SEO and conversions. From simple landing pages to complex web apps.',
    benefits: ['Responsive design for all devices', 'SEO optimized structure', 'Fast loading performance', 'Easy content management'],
    process: ['Requirements Analysis', 'UI/UX Design', 'Development', 'Testing', 'Deployment'],
  },
  'digital-marketing': {
    name: 'Digital Marketing',
    desc: 'Data-driven marketing strategies across social media, search engines, email and content.',
    benefits: ['Increased online visibility', 'Higher conversion rates', 'Better ROI on ad spend', 'Targeted audience reach'],
    process: ['Market Research', 'Strategy Planning', 'Campaign Setup', 'Execution', 'Analysis & Optimization'],
  },
  'ai-automation': {
    name: 'AI & Automation',
    desc: 'AI-powered chatbots, workflow automation, and intelligent systems that save time and money.',
    benefits: ['Reduced operational costs', '24/7 customer support', 'Streamlined workflows', 'Data-driven insights'],
    process: ['Process Audit', 'Solution Design', 'AI Model Training', 'Integration', 'Monitoring & Optimization'],
  },
  'business-solutions': {
    name: 'Business Solutions',
    desc: 'Enterprise-grade ERP, CRM, POS and business management systems tailored to your needs.',
    benefits: ['Centralized business operations', 'Improved team collaboration', 'Real-time reporting', 'Scalable infrastructure'],
    process: ['Business Analysis', 'System Architecture', 'Development', 'Data Migration', 'Training & Support'],
  },
  'creative-studio': {
    name: 'Creative Studio',
    desc: 'Professional photography, videography, animation and creative content production.',
    benefits: ['High-quality visual assets', 'Engaging social content', 'Professional brand image', 'Custom creative solutions'],
    process: ['Creative Brief', 'Concept Development', 'Production', 'Post-Production', 'Delivery'],
  },
  'company-registration': {
    name: 'Company & Business Registration',
    desc: 'Easy business registration, BRELA compliance, tax registration and company documentation.',
    benefits: ['Legal business compliance', 'Tax registration (TIN)', 'Business permits', 'Professional documentation'],
    process: ['Documentation Review', 'Name Reservation', 'BRELA Registration', 'Tax Registration', 'License Processing'],
  },
};

export default function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [service, setService] = useState(serviceData[slug]);
  const [loaded, setLoaded] = useState(false);
  const IconComponent = serviceIcons[slug] || serviceIcons[service?.icon || ''];

  useEffect(() => {
    publicApi.getService(slug).then((response) => {
      const item = response.data;
      setService({
        name: item.name,
        desc: item.description || item.overview || '',
        benefits: Array.isArray(item.benefits) ? item.benefits : [],
        process: Array.isArray(item.process) ? item.process : [],
        icon: item.icon,
      });
    }).catch(() => {}).finally(() => setLoaded(true));
  }, [slug]);

  if (!service && !loaded) {
    return <PublicLayout><div className="section-padding text-center">Loading service...</div></PublicLayout>;
  }

  if (loaded && !service) {
    return (
      <PublicLayout>
        <div className="section-padding text-center">
          <h1 className="text-3xl font-bold">Service not found</h1>
          <Link href="/services" className="btn-primary mt-4">Back to Services</Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="section-padding bg-gradient-to-b from-primary-900 to-primary-800 text-white">
        <div className="container-custom">
          <div className="max-w-3xl">
            <Link href="/services" className="text-white/60 hover:text-gold-500 text-sm transition-colors mb-4 inline-block">
              ← Back to Services
            </Link>
            {IconComponent && (
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                <IconComponent className="w-8 h-8 text-gold-400" />
              </div>
            )}
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{service.name}</h1>
            <p className="text-xl text-white/70 leading-relaxed">{service.desc}</p>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-bold text-primary-900 mb-8">Benefits</h2>
              <ul className="space-y-4">
                {service.benefits.map((benefit: string) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-primary-900 mb-8">Our Process</h2>
              <div className="space-y-4">
                {service.process.map((step: string, i: number) => (
                  <div key={step} className="flex items-center gap-4 p-4 card">
                    <div className="w-10 h-10 rounded-full bg-gold-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-gray-700 font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold text-primary-900 mb-4">Interested in {service.name}?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Let&apos;s discuss how we can help you with our {service.name.toLowerCase()} services.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={whatsappLink(service.name)} target="_blank" rel="noopener noreferrer" className="btn-primary text-lg px-8 py-4 gap-2">
              Contact via WhatsApp <MessageCircle className="w-5 h-5" />
            </a>
            <Link href="/pricing" className="btn-secondary text-lg px-8 py-4">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
