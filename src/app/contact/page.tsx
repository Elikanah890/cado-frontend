'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, ArrowRight, MessageCircle } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import { publicApi } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    company: '', serviceNeeded: '', budgetRange: '', message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await publicApi.submitContact(form);
      toast.success('Message sent! We will get back to you soon.');
      setForm({ firstName: '', lastName: '', email: '', phone: '', company: '', serviceNeeded: '', budgetRange: '', message: '' });
    } catch {
      toast.error('Failed to send. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <section className="section-padding bg-gradient-to-b from-primary-900 to-primary-800 text-white">
        <div className="container-custom text-center max-w-3xl">
          <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">Contact</span>
          <h1 className="text-4xl md:text-6xl font-bold mt-4 mb-6">Let&apos;s Work Together</h1>
          <p className="text-xl text-white/70">Have a project in mind? Get in touch with us today.</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="card p-6 text-center">
              <Phone className="w-8 h-8 text-gold-500 mx-auto mb-3" />
              <h3 className="font-bold text-primary-900 mb-1">Call Us</h3>
              <p className="text-gray-600 text-sm">+255 716 168 903</p>
              <p className="text-gray-600 text-sm">Mon-Fri, 8am-6pm</p>
            </div>
            <div className="card p-6 text-center">
              <Mail className="w-8 h-8 text-gold-500 mx-auto mb-3" />
              <h3 className="font-bold text-primary-900 mb-1">Email Us</h3>
              <p className="text-gray-600 text-sm">admin@cador.digital</p>
              <p className="text-gray-600 text-sm">We reply within 24 hours</p>
            </div>
            <div className="card p-6 text-center">
              <MapPin className="w-8 h-8 text-gold-500 mx-auto mb-3" />
              <h3 className="font-bold text-primary-900 mb-1">Visit Us</h3>
              <p className="text-gray-600 text-sm">Mbeya, Tanzania</p>
              <p className="text-gray-600 text-sm">By appointment only</p>
            </div>
          </div>

          <div className="card p-8 md:p-12">
            <h2 className="text-2xl font-bold text-primary-900 mb-8">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Needed</label>
                  <select value={form.serviceNeeded} onChange={(e) => setForm({ ...form, serviceNeeded: e.target.value })} className="input-field">
                    <option value="">Select a service</option>
                    <option>Brand Identity</option>
                    <option>Website Development</option>
                    <option>Digital Marketing</option>
                    <option>AI & Automation</option>
                    <option>Business Solutions</option>
                    <option>Creative Studio</option>
                    <option>Company Registration</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
                  <select value={form.budgetRange} onChange={(e) => setForm({ ...form, budgetRange: e.target.value })} className="input-field">
                    <option value="">Select budget</option>
                    <option>Under 500,000 TZS</option>
                    <option>500,000 - 1,000,000 TZS</option>
                    <option>1,000,000 - 5,000,000 TZS</option>
                    <option>5,000,000 - 10,000,000 TZS</option>
                    <option>10,000,000+ TZS</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input-field" required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary text-lg px-8 py-4 gap-2">
                {loading ? 'Sending...' : 'Send Message'} <Send className="w-5 h-5" />
              </button>
            </form>
          </div>

          <div className="flex justify-center gap-6 mt-8">
            <a href="https://wa.me/255716168903" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors font-medium">
              <MessageCircle className="w-5 h-5" /> WhatsApp
            </a>
            <a href="mailto:admin@cador.digital" className="flex items-center gap-2 px-6 py-3 border-2 border-primary-800 text-primary-800 rounded-full hover:bg-primary-800 hover:text-white transition-colors font-medium">
              <Mail className="w-5 h-5" /> Email Directly
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
