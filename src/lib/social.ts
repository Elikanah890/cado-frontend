'use client';

import { useEffect, useState } from 'react';
import { publicApi } from './api';
import { SOCIAL_LINKS, type SocialLinks } from './seo';

export function normalizeSocialLinks(
  data?: Record<string, string | null> | null
): SocialLinks {
  return {
    instagram: data?.social_instagram?.trim() || SOCIAL_LINKS.instagram,
    youtube: data?.social_youtube?.trim() || SOCIAL_LINKS.youtube,
    facebook: data?.social_facebook?.trim() || SOCIAL_LINKS.facebook,
  };
}

let cached: Promise<SocialLinks> | null = null;

function loadSocialLinks(): Promise<SocialLinks> {
  if (!cached) {
    cached = publicApi
      .getSettings()
      .then((res) => normalizeSocialLinks(res.data))
      .catch(() => {
        cached = null;
        return SOCIAL_LINKS;
      });
  }
  return cached;
}

export function useSocialLinks(): SocialLinks {
  const [links, setLinks] = useState<SocialLinks>(SOCIAL_LINKS);

  useEffect(() => {
    let active = true;
    loadSocialLinks().then((values) => {
      if (active) setLinks(values);
    });
    return () => {
      active = false;
    };
  }, []);

  return links;
}
