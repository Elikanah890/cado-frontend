'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { publicApi } from '@/lib/api';

const WHATSAPP_NUMBER = '255716168903';

const TYPES = [
  { value: 'course', label: 'Course' },
  { value: 'product', label: 'Product' },
  { value: 'service', label: 'Service' },
] as const;

type RegistrationType = (typeof TYPES)[number]['value'];

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  type: RegistrationType;
  program: string;
  location: string;
  startDate: string;
  message: string;
};

function slugToTitle(slug: string): string {
  return slug
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || '-',
  };
}

function resolveType(value: string | null): RegistrationType {
  const normalized = (value || '').toLowerCase();
  return normalized === 'product' || normalized === 'service' ? normalized : 'course';
}

export default function RegisterForm() {
  const searchParams = useSearchParams();
  const initialSlug = searchParams.get('slug') || '';

  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    phone: '',
    type: resolveType(searchParams.get('type')),
    program: initialSlug ? slugToTitle(initialSlug) : '',
    location: '',
    startDate: '',
    message: '',
  });
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');

  const typeParam = searchParams.get('type');
  const slugParam = searchParams.get('slug');

  useEffect(() => {
    if (!slugParam && !typeParam) return;
    setForm((prev) => ({
      ...prev,
      type: typeParam ? resolveType(typeParam) : prev.type,
      program: slugParam ? slugToTitle(slugParam) : prev.program,
    }));
  }, [typeParam, slugParam]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim() || !form.program.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSaving(true);
    const typeLabel = TYPES.find((item) => item.value === form.type)?.label || 'Registration';
    const { firstName, lastName } = splitName(form.fullName);

    const savedMessage = [
      `Registration type: ${typeLabel}`,
      `Program/Product: ${form.program.trim()}`,
      form.location.trim() ? `Location: ${form.location.trim()}` : '',
      form.startDate ? `Preferred start date: ${form.startDate}` : '',
      form.message.trim() ? `Message: ${form.message.trim()}` : '',
      `Phone: ${form.phone.trim()}`,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await publicApi.submitContact({
        firstName,
        lastName,
        email: form.email.trim(),
        phone: form.phone.trim(),
        serviceNeeded: `${typeLabel}: ${form.program.trim()}`,
        message: savedMessage,
        source: `${form.type}-registration`,
      });
    } catch {
      toast.error('We could not save your details, but you can still continue on WhatsApp.');
    }

    const whatsappMessage = [
      'Habari CadorDigital, nataka kujiandikisha.',
      `*Jina:* ${form.fullName.trim()}`,
      `*Simu:* ${form.phone.trim()}`,
      `*Email:* ${form.email.trim()}`,
      `*Aina:* ${typeLabel}`,
      `*Programu:* ${form.program.trim()}`,
      `*Tarehe ya kuanza:* ${form.startDate || '-'}`,
      `*Mahali:* ${form.location.trim() || '-'}`,
      `*Ujumbe:* ${form.message.trim() || '-'}`,
    ].join('\n');

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;
    setWhatsappUrl(url);
    setSubmitted(true);
    setSaving(false);
    window.setTimeout(() => {
      window.location.href = url;
    }, 1600);
  };

  if (submitted) {
    return (
      <div className="card p-8 text-center md:p-12">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h2 className="text-2xl font-bold text-primary-900">Registration received</h2>
        <p className="mx-auto mt-3 max-w-md text-gray-600">
          Your details have been saved. You are being redirected to WhatsApp to complete your registration.
        </p>
        <a
          href={whatsappUrl}
          className="btn-primary mt-6 inline-flex items-center justify-center gap-2 px-8 py-3"
        >
          <MessageCircle className="h-5 w-5" /> Continue on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 md:p-10">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.fullName}
            onChange={(event) => update('fullName', event.target.value)}
            className="input-field"
            placeholder="e.g. Amina Said"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
            className="input-field"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Phone / WhatsApp Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(event) => update('phone', event.target.value)}
            className="input-field"
            placeholder="+255 7XX XXX XXX"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Registering For</label>
          <select
            value={form.type}
            onChange={(event) => update('type', event.target.value as RegistrationType)}
            className="input-field"
          >
            {TYPES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Program / Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.program}
            onChange={(event) => update('program', event.target.value)}
            className="input-field"
            placeholder="e.g. Social Media Marketing Mastery"
            required
          />
          <p className="mt-1 text-xs text-gray-400">Auto-filled from the course or product link. You can edit it.</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            value={form.location}
            onChange={(event) => update('location', event.target.value)}
            className="input-field"
            placeholder="e.g. Dar es Salaam"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Preferred Start Date</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(event) => update('startDate', event.target.value)}
            className="input-field"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Additional Message</label>
          <textarea
            value={form.message}
            onChange={(event) => update('message', event.target.value)}
            className="input-field"
            rows={5}
            placeholder="Tell us anything we should know before we contact you."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="btn-primary mt-8 inline-flex w-full items-center justify-center gap-2 py-4 text-lg"
      >
        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        {saving ? 'Submitting...' : 'Submit Registration'}
      </button>
      <p className="mt-3 text-center text-sm text-gray-500">
        Your details are saved and then sent to our WhatsApp for follow-up.
      </p>
    </form>
  );
}
