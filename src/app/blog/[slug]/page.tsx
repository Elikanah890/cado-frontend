'use client';

import Link from 'next/link';
import { use } from 'react';
import { Clock, User, Tag, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import { publicApi } from '@/lib/api';
import { useEffect, useState } from 'react';

const postData: Record<string, any> = {
  'digital-marketing-strategies-tanzania': {
    title: '10 Digital Marketing Strategies for Tanzanian Businesses',
    excerpt: 'Discover proven digital marketing strategies tailored for the Tanzanian market.',
    content: `Digital marketing is rapidly transforming how businesses reach and engage their customers in Tanzania. With increasing internet penetration and mobile phone usage, there has never been a better time to invest in digital marketing.\n\nWhether you run a small business in Mbeya or a growing enterprise elsewhere in Tanzania, these strategies will help you grow your brand and increase revenue.`,
    category: 'Marketing', author: 'John Kimaro', date: '2024-06-15',
    tags: ['Digital Marketing', 'SEO', 'Social Media'],
  },
  'ai-transforming-business-africa': {
    title: 'How AI is Transforming Business Operations in Africa',
    excerpt: 'Artificial intelligence is revolutionizing how African businesses operate and grow.',
    content: `Artificial Intelligence is no longer a futuristic concept — it's here and transforming businesses across Africa. From chatbots handling customer service to predictive analytics optimizing supply chains, AI is creating unprecedented efficiency.\n\nTanzanian businesses are increasingly adopting AI tools to automate processes, analyze data, and improve customer experiences.`,
    category: 'AI', author: 'Dr. Emmanuel K', date: '2024-06-10',
    tags: ['AI', 'Automation', 'Technology'],
  },
};

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [post, setPost] = useState(postData[slug]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    publicApi.getBlogPost(slug).then((response) => {
      const item: any = response.data;
      setPost({ title: item.title, excerpt: item.excerpt || '', content: item.content || '', category: item.category?.name || '', author: item.authorName || '', date: item.publishedAt || item.createdAt, tags: (item.tags || []).map((tag: any) => tag.tag?.name || tag.name).filter(Boolean) });
    }).catch(() => {}).finally(() => setLoaded(true));
  }, [slug]);
  if (!post && !loaded) return <PublicLayout><div className="section-padding text-center">Loading post...</div></PublicLayout>;
  if (!post) return <PublicLayout><div className="section-padding text-center"><h1 className="text-3xl font-bold">Post not found</h1><Link href="/blog" className="btn-primary mt-4">Back to Blog</Link></div></PublicLayout>;

  return (
    <PublicLayout>
      <article>
        <section className="section-padding bg-gradient-to-b from-primary-900 to-primary-800 text-white">
          <div className="container-custom max-w-4xl">
            <Link href="/blog" className="text-white/60 hover:text-gold-500 text-sm mb-4 inline-block">← Back to Blog</Link>
            <span className="bg-gold-500/20 text-gold-400 px-3 py-1 rounded-full text-sm">{post.category}</span>
            <h1 className="text-3xl md:text-5xl font-bold mt-4 mb-6">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-6 text-white/70 text-sm">
              <span className="flex items-center gap-1"><User className="w-4 h-4" /> {post.author}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {post.date}</span>
            </div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-custom max-w-4xl">
            <div className="flex gap-6">
              <div className="hidden lg:flex flex-col gap-3 sticky top-28 h-fit">
                <button className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition-colors"><Facebook className="w-4 h-4" /></button>
                <button className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-sky-100 hover:text-sky-600 transition-colors"><Twitter className="w-4 h-4" /></button>
                <button className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-blue-100 hover:text-blue-600 transition-colors"><Linkedin className="w-4 h-4" /></button>
                <button className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"><Share2 className="w-4 h-4" /></button>
              </div>
              <div className="flex-1">
                <p className="text-lg text-gray-600 mb-8 leading-relaxed italic border-l-4 border-gold-500 pl-6">
                  {post.excerpt}
                </p>
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                  {post.content.split('\n\n').map((p: string, i: number) => (
                    <p key={i} className="mb-4">{p}</p>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t">
                  {post.tags.map((tag: string) => (
                    <span key={tag} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      <Tag className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding bg-gray-50">
          <div className="container-custom max-w-4xl">
            <div className="card p-8 flex items-start gap-6">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-primary-700" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary-900">{post.author}</h3>
                <p className="text-gray-600 text-sm mt-1">Digital strategy expert at CadorDigital. Passionate about helping businesses grow through technology and innovation.</p>
              </div>
            </div>
          </div>
        </section>
      </article>
    </PublicLayout>
  );
}
