'use client';

import Link from 'next/link';
import { ArrowRight, Target, Eye, Heart, Users, Award, Globe } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';

const stats = [
  { value: '100+', label: 'Projects Delivered' },
  { value: '50+', label: 'Happy Clients' },
  { value: '5+', label: 'Years Experience' },
  { value: '15+', label: 'Team Members' },
];

const values = [
  { icon: Target, title: 'Excellence', desc: 'We strive for excellence in every project we deliver.' },
  { icon: Eye, title: 'Innovation', desc: 'We leverage cutting-edge technology to create innovative solutions.' },
  { icon: Heart, title: 'Client-First', desc: 'Your success is our priority. We build solutions that drive real results.' },
  { icon: Users, title: 'Collaboration', desc: 'We work closely with you throughout the entire process.' },
];

export default function AboutPage() {
  return (
    <PublicLayout>
      <section className="section-padding bg-gradient-to-b from-primary-900 to-primary-800 text-white">
        <div className="container-custom text-center max-w-3xl">
          <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">About Us</span>
          <h1 className="text-4xl md:text-6xl font-bold mt-4 mb-6">We Are CadorDigital</h1>
          <p className="text-xl text-white/70 leading-relaxed">
            A Tanzanian digital agency helping businesses build professional brands,
            websites, marketing systems and automation solutions since 2019.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">Our Story</span>
              <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mt-3 mb-6">
                Building Digital Success Stories Across Tanzania
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Founded in 2019, CadorDigital started with a simple mission: to help Tanzanian
                  businesses leverage the power of digital technology to grow and thrive.
                </p>
                <p>
                  What began as a small web design studio has grown into a full-service digital
                  agency offering branding, web development, digital marketing, AI automation,
                  creative services, and business consultancy.
                </p>
                <p>
                  We have served over 50 clients across industries including education, tourism,
                  construction, healthcare, NGOs, retail and startups — delivering over 100
                  successful projects that have transformed businesses.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="card p-8 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gold-500 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="card p-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gold-500/10 flex items-center justify-center">
                  <Target className="w-7 h-7 text-gold-500" />
                </div>
                <h2 className="text-2xl font-bold text-primary-900">Our Mission</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                To empower businesses in Tanzania and across Africa with world-class digital solutions
                that drive growth, efficiency, and competitive advantage. We believe every business
                deserves access to modern technology and professional branding.
              </p>
            </div>
            <div className="card p-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <Eye className="w-7 h-7 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-primary-900">Our Vision</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                To become the most trusted digital transformation partner in East Africa,
                known for delivering innovative, high-quality solutions that transform businesses
                and create lasting impact in the communities we serve.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">Our Values</span>
            <h2 className="section-title mt-2">What Drives Us</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v) => (
              <div key={v.title} className="card p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-5">
                  <v.icon className="w-7 h-7 text-primary-700" />
                </div>
                <h3 className="text-lg font-bold text-primary-900 mb-2">{v.title}</h3>
                <p className="text-gray-600 text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
