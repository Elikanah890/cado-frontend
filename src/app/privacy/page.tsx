'use client';

import PublicLayout from '@/components/PublicLayout';

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <section className="section-padding bg-gradient-to-b from-primary-900 to-primary-800 text-white">
        <div className="container-custom text-center max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold">Privacy Policy</h1>
          <p className="text-xl text-white/70 mt-4">Last updated: June 2024</p>
        </div>
      </section>
      <section className="section-padding">
        <div className="container-custom max-w-3xl prose prose-lg">
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us when you fill out forms or communicate with us. This includes your name, email address, phone number, and company name.</p>
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services and communicate with you about your project.</p>
          <h2>3. Information Sharing</h2>
          <p>We do not sell, trade, or rent your personal information to third parties. We may share information with trusted service providers who assist us in operating our website and conducting our business.</p>
          <h2>4. Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information.</p>
          <h2>5. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us at admin@cador.digital.</p>
        </div>
      </section>
    </PublicLayout>
  );
}
