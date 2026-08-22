'use client';

import Link from 'next/link';
import { Clock, User, ArrowRight, FileText } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import { publicApi } from '@/lib/api';
import { useEffect, useState } from 'react';

const fallbackPosts = [
  { title: '10 Digital Marketing Strategies for Tanzanian Businesses', excerpt: 'Discover proven digital marketing strategies tailored for the Tanzanian market.', category: 'Marketing', author: 'John Kimaro', date: '2024-06-15', slug: 'digital-marketing-strategies-tanzania', image: null },
  { title: 'How AI is Transforming Business Operations in Africa', excerpt: 'Artificial intelligence is revolutionizing how African businesses operate and grow.', category: 'AI', author: 'Dr. Emmanuel K', date: '2024-06-10', slug: 'ai-transforming-business-africa', image: null },
  { title: 'The Ultimate Guide to Brand Identity Design', excerpt: 'Everything you need to know about creating a memorable brand identity.', category: 'Branding', author: 'Amina Rashid', date: '2024-06-05', slug: 'ultimate-guide-brand-identity', image: null },
  { title: 'Why Your Business Needs a Professional Website in 2024', excerpt: 'A professional website is no longer optional — it is essential for business growth.', category: 'Technology', author: 'Sarah Mushi', date: '2024-05-28', slug: 'why-business-needs-website-2024', image: null },
  { title: '5 Ways Automation Can Save Your Business Money', excerpt: 'Learn how automation can reduce costs and increase efficiency in your business.', category: 'AI', author: 'Grace Mwakasege', date: '2024-05-20', slug: 'automation-save-business-money', image: null },
  { title: 'Social Media Trends Every Business Should Know', excerpt: 'Stay ahead with the latest social media trends for business growth.', category: 'Marketing', author: 'Peter Makundi', date: '2024-05-15', slug: 'social-media-trends-business', image: null },
];

const categories = ['All', 'Marketing', 'Technology', 'AI', 'Branding', 'Business Growth', 'Tutorials'];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [posts, setPosts] = useState(fallbackPosts);

  useEffect(() => {
    const fetchPosts = () => {
      publicApi.getBlogPosts().then((response) => {
        const data = Array.isArray(response.data) ? response.data : response.data?.posts || response.data?.data || [];
        if (Array.isArray(data) && data.length > 0) {
          setPosts(data.map((post: any) => ({
            title: post.title,
            excerpt: post.excerpt || '',
            category: post.category?.name || post.category || '',
            author: post.authorName || '',
            date: post.publishedAt || post.createdAt,
            slug: post.slug,
            image: post.featuredImage,
          })));
        } else if (Array.isArray(data) && data.length === 0) {
          setPosts([]);
        }
      }).catch((err) => console.error('Failed to fetch blog posts:', err?.message));
    };
    fetchPosts();
    const onFocus = () => fetchPosts();
    const onVis = () => { if (!document.hidden) fetchPosts(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  const filtered = activeCategory === 'All' ? posts : posts.filter((p) => p.category === activeCategory);

  return (
    <PublicLayout>
      <section className="section-padding bg-gradient-to-b from-primary-900 to-primary-800 text-white">
        <div className="container-custom text-center max-w-3xl">
          <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">Blog</span>
          <h1 className="text-4xl md:text-6xl font-bold mt-4 mb-6">Insights & Resources</h1>
          <p className="text-xl text-white/70">Expert tips, guides, and insights for your business growth.</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat ? 'bg-gold-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="card group overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-primary-200 to-primary-300 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-primary-400" />
                </div>
                <div className="p-6">
                  <span className="text-xs text-gold-500 font-medium uppercase">{post.category}</span>
                  <h3 className="text-lg font-bold text-primary-900 mt-2 mb-3 group-hover:text-gold-500 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.date}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="container-custom text-center">
          <h2 className="text-2xl font-bold text-primary-900 mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-gray-600 mb-6">Get the latest tips and insights delivered to your inbox.</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={async (e) => { e.preventDefault(); }}>
            <input type="email" placeholder="Your email" className="input-field flex-1" required />
            <button type="submit" className="btn-primary py-3 px-6">Subscribe</button>
          </form>
        </div>
      </section>
    </PublicLayout>
  );
}
