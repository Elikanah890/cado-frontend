'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Monitor,
  Smartphone,
  Tablet,
  Eye,
  Globe,
  UserPlus,
  Repeat,
  Trash,
} from 'lucide-react';
import { visitorApi } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Stats = {
  total: number;
  periods: Record<'today' | 'week' | 'month' | 'year', { current: number; previous: number; changePct: number }>;
  topPages: { path: string; count: number }[];
  devices: { mobile: number; desktop: number; tablet: number };
  newVsReturning: { new: number; returning: number };
};

type ChartPoint = { label: string; value: number };
type ChartData = { range: string; total: number; data: ChartPoint[] };

const rangeOptions = [
  { key: 'week', label: '7 Days' },
  { key: 'month', label: '30 Days' },
  { key: 'year', label: '12 Months' },
] as const;

const periodMeta = [
  { key: 'today', label: '👥 Today (24 hours)', hint: 'Total visitors in the last 24 hours', comparison: 'Visitors compared to the previous 24 hours' },
  { key: 'week', label: '📅 This Week (Last 7 days)', hint: 'Total visitors in the last 7 days', comparison: 'Visitors compared to the previous 7 days' },
  { key: 'month', label: '📆 This Month (Last 30 days)', hint: 'Total visitors in the last 30 days', comparison: 'Visitors compared to the previous 30 days' },
  { key: 'year', label: '📊 This Year (Last 12 months)', hint: 'Total visitors in the last 12 months', comparison: 'Visitors compared to the previous 12 months' },
] as const;

function formatPath(path: string): string {
  if (!path || path === '/') return 'Home';
  return path.split('?')[0].replace(/\/+$/, '') || 'Home';
}

function ChangeBadge({ pct }: { pct: number }) {
  if (pct === 0) {
    return <span className="text-xs text-gray-400">no change</span>;
  }
  const up = pct > 0;
  return (
    <span
      title="Visitors compared to the previous equivalent period"
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-semibold',
        up ? 'text-green-600' : 'text-red-600'
      )}
    >
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {up ? '+' : ''}{pct}%
    </span>
  );
}

