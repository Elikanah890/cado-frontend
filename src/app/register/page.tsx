import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CheckCircle2, ClipboardList, MessageCircle, ShieldCheck } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import { buildMetadata } from '@/components/SEO';
import RegisterForm from './RegisterForm';

export const metadata: Metadata = buildMetadata({
  title: 'Register',
  description:
    'Register for a CadorDigital course, digital product, or service. Submit your details and continue on WhatsApp to complete your registration.',
  url: '/register',
  keywords: ['register', 'course registration', 'CadorDigital', 'Tanzania', 'digital courses'],
});

const steps = [
  {
    icon: ClipboardList,
    title: 'Fill in your details',
    description: 'Tell us what you want to register for and how we can reach you.',
  },
  {
    icon: MessageCircle,
    title: 'Continue on WhatsApp',
    description: 'Your registration is saved, then you finish the conversation with our team on WhatsApp.',
  },
  {
    icon: CheckCircle2,
    title: 'Get confirmed',
    description: 'We confirm availability, payment, and the next steps for your course, product, or service.',
  },
];

export default function RegisterPage() {
  return (
    <PublicLayout>
      <section className="section-padding relative overflow-hidden bg-gradient-to-b from-primary-900 to-primary-800 text-white">
        <div aria-hidden className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="container-custom relative max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-gold-500">Registration</span>
          <h1 className="mb-6 mt-4 text-4xl font-bold md:text-6xl">Register With CadorDigital</h1>
          <p className="text-xl text-white/70">
            Fill in the form for a course, digital product, or service. We save your details and continue with you on WhatsApp.
          </p>
        </div>
      </section>

      <section className="section-padding bg-slate-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Suspense
                fallback={
                  <div className="card p-8 md:p-10">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {[...Array(6)].map((_, index) => (
                        <div key={index} className="animate-pulse">
                          <div className="mb-2 h-4 w-24 rounded bg-gray-200" />
                          <div className="h-11 w-full rounded-lg bg-gray-100" />
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 h-12 w-full animate-pulse rounded-lg bg-gray-100" />
                  </div>
                }
              >
                <RegisterForm />
              </Suspense>
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl border-t-4 border-gold-500 bg-white p-6 shadow-md shadow-gray-200/60">
                <h2 className="text-lg font-bold text-primary-900">How it works</h2>
                <div className="mt-5 space-y-5">
                  {steps.map((step, index) => (
                    <div key={step.title} className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-50 text-gold-600">
                        <step.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-primary-900">
                          {index + 1}. {step.title}
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-primary-900 p-6 text-white shadow-lg">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-gold-400">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <h2 className="text-lg font-bold">Need help?</h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  Chat with our team directly on WhatsApp if you are unsure which course, product, or service is right for you.
                </p>
                <a
                  href="https://wa.me/255716168903"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-gold-600"
                >
                  <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
