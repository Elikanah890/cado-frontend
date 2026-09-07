'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Briefcase, FolderOpen,
  GraduationCap, Newspaper, Settings,
  FileText, Activity, LogOut, Menu, X, ChevronDown, Tag,
  Package, Server, Wrench, Users
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type MenuItem =
  | { label: string; icon: any; href: string }
  | { label: string; icon: any; children: { label: string; href: string }[] };

const menuItems: MenuItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { label: 'Visitors', icon: Users, href: '/admin/visitors' },
  { label: 'Services', icon: Briefcase, href: '/admin/services' },
  { label: 'Portfolio', icon: FolderOpen, children: [
    { label: 'Projects', href: '/admin/portfolio' },
    { label: 'Categories', href: '/admin/portfolio/categories' },
  ]},
  { label: 'Academy', icon: GraduationCap, href: '/admin/academy' },
  { label: 'Blog', icon: Newspaper, children: [
    { label: 'Posts', href: '/admin/blog' },
    { label: 'Comments', href: '/admin/blog/comments' },
    { label: 'Categories', href: '/admin/blog/categories' },
    { label: 'Tags', href: '/admin/blog/tags' },
  ]},
  { label: 'Pricing', icon: Package, children: [
    { label: 'Startup Bundles', href: '/admin/pricing/plans' },
    { label: 'Hosting Plans', href: '/admin/pricing/hosting' },
    { label: 'Custom Services', href: '/admin/pricing/custom' },
  ]},
  { label: 'Settings', icon: Settings, href: '/admin/settings' },
  { label: 'Activity Logs', icon: Activity, href: '/admin/activities' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [admin, setAdmin] = useState<any>(null);
  const [companyName, setCompanyName] = useState('CadorDigital');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/admin/login') return;

    Promise.all([adminApi.getProfile(), adminApi.getSettings()])
      .then(([profile, settings]) => {
        setAdmin(profile.data);
        const value = settings.data?.company_name;
        if (value) setCompanyName(value);
      })
      .catch(() => {
        if (pathname !== '/admin/login') {
          router.push('/admin/login');
        }
      });
  }, [router, pathname]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href: string) => pathname === href;

  const isGroupActive = (children: { href: string }[]) =>
    children.some((child) => pathname === child.href);

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
              alt={companyName}
              className="h-14 w-auto"
            />
          </Link>
          <p className="text-white text-sm font-semibold mt-2 truncate">{companyName}</p>
          <p className="text-white/40 text-xs mt-1">Admin Dashboard</p>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-130px)]">
          {menuItems.map((item) => {
            if ('href' in item) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all',
                    isActive(item.href)
                      ? 'bg-gold-500 text-white font-semibold shadow-lg'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            }

            const open = openGroups[item.label] || isGroupActive(item.children);

            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleGroup(item.label)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all w-full',
                    isGroupActive(item.children)
                      ? 'bg-gold-500/20 text-gold-300 font-semibold'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown className={cn('w-4 h-4 transition-transform', open && 'rotate-180')} />
                </button>
                {open && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          'flex items-center gap-3 pl-9 pr-4 py-2.5 rounded-xl text-sm transition-all',
                          isActive(child.href)
                            ? 'bg-gold-500 text-white font-semibold shadow-lg'
                            : 'text-white/60 hover:bg-white/10 hover:text-white'
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gold-500 flex items-center justify-center text-sm font-bold">
              {admin?.email?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{admin?.email}</p>
              <p className="text-xs text-white/40 truncate capitalize">{admin?.role}</p>
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
            <span className="hidden sm:block text-sm font-semibold text-primary-900">{companyName}</span>
            <Link href="/" target="_blank" className="text-sm text-gray-500 hover:text-gold-500 transition-colors">
              View Site
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gold-500 hover:text-gold-500"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
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
