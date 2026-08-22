'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Briefcase, FolderOpen, ShoppingBag,
  GraduationCap, Newspaper, Users, Star, Settings, Image,
  FileText, Activity, LogOut, Menu, X, ChevronDown
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { label: 'Services', icon: Briefcase, href: '/admin/services' },
  { label: 'Portfolio', icon: FolderOpen, href: '/admin/portfolio' },
  { label: 'Digital Store', icon: ShoppingBag, href: '/admin/store' },
  { label: 'Academy', icon: GraduationCap, href: '/admin/academy' },
  { label: 'Blog', icon: Newspaper, href: '/admin/blog' },
  { label: 'Leads', icon: Users, href: '/admin/leads' },
  { label: 'Testimonials', icon: Star, href: '/admin/testimonials' },
  { label: 'Media Library', icon: Image, href: '/admin/media' },
  { label: 'Settings', icon: Settings, href: '/admin/settings' },
  { label: 'Activity Logs', icon: Activity, href: '/admin/activities' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    adminApi.getProfile()
      .then((res) => setAdmin(res.data))
      .catch(() => {
        if (pathname !== '/admin/login') {
          router.push('/admin/login');
        }
      });
  }, [router, pathname]);

  const handleLogout = async () => {
    try {
      await adminApi.logout();
      router.push('/admin/login');
      toast.success('Logged out');
    } catch {}
  };

  if (pathname === '/admin/login') return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className={cn(
        'fixed top-0 left-0 bottom-0 w-64 bg-primary-900 text-white z-50 transition-transform lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="p-6 border-b border-white/10">
          <Link href="/admin">
            <img
              src="/cador-logo.png"
              alt="CadorDigital"
              className="h-14 w-auto"
            />
          </Link>
          <p className="text-white/40 text-xs mt-1">Admin Dashboard</p>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-130px)]">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all',
                pathname === item.href
                  ? 'bg-gold-500 text-white font-semibold shadow-lg'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gold-500 flex items-center justify-center text-sm font-bold">
              {admin?.firstName?.[0]}{admin?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{admin?.firstName} {admin?.lastName}</p>
              <p className="text-xs text-white/40 truncate">{admin?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <Link href="/" target="_blank" className="text-sm text-gray-500 hover:text-gold-500 transition-colors">
              View Site
            </Link>
          </div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
