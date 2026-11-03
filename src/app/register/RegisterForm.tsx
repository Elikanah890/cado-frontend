'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  CheckCircle2,
  GraduationCap,
  Loader2,
  MessageCircle,
  Send,
  ShoppingBag,
} from 'lucide-react';
import { toast } from 'sonner';
import { publicApi } from '@/lib/api';
import type { RegistrationCategory } from '@/types';

const WHATSAPP_NUMBER = '255716168903';

const CATEGORIES: {
  value: RegistrationCategory;
  label: string;
  description: string;
  icon: any;
}[] = [
  { value: 'COURSE', label: 'Course / Training', description: 'Learn a practical skill with our team.', icon: GraduationCap },
  { value: 'PRODUCT', label: 'Digital Product', description: 'Templates, kits, and ready-made assets.', icon: ShoppingBag },
  { value: 'SERVICE', label: 'Professional Service', description: 'Branding, websites, marketing, and more.', icon: Briefcase },
];

const CATEGORY_LABELS: Record<RegistrationCategory, string> = {
  COURSE: 'Course / Training',
  PRODUCT: 'Digital Product',
  SERVICE: 'Professional Service',
};

type FormState = {
  category: RegistrationCategory;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  itemName: string;
  itemSlug: string;
  learningMode: string;
  startDate: string;
  experienceLevel: string;
  quantity: string;
  requirements: string;
  businessName: string;
  projectDescription: string;
  estimatedBudget: string;
  message: string;
  preferredContact: 'whatsapp' | 'phone' | 'email';
  consent: boolean;
};

const emptyForm: FormState = {
  category: 'COURSE',
  fullName: '',
  email: '',
  phone: '',
  location: '',
  itemName: '',
  itemSlug: '',
  learningMode: 'Online',
  startDate: '',
  experienceLevel: 'Beginner',
  quantity: '1',
  requirements: '',
  businessName: '',
  projectDescription: '',
  estimatedBudget: '',
  message: '',
  preferredContact: 'whatsapp',
  consent: false,
};

function slugToTitle(slug: string): string {
  return slug
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizePhone(value: string): string {
  const digits = value.replace(/[\s()-]/g, '');
  if (digits.startsWith('+255')) return digits;
  if (digits.startsWith('255')) return `+${digits}`;
  if (digits.startsWith('0')) return `+255${digits.slice(1)}`;
  return digits;
}

function resolveCategory(value: string | null): RegistrationCategory {
  const normalized = (value || '').toLowerCase();
  if (normalized === 'product') return 'PRODUCT';
  if (normalized === 'service') return 'SERVICE';
  return 'COURSE';
}

function humanize(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase());
}

