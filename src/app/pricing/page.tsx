'use client';

import Link from 'next/link';
import { Check, ArrowRight, Zap } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';

const bundles = [
  {
    name: 'Launch',
    tagline: 'For Startups & Small Businesses',
    price: 1500000,
    highlighted: false,
    features: [
      'Logo & Brand Identity', '5-Page Website', 'Social Media Setup',
      'Basic SEO', 'Business Email Setup', '3 Months Support',
    ],
  },
  {
    name: 'Grow',
    tagline: 'For Growing Companies',
    price: 5000000,
    highlighted: true,
    features: [
      'Everything in Launch', '10-Page Website', 'E-Commerce Integration',
      'Social Media Management', 'Advanced SEO', 'Content Marketing',
      'Email Marketing Setup', '6 Months Support',
    ],
  },
  {
    name: 'Dominate',
    tagline: 'For Enterprises',
    price: 12000000,
    highlighted: false,
    features: [
      'Everything in Grow', 'Custom Web Application', 'AI Chatbot',
      'Full Marketing Suite', 'CRM Integration', 'Analytics Dashboard',
      'Priority Support', '12 Months Support',
    ],
  },
];

const hosting = [
  {
    name: 'Starter',
    price: 300000,
    period: '/year',
    features: ['1 Website', '10GB Storage', '50GB Bandwidth', 'SSL Certificate', 'Email Support'],
  },
  {
    name: 'Business',
    price: 800000,
    period: '/year',
    features: ['5 Websites', '50GB Storage', '200GB Bandwidth', 'SSL Certificate', 'Priority Support', 'Daily Backups'],
  },
  {
    name: 'Ecommerce',
    price: 1500000,
    period: '/year',
    features: ['10 Websites', '100GB Storage', '500GB Bandwidth', 'SSL Certificate', '24/7 Support', 'Daily Backups', 'CDN Included'],
  },
];

const customServices = [
  { name: 'Logo Design', price: 'From 200,000 TZS' },
  { name: 'Landing Page', price: 'From 500,000 TZS' },
  { name: 'Brand Guidelines', price: 'From 400,000 TZS' },
  { name: 'SEO Audit', price: 'From 300,000 TZS' },
  { name: 'Social Media Graphics', price: 'From 150,000 TZS' },
  { name: 'Business Card Design', price: 'From 80,000 TZS' },
  { name: 'Company Profile', price: 'From 250,000 TZS' },
  { name: 'Email Signature', price: 'From 50,000 TZS' },
];

export default function PricingPage() {
  return (
    <PublicLayout>
      <section className="section-padding bg-gradient-to-b from-primary-900 to-primary-800 text-white">
        <div className="container-custom text-center max-w-3xl">
          <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">Pricing</span>
          <h1 className="text-4xl md:text-6xl font-bold mt-4 mb-6">Transparent Pricing</h1>
          <p className="text-xl text-white/70">Choose the right package for your business. All prices in TZS.</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center text-primary-900 mb-4">Startup Bundles</h2>
          <p className="text-gray-600 text-center mb-12">Complete packages for businesses at every stage.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {bundles.map((bundle) => (
              <div
                key={bundle.name}
                className={`card p-8 relative ${bundle.highlighted ? 'ring-2 ring-gold-500 scale-[1.02] z-10' : ''}`}
              >
                {bundle.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold-500 text-white px-6 py-1.5 rounded-full text-sm font-bold flex items-center gap-1">
                    <Zap className="w-4 h-4" /> Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-primary-900">{bundle.name}</h3>
                <p className="text-gray-500 text-sm mt-1 mb-6">{bundle.tagline}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-primary-900">
                    {bundle.price.toLocaleString()}
                  </span>
                  <span className="text-gray-500 ml-1">TZS</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {bundle.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className={`w-full text-center py-3 rounded-lg font-semibold block transition-all ${
                    bundle.highlighted ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center text-primary-900 mb-4">Website Hosting Plans</h2>
          <p className="text-gray-600 text-center mb-12">Reliable and fast hosting for your website.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {hosting.map((plan) => (
              <div key={plan.name} className="card p-8 text-center">
                <h3 className="text-xl font-bold text-primary-900 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-gold-500">{plan.price.toLocaleString()}</span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 inline mr-2" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/contact" className="btn-secondary w-full text-center py-2.5 block">
                  Choose Plan
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center text-primary-900 mb-4">Custom Services</h2>
          <p className="text-gray-600 text-center mb-12">Individual services tailored to your goals.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {customServices.map((cs) => (
              <div key={cs.name} className="card p-5 text-center">
                <h4 className="font-semibold text-primary-900 text-sm mb-2">{cs.name}</h4>
                <p className="text-gold-500 font-bold text-sm">{cs.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-primary-900 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">Need Something Custom?</h2>
          <p className="text-white/70 text-lg mb-8">We create tailored packages for your specific needs.</p>
          <Link href="/contact" className="btn-primary text-lg px-8 py-4 gap-2 inline-flex">
            Contact Us <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
