'use client';

import PublicLayout from '@/components/PublicLayout';

export default function TermsPage() {
  return (
    <PublicLayout>
      <section className="section-padding bg-gradient-to-b from-primary-900 to-primary-800 text-white">
        <div className="container-custom text-center max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold">Terms & Conditions</h1>
          <p className="text-xl text-white/70 mt-4">Last updated: June 2024</p>
        </div>
      </section>
      <section className="section-padding">
        <div className="container-custom max-w-3xl prose prose-lg">
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using the CadorDigital website and services, you agree to be bound by these Terms and Conditions.</p>
          <h2>2. Services</h2>
          <p>CadorDigital provides digital agency services including branding, web development, digital marketing, AI automation, creative services, and business solutions. All services are subject to separate agreements or proposals.</p>
          <h2>3. Service Discussions</h2>
          <p>Project scope, pricing, and delivery terms are discussed directly with CadorDigital and confirmed in an individual service agreement.</p>
          <h2>4. Intellectual Property</h2>
          <p>Upon completion of the agreed engagement, clients receive ownership of final deliverables. CadorDigital retains rights to display work in our portfolio unless otherwise agreed.</p>
          <h2>5. Limitation of Liability</h2>
          <p>CadorDigital shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services.</p>
        </div>
      </section>
    </PublicLayout>
  );
}