export default function RegisterForm() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  const slugParam = searchParams.get('slug');

  const [form, setForm] = useState<FormState>(() => ({
    ...emptyForm,
    category: resolveCategory(typeParam),
    itemName: slugParam ? slugToTitle(slugParam) : '',
    itemSlug: slugParam || '',
  }));
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<{ ref: string; whatsappUrl: string } | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (!slugParam) return;
    let active = true;
    setForm((prev) => ({
      ...prev,
      category: resolveCategory(typeParam),
      itemName: slugToTitle(slugParam),
      itemSlug: slugParam,
    }));

    const load =
      resolveCategory(typeParam) === 'PRODUCT'
        ? publicApi.getProduct
        : resolveCategory(typeParam) === 'SERVICE'
          ? publicApi.getService
          : publicApi.getCourse;

    load(slugParam)
      .then((res: any) => {
        const item = res?.data;
        const title = item?.title || item?.name;
        if (active && title) {
          setForm((prev) => ({ ...prev, itemName: title }));
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [slugParam, typeParam]);

  const selectCategory = (category: RegistrationCategory) => {
    setForm((prev) => ({
      ...prev,
      category,
      itemName: prev.category === category ? prev.itemName : '',
      itemSlug: prev.category === category ? prev.itemSlug : '',
    }));
  };

  const buildDetails = () => {
    if (form.category === 'COURSE') {
      return {
        learningMode: form.learningMode,
        startDate: form.startDate,
        experienceLevel: form.experienceLevel,
      };
    }
    if (form.category === 'PRODUCT') {
      return {
        quantity: Number(form.quantity) || 1,
        requirements: form.requirements.trim(),
      };
    }
    return {
      businessName: form.businessName.trim(),
      projectDescription: form.projectDescription.trim(),
      estimatedBudget: form.estimatedBudget ? Number(form.estimatedBudget) : null,
    };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.fullName.trim()) {
      toast.error('Please enter your full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast.error('Please enter a valid email address.');
      return;
    }
    const phoneDigits = form.phone.replace(/[\s()-]/g, '');
    if (!/^(?:\+?255|0)\d{9}$/.test(phoneDigits)) {
      toast.error('Please enter a valid Tanzania phone number (+255...).');
      return;
    }
    if (!form.itemName.trim()) {
      toast.error('Please enter the course, product, or service name.');
      return;
    }
    if (form.category === 'PRODUCT' && (!form.quantity || Number(form.quantity) < 1)) {
      toast.error('Please enter a valid quantity.');
      return;
    }
    if (!form.consent) {
      toast.error('Please accept the privacy consent to continue.');
      return;
    }

    const details = buildDetails();
    const categoryLabel = CATEGORY_LABELS[form.category];
    const normalizedPhone = normalizePhone(form.phone);

    setSaving(true);
    try {
      const res: any = await publicApi.createRegistration({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: normalizedPhone,
        location: form.location.trim(),
        category: form.category,
        itemName: form.itemName.trim(),
        itemSlug: form.itemSlug || undefined,
        details,
        message: form.message.trim(),
        preferredContact: form.preferredContact,
        consent: true,
      });

      const ref = res?.data?.ref || res?.ref;
      if (!ref) throw new Error('Registration reference was not returned');

      const detailLines = Object.entries(details)
        .filter(([, value]) => value !== '' && value !== null && value !== undefined)
        .map(([key, value]) => `${humanize(key)}: ${value}`)
        .join('\n');

      const whatsappMessage = [
        'Habari CadorDigital, nataka kujiandikisha.',
        `*Ref:* ${ref}`,
        `*Jina:* ${form.fullName.trim()}`,
        `*Simu:* ${normalizedPhone}`,
        `*Email:* ${form.email.trim()}`,
        `*Aina:* ${categoryLabel}`,
        `*Programu:* ${form.itemName.trim()}`,
        detailLines ? `*Maelezo:*\n${detailLines}` : '',
        form.location.trim() ? `*Mahali:* ${form.location.trim()}` : '',
        `*Mawasiliano:* ${form.preferredContact}`,
        form.message.trim() ? `*Ujumbe:* ${form.message.trim()}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      setSuccess({
        ref,
        whatsappUrl: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`,
      });
      toast.success('Registration submitted successfully.');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Could not submit your registration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSuccess(null);
    setForm({ ...emptyForm });
  };

  if (success) {
    return (
      <div className="card p-8 text-center md:p-12">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h2 className="text-2xl font-bold text-primary-900">Registration received</h2>
        <p className="mx-auto mt-3 max-w-md text-gray-600">
          Your registration was saved successfully. Use the reference below when you contact us.
        </p>
        <div className="mx-auto mt-6 max-w-xs rounded-xl border border-gold-500/30 bg-gold-50 px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold-700">Your Reference</p>
          <p className="mt-1 text-2xl font-bold text-primary-900">{success.ref}</p>
        </div>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={success.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-3"
          >
            <MessageCircle className="h-5 w-5" /> Continue on WhatsApp
          </a>
          <button type="button" onClick={resetForm} className="btn-secondary px-8 py-3">
            Submit another registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 md:p-10">
      <div>
        <h2 className="text-lg font-bold text-primary-900">1. What are you registering for?</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const active = form.category === category.value;
            return (
              <button
                key={category.value}
                type="button"
                onClick={() => selectCategory(category.value)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  active
                    ? 'border-gold-500 bg-gold-50 ring-2 ring-gold-500/20'
                    : 'border-gray-200 bg-white hover:border-gold-300 hover:bg-gray-50'
                }`}
              >
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${active ? 'bg-gold-500 text-white' : 'bg-gold-50 text-gold-600'}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-bold text-primary-900">{category.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">{category.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 border-t border-gray-100 pt-8">
        <h2 className="text-lg font-bold text-primary-900">2. Your details</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
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
              Phone / WhatsApp <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(event) => update('phone', event.target.value)}
              className="input-field"
              placeholder="+255 7XX XXX XXX"
              required
            />
            <p className="mt-1 text-xs text-gray-400">Use a valid Tanzania number starting with +255 or 0.</p>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(event) => update('location', event.target.value)}
              className="input-field"
              placeholder="e.g. Dar es Salaam"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-gray-100 pt-8">
        <h2 className="text-lg font-bold text-primary-900">3. {CATEGORY_LABELS[form.category]} details</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {form.category === 'COURSE' ? 'Course Name' : form.category === 'PRODUCT' ? 'Product Name' : 'Service Required'}{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.itemName}
              onChange={(event) => update('itemName', event.target.value)}
              className="input-field"
              placeholder={
                form.category === 'COURSE'
                  ? 'e.g. Digital Marketing Foundations'
                  : form.category === 'PRODUCT'
                    ? 'e.g. Social Media Template Pack'
                    : 'e.g. Brand Identity'
              }
              required
            />
            {form.itemSlug ? (
              <p className="mt-1 text-xs text-gray-400">Auto-filled from the link. You can edit it.</p>
            ) : null}
          </div>

          {form.category === 'COURSE' && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Learning Mode</label>
                <select value={form.learningMode} onChange={(event) => update('learningMode', event.target.value)} className="input-field">
                  <option value="Online">Online</option>
                  <option value="Physical">Physical</option>
                  <option value="Not Sure">Not Sure</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Experience Level</label>
                <select value={form.experienceLevel} onChange={(event) => update('experienceLevel', event.target.value)} className="input-field">
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Preferred Start Date</label>
                <input type="date" value={form.startDate} onChange={(event) => update('startDate', event.target.value)} className="input-field" />
              </div>
            </>
          )}

          {form.category === 'PRODUCT' && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(event) => update('quantity', event.target.value)}
                  className="input-field"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Requirements</label>
                <textarea
                  value={form.requirements}
                  onChange={(event) => update('requirements', event.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Any specific format, size, or customisation you need."
                />
              </div>
            </>
          )}

          {form.category === 'SERVICE' && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Business Name</label>
                <input
                  type="text"
                  value={form.businessName}
                  onChange={(event) => update('businessName', event.target.value)}
                  className="input-field"
                  placeholder="Your business name"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Estimated Budget (TZS)</label>
                <input
                  type="number"
                  min="0"
                  value={form.estimatedBudget}
                  onChange={(event) => update('estimatedBudget', event.target.value)}
                  className="input-field"
                  placeholder="e.g. 500000"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Project Description</label>
                <textarea
                  value={form.projectDescription}
                  onChange={(event) => update('projectDescription', event.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Tell us what you need and what success looks like."
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-8 border-t border-gray-100 pt-8">
        <h2 className="text-lg font-bold text-primary-900">4. Additional information</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Preferred Contact Method</label>
            <select
              value={form.preferredContact}
              onChange={(event) => update('preferredContact', event.target.value as FormState['preferredContact'])}
              className="input-field"
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="phone">Phone call</option>
              <option value="email">Email</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Additional Message</label>
            <textarea
              value={form.message}
              onChange={(event) => update('message', event.target.value)}
              className="input-field"
              rows={4}
              placeholder="Anything else we should know before we contact you."
            />
          </div>
        </div>

        <label className="mt-5 flex items-start gap-3 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(event) => update('consent', event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-gold-500 focus:ring-gold-500"
            required
          />
          <span>
            I agree to CadorDigital storing my details and contacting me about this registration. See our{' '}
            <Link href="/privacy" className="font-semibold text-gold-600 hover:text-gold-700">Privacy Policy</Link>.
          </span>
        </label>
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
        You will get a reference number, then continue with us on WhatsApp.
      </p>
    </form>
  );
}
