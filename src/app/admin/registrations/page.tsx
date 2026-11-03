'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  DollarSign,
  Eye,
  Loader2,
  Mail,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api';
import type {
  Registration,
  RegistrationCategory,
  RegistrationStats,
  RegistrationStatus,
} from '@/types';

const CATEGORY_LABELS: Record<string, string> = {
  COURSE: 'Course / Training',
  PRODUCT: 'Digital Product',
  SERVICE: 'Professional Service',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  CONTACTED: 'Contacted',
  PAID: 'Paid',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-amber-100 text-amber-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const emptyManual = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  category: 'COURSE' as RegistrationCategory,
  itemName: '',
  message: '',
  status: 'PENDING' as RegistrationStatus,
  internalNotes: '',
};

function humanize(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase());
}

function whatsappDigits(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('255')) return digits;
  if (digits.startsWith('0')) return `255${digits.slice(1)}`;
  return digits;
}

export default function AdminRegistrationsPage() {
  const [stats, setStats] = useState<RegistrationStats>({ total: 0, pending: 0, confirmed: 0, thisMonth: 0 });
  const [rows, setRows] = useState<Registration[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<Registration | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailStatus, setDetailStatus] = useState<RegistrationStatus>('PENDING');
  const [detailNotes, setDetailNotes] = useState('');
  const [savingDetail, setSavingDetail] = useState(false);

  const [manualOpen, setManualOpen] = useState(false);
  const [manualForm, setManualForm] = useState({ ...emptyManual });
  const [manualSaving, setManualSaving] = useState(false);

  const loadStats = async () => {
    try {
      const res = await adminApi.getRegistrationStats();
      setStats(res.data);
    } catch {
      // keep previous stats
    }
  };

  const loadRows = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getRegistrations({
        search: search.trim() || undefined,
        category: category === 'ALL' ? undefined : category,
        status: status === 'ALL' ? undefined : status,
        page,
        limit: 20,
      });
      setRows(res.data.registrations);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadRows, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, status, page]);

  const refresh = async () => {
    await Promise.all([loadStats(), loadRows()]);
    toast.success('Refreshed');
  };

  const openDetail = async (row: Registration) => {
    setSelected(row);
    setDetailStatus(row.status);
    setDetailNotes(row.internalNotes || '');
    setDetailLoading(true);
    try {
      const res = await adminApi.getRegistration(row.id);
      const registration = res.data;
      setSelected(registration);
      setDetailStatus(registration.status);
      setDetailNotes(registration.internalNotes || '');
    } catch {
      toast.error('Failed to load registration details');
    } finally {
      setDetailLoading(false);
    }
  };

  const saveDetail = async () => {
    if (!selected) return;
    setSavingDetail(true);
    try {
      const res = await adminApi.updateRegistration(selected.id, {
        status: detailStatus,
        internalNotes: detailNotes,
      });
      const updated = res.data;
      setSelected(updated);
      setRows((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
      toast.success('Registration updated');
      loadStats();
    } catch {
      toast.error('Failed to update registration');
    } finally {
      setSavingDetail(false);
    }
  };

  const quickStatus = async (row: Registration, nextStatus: RegistrationStatus) => {
    try {
      const res = await adminApi.updateRegistration(row.id, { status: nextStatus });
      const updated = res.data;
      setRows((prev) => prev.map((item) => (item.id === row.id ? updated : item)));
      if (selected?.id === row.id) {
        setSelected(updated);
        setDetailStatus(updated.status);
      }
      toast.success('Status updated');
      loadStats();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const removeRegistration = async (row: Registration) => {
    if (!confirm(`Delete registration ${row.ref}? This cannot be undone.`)) return;
    try {
      await adminApi.deleteRegistration(row.id);
      if (selected?.id === row.id) setSelected(null);
      toast.success('Registration deleted');
      await Promise.all([loadRows(), loadStats()]);
    } catch {
      toast.error('Failed to delete registration');
    }
  };

  const submitManual = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!manualForm.fullName.trim() || !manualForm.phone.trim() || !manualForm.itemName.trim()) {
      toast.error('Name, phone, and item are required');
      return;
    }
    setManualSaving(true);
    try {
      await adminApi.createManualRegistration({
        fullName: manualForm.fullName.trim(),
        email: manualForm.email.trim() || undefined,
        phone: manualForm.phone.trim(),
        location: manualForm.location.trim(),
        category: manualForm.category,
        itemName: manualForm.itemName.trim(),
        details: {},
        message: manualForm.message.trim(),
        preferredContact: 'whatsapp',
        consent: true,
        status: manualForm.status,
        internalNotes: manualForm.internalNotes.trim(),
        source: 'MANUAL',
      });
      toast.success('Manual lead added');
      setManualOpen(false);
      setManualForm({ ...emptyManual });
      await Promise.all([loadRows(), loadStats()]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to add manual lead');
    } finally {
      setManualSaving(false);
    }
  };

  const cards = [
    { label: 'Total Registrations', value: stats.total, icon: ClipboardList, color: 'bg-primary-50 text-primary-700' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'bg-amber-50 text-amber-700' },
    { label: 'Confirmed / Paid', value: stats.confirmed, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700' },
    { label: 'This Month', value: stats.thisMonth, icon: DollarSign, color: 'bg-blue-50 text-blue-700' },
  ];

  const waHref = selected
    ? `https://wa.me/${whatsappDigits(selected.phone)}?text=${encodeURIComponent(
        `Habari ${selected.fullName}, kuhusu usajili wako ${selected.ref}. Tuko tayari kukusaidia.`
      )}`
    : '#';

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Registrations</h1>
          <p className="mt-1 text-gray-500">Manage course, product, and service registrations in one place.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={refresh} className="btn-secondary gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button onClick={() => setManualOpen(true)} className="btn-primary gap-2">
            <Plus className="h-4 w-4" /> Add Manual Lead
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="mt-2 text-3xl font-bold text-primary-900">{card.value}</p>
              </div>
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="card mb-6 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              className="input-field pl-9"
              placeholder="Search by name, ref, phone, email, or item"
            />
          </div>
          <select
            value={category}
            onChange={(event) => { setCategory(event.target.value); setPage(1); }}
            className="input-field lg:max-w-[190px]"
          >
            <option value="ALL">All Categories</option>
            <option value="COURSE">Course / Training</option>
            <option value="PRODUCT">Digital Product</option>
            <option value="SERVICE">Professional Service</option>
          </select>
          <select
            value={status}
            onChange={(event) => { setStatus(event.target.value); setPage(1); }}
            className="input-field lg:max-w-[170px]"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONTACTED">Contacted</option>
            <option value="PAID">Paid</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-500">Ref</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Phone / WhatsApp</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Item</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">Loading...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">No registrations found</td></tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-primary-900">{row.ref}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{new Date(row.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-primary-900">{row.fullName}</p>
                      <p className="text-xs text-gray-400">{row.email || '—'}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">{row.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{CATEGORY_LABELS[row.category] || row.category}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-gray-600">{row.itemName}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[row.status] || 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[row.status] || row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openDetail(row)}
                          className="rounded p-1.5 hover:bg-gray-100"
                          title="View details"
                        >
                          <Eye className="h-4 w-4 text-gray-500" />
                        </button>
                        <select
                          value={row.status}
                          onChange={(event) => quickStatus(row, event.target.value as RegistrationStatus)}
                          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600"
                          title="Quick status update"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="PAID">Paid</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                        <button
                          onClick={() => removeRegistration(row)}
                          className="rounded p-1.5 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm text-gray-500">
          <p>
            {pagination.total === 0 ? '0' : `${(pagination.page - 1) * pagination.limit + 1}–${Math.min(pagination.page * pagination.limit, pagination.total)}`} of {pagination.total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={pagination.page <= 1}
              className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(pagination.pages || 1, prev + 1))}
              disabled={pagination.page >= (pagination.pages || 1)}
              className="rounded-lg border px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-8 w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs font-semibold text-gold-600">{selected.ref}</p>
                <h2 className="mt-1 text-xl font-bold text-primary-900">{selected.fullName}</h2>
                <p className="text-sm text-gray-500">
                  {CATEGORY_LABELS[selected.category] || selected.category} · {selected.itemName}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-lg p-2 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center py-12 text-gray-400">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading details...
              </div>
            ) : (
              <>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Email</p>
                    <p className="mt-1 text-sm text-gray-700">{selected.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Phone / WhatsApp</p>
                    <p className="mt-1 text-sm text-gray-700">{selected.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Location</p>
                    <p className="mt-1 text-sm text-gray-700">{selected.location || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Preferred Contact</p>
                    <p className="mt-1 text-sm capitalize text-gray-700">{selected.preferredContact}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Source</p>
                    <p className="mt-1 text-sm capitalize text-gray-700">{selected.source?.toLowerCase()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Submitted</p>
                    <p className="mt-1 text-sm text-gray-700">{new Date(selected.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {selected.details && Object.keys(selected.details).length > 0 && (
                  <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Registration Details</p>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {Object.entries(selected.details)
                        .filter(([, value]) => value !== '' && value !== null && value !== undefined)
                        .map(([key, value]) => (
                          <div key={key}>
                            <p className="text-xs text-gray-400">{humanize(key)}</p>
                            <p className="text-sm text-gray-700">{String(value)}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {selected.message && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Message</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{selected.message}</p>
                  </div>
                )}

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={detailStatus}
                      onChange={(event) => setDetailStatus(event.target.value as RegistrationStatus)}
                      className="input-field"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="PAID">Paid</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Internal Notes <span className="text-xs font-normal text-gray-400">(private — not visible to the customer)</span>
                  </label>
                  <textarea
                    value={detailNotes}
                    onChange={(event) => setDetailNotes(event.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="e.g. Called on Monday, will pay Friday."
                  />
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <button onClick={saveDetail} disabled={savingDetail} className="btn-primary gap-2">
                    {savingDetail ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Save Changes
                  </button>
                  <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn-secondary gap-2">
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                  {selected.email ? (
                    <a href={`mailto:${selected.email}`} className="btn-secondary gap-2">
                      <Mail className="h-4 w-4" /> Email
                    </a>
                  ) : null}
                  <button onClick={() => removeRegistration(selected)} className="ml-auto inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {manualOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
          <form onSubmit={submitManual} className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-primary-900">Add Manual Lead</h2>
                <p className="mt-1 text-sm text-gray-500">Record someone who contacted you directly on WhatsApp.</p>
              </div>
              <button type="button" onClick={() => setManualOpen(false)} className="rounded-lg p-2 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Full Name *</label>
                <input value={manualForm.fullName} onChange={(e) => setManualForm({ ...manualForm, fullName: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Phone / WhatsApp *</label>
                <input value={manualForm.phone} onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })} className="input-field" placeholder="+255 7XX XXX XXX" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email (optional)</label>
                <input type="email" value={manualForm.email} onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
                <input value={manualForm.location} onChange={(e) => setManualForm({ ...manualForm, location: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                <select value={manualForm.category} onChange={(e) => setManualForm({ ...manualForm, category: e.target.value as RegistrationCategory })} className="input-field">
                  <option value="COURSE">Course / Training</option>
                  <option value="PRODUCT">Digital Product</option>
                  <option value="SERVICE">Professional Service</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Item *</label>
                <input value={manualForm.itemName} onChange={(e) => setManualForm({ ...manualForm, itemName: e.target.value })} className="input-field" placeholder="Course, product, or service" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                <select value={manualForm.status} onChange={(e) => setManualForm({ ...manualForm, status: e.target.value as RegistrationStatus })} className="input-field">
                  <option value="PENDING">Pending</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="PAID">Paid</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Message</label>
                <textarea value={manualForm.message} onChange={(e) => setManualForm({ ...manualForm, message: e.target.value })} className="input-field" rows={2} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Internal Notes</label>
                <textarea value={manualForm.internalNotes} onChange={(e) => setManualForm({ ...manualForm, internalNotes: e.target.value })} className="input-field" rows={2} />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setManualOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={manualSaving} className="btn-primary gap-2">
                {manualSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add Lead
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
