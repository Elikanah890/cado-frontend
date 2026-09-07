'use client';

import { useState } from 'react';
import {
  MessageCircle, Link2, Facebook, Twitter, Linkedin, Share2, Check
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/LanguageContext';

interface ShareButtonsProps {
  title?: string;
  compact?: boolean;
}

/**
 * Reusable social share buttons (WhatsApp, copy link, Facebook, Twitter/X, LinkedIn).
 * Uses the current page URL and an optional title for messages.
 */
export default function ShareButtons({ title, compact = true }: ShareButtonsProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const message = title || document.title || 'Check this out';

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${message} - ${url}`)}`, '_blank', 'noopener,noreferrer');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(t('share.copySuccess'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('share.copyError'));
    }
  };

  const share = (network: string) => {
    const encUrl = encodeURIComponent(url);
    const encText = encodeURIComponent(message);
    let target = '';
    if (network === 'facebook') target = `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`;
    else if (network === 'twitter') target = `https://twitter.com/intent/tweet?url=${encUrl}&text=${encText}`;
    else if (network === 'linkedin') target = `https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`;
    if (target) window.open(target, '_blank', 'noopener,noreferrer');
  };

  const btnBase = 'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors';
  const props = compact
    ? 'h-10 w-10 p-0'
    : 'px-4 py-2.5';

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 flex items-center gap-1 mr-1">
        <Share2 className="w-4 h-4" /> {t('share.share')}
      </span>
      <button
        type="button"
        onClick={shareWhatsApp}
        title={t('share.whatsappTitle')}
        className={`${btnBase} ${props} bg-green-500 text-white hover:bg-green-600`}
        aria-label={t('share.whatsappTitle')}
      >
        <MessageCircle className="w-4 h-4" />
        {!compact && t('share.whatsappLabel')}
      </button>
      <button
        type="button"
        onClick={copyLink}
        title={t('share.copyTitle')}
        className={`${btnBase} ${props} bg-gray-800 text-white hover:bg-gray-900`}
        aria-label={t('share.copyTitle')}
      >
        {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
        {!compact && (copied ? t('share.copiedLabel') : t('share.copyLabel'))}
      </button>
      <button
        type="button"
        onClick={() => share('facebook')}
        title={t('share.facebookTitle')}
        className={`${btnBase} ${props} bg-blue-600 text-white hover:bg-blue-700 hidden md:inline-flex`}
        aria-label={t('share.facebookTitle')}
      >
        <Facebook className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => share('twitter')}
        title={t('share.twitterTitle')}
        className={`${btnBase} ${props} bg-sky-500 text-white hover:bg-sky-600 hidden md:inline-flex`}
        aria-label={t('share.twitterTitle')}
      >
        <Twitter className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => share('linkedin')}
        title={t('share.linkedinTitle')}
        className={`${btnBase} ${props} bg-blue-700 text-white hover:bg-blue-800 hidden md:inline-flex`}
        aria-label={t('share.linkedinTitle')}
      >
        <Linkedin className="w-4 h-4" />
      </button>
    </div>
  );
}