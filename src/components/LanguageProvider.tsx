"use client";

import { createContext, useContext, useCallback } from "react";
import { LANG_COOKIE, WELCOME_COOKIE, makeT, normalizeLang, type Lang } from "@/lib/i18n";

type Ctx = { lang: Lang; t: (k: string) => string; setLang: (code: string) => void };
const LanguageContext = createContext<Ctx | null>(null);

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; samesite=lax`;
}

export function LanguageProvider({ initialLang, children }: { initialLang: Lang; children: React.ReactNode }) {
  const setLang = useCallback((code: string) => {
    const lang = normalizeLang(code);
    writeCookie(LANG_COOKIE, lang);
    writeCookie(WELCOME_COOKIE, "1");
    // Full reload so every Server Component re-renders in the new locale.
    window.location.reload();
  }, []);

  const value: Ctx = { lang: initialLang, t: makeT(initialLang), setLang };
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang(): Ctx {
  const ctx = useContext(LanguageContext);
  if (!ctx) return { lang: "en", t: makeT("en"), setLang: () => {} };
  return ctx;
}
