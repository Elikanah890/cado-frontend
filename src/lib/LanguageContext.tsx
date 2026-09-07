'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import en from '@/locales/en.json';
import sw from '@/locales/sw.json';

export type Language = 'en' | 'sw';

const COOKIE_KEY = 'cador_lang';
const STORAGE_KEY = 'cador_lang';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type Dictionary = Record<string, unknown>;

const dictionaries: Record<Language, Dictionary> = { en: en as Dictionary, sw: sw as Dictionary };

function resolveStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  try {
    const cookie = document.cookie
      .split('; ')
      .find((c) => c.startsWith(`${COOKIE_KEY}=`));
    const stored = cookie
      ? decodeURIComponent(cookie.split('=')[1])
      : window.localStorage.getItem(STORAGE_KEY);
    return stored === 'en' || stored === 'sw' ? stored : 'en';
  } catch {
    return 'en';
  }
}

function lookup(dict: Dictionary, key: string): string | undefined {
  let node: unknown = dict;
  for (const part of key.split('.')) {
    if (node && typeof node === 'object' && part in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof node === 'string' ? node : undefined;
}

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    setLanguageState(resolveStoredLanguage());
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      document.cookie = `${COOKIE_KEY}=${lang}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {}
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'sw' : 'en');
  }, [language, setLanguage]);

  const t = useCallback(
    (key: string) => {
      const localized = lookup(dictionaries[language], key);
      if (localized !== undefined) return localized;
      const fallback = lookup(dictionaries.en, key);
      return fallback !== undefined ? fallback : key;
    },
    [language]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, toggleLanguage, t }),
    [language, setLanguage, toggleLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
