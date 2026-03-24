"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export const LOCALES = ["en", "zh-TW", "zh-CN", "ja", "ko", "ar", "es", "fr"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  "zh-TW": "繁體中文",
  "zh-CN": "简体中文",
  ja: "日本語",
  ko: "한국어",
  ar: "العربية",
  es: "Español",
  fr: "Français",
};

export const RTL_LOCALES: Locale[] = ["ar"];

type Messages = Record<string, unknown>;

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  dir: "ltr" | "rtl";
};

const I18nContext = createContext<I18nContextValue | null>(null);

// Cache loaded messages
const cache: Partial<Record<Locale, Messages>> = {};

async function loadMessages(locale: Locale): Promise<Messages> {
  if (cache[locale]) return cache[locale]!;
  const mod = await import(`@/messages/${locale}.json`);
  cache[locale] = mod.default;
  return mod.default;
}

function resolve(obj: unknown, path: string): string | undefined {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === "string" ? cur : undefined;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [messages, setMessages] = useState<Messages>({});

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved && LOCALES.includes(saved)) {
      setLocaleState(saved);
    }
  }, []);

  useEffect(() => {
    loadMessages(locale).then(setMessages);
    localStorage.setItem("locale", locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let str = resolve(messages, key) ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(`{${k}}`, String(v));
        }
      }
      return str;
    },
    [messages],
  );

  const dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be inside I18nProvider");
  return ctx;
}
