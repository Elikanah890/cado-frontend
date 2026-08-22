'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, Briefcase, FolderOpen, Newspaper,
  ShoppingBag, GraduationCap, ArrowRight, Plus
} from 'lucide-react';
import { adminApi } from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    adminApi.getDashboard().then((res) => setStats(res.data)).catch(() => {});
  }, []);

  const statCards = [
    { label: 'Total Leads', value: stats?.stats?.totalLeads || 0, newVal: stats?.stats?.newLeads || 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Services', value: stats?.stats?.servicesCount || 0, icon: Briefcase, color: 'bg-purple-500' },
    { label: 'Portfolio', value: stats?.stats?.portfolioCount || 0, icon: FolderOpen, color: 'bg-yellow-500' },
    { label: 'Blog Posts', value: stats?.stats?.blogPostsCount || 0, icon: Newspaper, color: 'bg-pink-500' },
    { label: 'Products', value: stats?.stats?.productsCount || 0, icon: ShoppingBag, color: 'bg-orange-500' },
    { label: 'Courses', value: stats?.stats?.coursesCount || 0, icon: GraduationCap, color: 'bg-indigo-500' },
  ];

  const quickActions = [
    { label: 'Add Service', href: '/admin/services', icon: Plus },
    { label: 'Create Blog Post', href: '/admin/blog', icon: Plus },
    { label: 'Add Product', href: '/admin/store', icon: Plus },
    { label: 'Create Course', href: '/admin/academy', icon: Plus },
    { label: 'View Leads', href: '/admin/leads', icon: ArrowRight },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here&apos;s what&apos;s happening.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{stat.label}</span>
              <div className={`w-10 h-10 rounded-xl ${stat.color} bg-opacity-10 flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-primary-900">{stat.value}</div>
            {stat.newVal !== undefined && stat.newVal > 0 && (
              <p className="text-xs text-blue-600 mt-1">{stat.newVal} new</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <h2 className="text-lg font-bold text-primary-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href}
                className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-primary-50 text-sm font-medium text-primary-700 transition-colors">
                <action.icon className="w-4 h-4" /> {action.label}
              </Link>
            ))}
          </div>
        </div>

      </div>

      <div className="card p-6 mt-8">
        <h2 className="text-lg font-bold text-primary-900 mb-4">Recent Leads</h2>
        {stats?.recentLeads?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Service</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentLeads.slice(0, 5).map((l: any) => (
                  <tr key={l.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-primary-900">{l.firstName} {l.lastName}</td>
                    <td className="py-3 px-4 text-gray-600">{l.email}</td>
                    <td className="py-3 px-4 text-gray-600">{l.serviceNeeded || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        l.status === 'new' ? 'bg-blue-100 text-blue-700' :
                        l.status === 'contacted' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                      }`}>{l.status}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{new Date(l.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No leads yet.</p>
        )}
      </div>
    </div>
  );
}
