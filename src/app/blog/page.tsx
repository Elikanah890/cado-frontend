'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, User, FileText, Search, Eye, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import { publicApi } from '@/lib/api';
import { formatDate, slugify } from '@/lib/utils';
import { resolveImageUrl } from '@/lib/imageUtils';
import { useLanguage } from '@/lib/LanguageContext';
import type { Comment } from '@/types';

interface BlogCard {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  author: string;
  date: string;
  image: string;
  readTime: number;
  views: number;
  comments: Comment[];
  commentsCount: number;
}

const PER_PAGE = 9;

const mapPost = (post: any): BlogCard => ({
  title: post.title,
  excerpt: post.excerpt || '',
  category: post.category?.name || '',
  categorySlug: post.category?.slug || slugify(post.category?.name || ''),
  author: post.authorName || 'CadorDigital',
  date: post.publishedAt || post.createdAt,
  slug: post.slug,
  image: post.featuredImage,
  readTime: post.readTime || 1,
  views: post.views || 0,
  comments: post.comments || [],
  commentsCount: post._count?.comments ?? (post.comments || []).length,
});

export default function BlogPage() {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<BlogCard[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchPosts = useCallback((category: string, pageNum: number, searchTerm: string) => {
    setLoading(true);
    const params: any = { page: pageNum, limit: PER_PAGE };
    if (category !== 'All' && category) params.category = slugify(category);
    if (searchTerm.trim()) params.search = searchTerm.trim();

    publicApi.getBlogPage(params).then((response: any) => {
      const data = response?.data ?? response;
      const list = Array.isArray(data?.posts) ? data.posts : [];
      const cards: BlogCard[] = list.map(mapPost);
      setPosts(cards);
      if (Array.isArray(data?.categories)) {
        setCategories(data.categories.map((c: any) => c.name).filter(Boolean));
      }
      const pagination = data?.pagination;
      if (pagination?.pages) setTotalPages(pagination.pages);
      else setTotalPages(Math.max(1, Math.ceil(cards.length / PER_PAGE)));
    }).catch((err) => console.error('Failed to fetch blog posts:', err?.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPosts('All', 1, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectCategory = (cat: string) => {
    setActiveCategory(cat);
    setPage(1);
    fetchPosts(cat, 1, search);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPosts(activeCategory, 1, search);
  };

  const changePage = (p: number) => {
    setPage(p);
    fetchPosts(activeCategory, p, search);
  };

  const tabs = ['All', ...categories];

  return (
    <PublicLayout>
      <section className="section-padding bg-gradient-to-b from-primary-900 to-primary-800 text-white">
        <div className="container-custom text-center max-w-3xl">
          <span className="text-gold-500 font-semibold text-sm uppercase tracking-wider">{t('nav.blog')}</span>
          <h1 className="text-4xl md:text-6xl font-bold mt-4 mb-6">{t('blog.title')}</h1>
          <p className="text-xl text-white/70">{t('blog.subtitle')}</p>
          <form onSubmit={handleSearch} className="mt-8 max-w-lg mx-auto flex">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('blog.searchPlaceholder')}
              className="flex-1 px-4 py-3 rounded-l-lg text-primary-900 outline-none"
            />
            <button type="submit" className="px-5 bg-gold-500 hover:bg-gold-600 rounded-r-lg flex items-center gap-2 font-semibold transition-colors">
              <Search className="w-4 h-4" /> {t('blog.search')}
            </button>
          </form>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {tabs.map((cat) => (
              <button key={cat} onClick={() => selectCategory(cat)} className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat ? 'bg-gold-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
                {cat === 'All' ? t('common.all') : cat}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-center text-gray-500 py-12">{t('blog.loading')}</p>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">{t('blog.empty')}</p>
              <button onClick={() => { setSearch(''); fetchPosts('All', 1, ''); setActiveCategory('All'); setPage(1); }} className="btn-primary mt-4">{t('blog.viewAll')}</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="card group overflow-hidden flex flex-col">
                  <div className="aspect-video bg-gradient-to-br from-primary-200 to-primary-300 overflow-hidden">
                    {post.image ? (
                      <img src={resolveImageUrl(post.image)} alt={post.title} width={600} height={340} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-10 h-10 text-primary-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      {post.category && (
                        <span className="text-xs text-gold-500 font-medium uppercase bg-gold-50 px-2 py-0.5 rounded-full">{post.category}</span>
                      )}
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime} {t('blog.minRead')}</span>
                    </div>
                    <h3 className="text-lg font-bold text-primary-900 mt-1 mb-2 group-hover:text-gold-500 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">{post.excerpt}</p>
                    {post.comments && post.comments.length > 0 && (
                      <div className="mb-4 border-t pt-3">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-700 mb-2">
                          <MessageCircle className="w-3.5 h-3.5 text-gold-500" />
                          {post.commentsCount} {post.commentsCount !== 1 ? t('blog.comments') : t('blog.comment')}
                        </div>
                        <div className="space-y-2">
                          {post.comments.slice(0, 2).map((c) => (
                            <div key={c.id} className="bg-gray-50 rounded-lg p-2.5">
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="w-5 h-5 rounded-full bg-primary-200 text-primary-700 flex items-center justify-center text-[10px] font-bold">{c.name.charAt(0).toUpperCase()}</span>
                                <span className="text-xs font-semibold text-primary-900">{c.name}</span>
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2">{c.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-400 border-t pt-4">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</span>
                      <div className="flex items-center gap-3">
                        {post.views > 0 && <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views}</span>}
                        <span>{formatDate(post.date)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => changePage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => changePage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    page === p ? 'bg-gold-500 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => changePage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="container-custom text-center">
          <h2 className="text-2xl font-bold text-primary-900 mb-4">{t('blog.subscribeTitle')}</h2>
          <p className="text-gray-600 mb-6">{t('blog.subscribeSub')}</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={async (e) => { e.preventDefault(); }}>
            <input type="email" placeholder={t('footer.emailPlaceholder')} className="input-field flex-1" required />
            <button type="submit" className="btn-primary py-3 px-6">{t('footer.subscribe')}</button>
          </form>
        </div>
      </section>
    </PublicLayout>
  );
}