function AreaChart({ data }: { data: ChartPoint[] }) {
  const W = 600;
  const H = 240;
  const PAD_X = 6;
  const PAD_TOP = 16;
  const PAD_BOTTOM = 28;

  if (!data.length) {
    return <p className="text-sm text-gray-400 py-12 text-center">No visitor data yet.</p>;
  }

  const values = data.map((d) => d.value);
  const max = Math.max(1, ...values);
  const n = data.length;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_TOP - PAD_BOTTOM;
  const stepX = n > 1 ? innerW / (n - 1) : 0;

  const coords = data.map((d, i) => ({
    x: PAD_X + i * stepX,
    y: PAD_TOP + innerH - (d.value / max) * innerH,
  }));

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${(coords[n - 1]?.x ?? W - PAD_X).toFixed(1)},${(H - PAD_BOTTOM).toFixed(1)} L${(coords[0]?.x ?? PAD_X).toFixed(1)},${(H - PAD_BOTTOM).toFixed(1)} Z`;

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  const labelStep = Math.max(1, Math.ceil(n / 6));
  const showDots = n <= 31;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Visitors trend chart">
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4af37" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridLines.map((g) => {
          const y = PAD_TOP + innerH - g * innerH;
          return (
            <g key={g}>
              <line x1={PAD_X} y1={y} x2={W - PAD_X} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" />
              <text x={W - PAD_X - 2} y={y - 4} textAnchor="end" fontSize="10" fill="#9ca3af">
                {Math.round(max * g)}
              </text>
            </g>
          );
        })}

        <text x={W / 2} y={H - 1} textAnchor="middle" fontSize="10" fill="#6b7280">Date</text>
        <text x="2" y={H / 2} textAnchor="middle" fontSize="10" fill="#6b7280" transform={`rotate(-90 2 ${H / 2})`}>Number of Visitors</text>

        <path d={areaPath} fill="url(#areaFill)" />
        <path d={linePath} fill="none" stroke="#d4af37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {showDots &&
          coords.map((c, i) => (
            <circle key={i} cx={c.x} cy={c.y} r="3" fill="#d4af37" stroke="#fff" strokeWidth="1.5">
              <title>{`${data[i].label}: ${data[i].value.toLocaleString()} visitors`}</title>
            </circle>
          ))}

        {data.map((d, i) =>
          i % labelStep === 0 ? (
            <text
              key={i}
              x={coords[i].x}
              y={H - 8}
              textAnchor="middle"
              fontSize="10"
              fill="#9ca3af"
            >
              {d.label}
            </text>
          ) : null
        )}
      </svg>
      <div className="flex justify-center text-center mt-2">
        <p className="text-xs text-gray-500">
          📈 Total Visitors: <span className="font-semibold text-primary-900">{data.reduce((s, d) => s + d.value, 0).toLocaleString()}</span> in this period
        </p>
      </div>
    </div>
  );
}

function DeviceRow({
  label,
  icon: Icon,
  value,
  total,
  color,
}: {
  label: string;
  icon: any;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', color, 'bg-opacity-10')}>
        <Icon className={cn('w-4 h-4', color.replace('bg-', 'text-'))} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-primary-900 capitalize">{label}</span>
          <span className="text-xs text-gray-500">
            {value.toLocaleString()} <span className="text-gray-400">({pct}%)</span>
          </span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
          <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card p-6">
            <div className="h-4 w-20 bg-gray-200 rounded mb-3" />
            <div className="h-8 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2 h-72" />
        <div className="card p-6 h-72" />
      </div>
    </div>
  );
}

export default function AdminVisitorsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chart, setChart] = useState<ChartData | null>(null);
  const [range, setRange] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clearing, setClearing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, chartRes] = await Promise.all([
        visitorApi.getStats(),
        visitorApi.getChart(range),
      ]);
      setStats(statsRes.data);
      setChart(chartRes.data);
    } catch {
      toast.error('Failed to load visitor analytics');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleClearAll = async () => {
    if (!confirm('Delete ALL visitor records? This permanently removes every page view, device, and visitor stat and cannot be undone.')) return;
    setClearing(true);
    try {
      const res = await visitorApi.clearAll();
      toast.success(res.message || 'All visitor data deleted');
      await load();
    } catch {
      toast.error('Failed to clear visitor data');
    } finally {
      setClearing(false);
    }
  };

  const deviceTotal = useMemo(
    () => (stats ? stats.devices.mobile + stats.devices.desktop + stats.devices.tablet : 0),
    [stats]
  );

  if (loading && !stats) return <Skeleton />;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Visitor Analytics</h1>
          <p className="text-gray-500 mt-1">Track how visitors engage with your site.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-white border border-gray-200 rounded-xl px-3 py-2">
            <Eye className="w-4 h-4 text-gold-500" />
            <span>
              All-time: <span className="font-bold text-primary-900">{stats?.total?.toLocaleString() ?? 0}</span>
            </span>
          </div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gold-500 hover:text-gold-500"
          >
            <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
            Refresh
          </button>
          {(stats?.total ?? 0) > 0 && (
            <button
              onClick={handleClearAll}
              disabled={clearing}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
            >
              <Trash className="w-4 h-4" />
              {clearing ? 'Deleting…' : 'Delete All'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {periodMeta.map((p) => {
          const val = stats?.periods?.[p.key];
          return (
            <div key={p.key} className="card p-6">
              <p className="text-sm text-gray-500 mb-1">{p.label}</p>
              <div className="flex items-end justify-between gap-2">
                <p className="text-3xl font-bold text-primary-900">
                  {(val?.current ?? 0).toLocaleString()}
                </p>
                {val ? <ChangeBadge pct={val.changePct} /> : null}
              </div>
              <p className="text-xs text-gray-500 mt-2">{p.hint}</p>
              <p className="text-xs text-gray-400 mt-1">{p.comparison}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-primary-900">Visitor Trend</h2>
              <p className="text-xs text-gray-500 mt-0.5">Page views over time</p>
            </div>
            <div className="inline-flex rounded-xl bg-gray-100 p-1">
              {rangeOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setRange(opt.key)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
                    range === opt.key ? 'bg-white text-primary-900 shadow-sm' : 'text-gray-500 hover:text-primary-900'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-sm text-gray-400">Loading…</div>
          ) : (
            <AreaChart data={chart?.data ?? []} />
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold text-primary-900 mb-2">New vs Returning</h2>
          <p className="text-xs text-gray-500 mb-5">New visitors are first-time visitors. Returning visitors have visited before.</p>
          {(() => {
            const nv = stats?.newVsReturning;
            const total = nv ? nv.new + nv.returning : 0;
            if (!nv || total === 0) {
              return <p className="text-sm text-gray-400 py-10 text-center">No visitor data yet. New and returning percentages will appear after visits are recorded.</p>;
            }
            const newPct = Math.round((nv.new / total) * 100);
            return (
              <div>
                <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 mb-6">
                  <div className="bg-indigo-500" style={{ width: `${newPct}%` }} />
                  <div className="bg-gold-500" style={{ width: `${100 - newPct}%` }} />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-indigo-500 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary-900">New Visitors</p>
                      <p className="text-xs text-gray-500">First-time visitors</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary-900">{nv.new.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">{newPct}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-gold-500 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary-900">Returning</p>
                      <p className="text-xs text-gray-500">Visitors who have visited before</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary-900">{nv.returning.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">{100 - newPct}%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-4 pt-3 mt-3 border-t border-gray-100 text-gray-400">
                    <span className="flex items-center gap-1 text-xs"><UserPlus className="w-3.5 h-3.5" /> {newPct}% New</span>
                    <span className="flex items-center gap-1 text-xs"><Repeat className="w-3.5 h-3.5" /> {100 - newPct}% Returning</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-primary-900 mb-1">Top Pages</h2>
          <p className="text-xs text-gray-500 mb-4">Most visited pages on your site</p>
          {stats?.topPages?.length ? (
            <div className="space-y-1">
              {stats.topPages.map((page, i) => {
                const maxCount = stats.topPages[0]?.count || 1;
                const share = Math.round((page.count / maxCount) * 100);
                return (
                  <div key={page.path} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <span className="w-6 text-sm font-semibold text-gray-400 text-right shrink-0">{i + 1}</span>
                    <Globe className="w-4 h-4 text-gray-300 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-medium text-primary-900 truncate">{formatPath(page.path)}</span>
                        <span className="text-xs text-gray-500 shrink-0">{page.count.toLocaleString()} views</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full bg-gold-500" style={{ width: `${share}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-8 text-center">No page views recorded yet.</p>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold text-primary-900 mb-1">Devices</h2>
          <p className="text-xs text-gray-500 mb-3">Visitors by device type</p>
          {deviceTotal > 0 ? (
            <div className="divide-y divide-gray-50">
              <DeviceRow label="Desktop" icon={Monitor} value={stats?.devices.desktop ?? 0} total={deviceTotal} color="bg-green-500" />
              <DeviceRow label="Mobile" icon={Smartphone} value={stats?.devices.mobile ?? 0} total={deviceTotal} color="bg-blue-500" />
              <DeviceRow label="Tablet" icon={Tablet} value={stats?.devices.tablet ?? 0} total={deviceTotal} color="bg-purple-500" />
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-10 text-center">No data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
