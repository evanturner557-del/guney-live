// Lightweight, cookie-based i18n for Güney.live.
// Locale lives in the `guney_lang` cookie. English is the source language;
// Turkish is the only other fully-translated locale "for now" — the rest are
// listed in the picker as coming soon. Server components read the cookie via
// `getServerLang()`; client components use the LanguageProvider/useT hook.

export type Lang = "en" | "tr";
export const ACTIVE_LANGS: Lang[] = ["en", "tr"];
export const DEFAULT_LANG: Lang = "en";
export const LANG_COOKIE = "guney_lang";
export const WELCOME_COOKIE = "guney_welcome_seen";

export type LangOption = { code: string; native: string; flag: string; active: boolean };

// 34 languages shown in the picker; flags + native names. Only en + tr work now.
export const LANGUAGES: LangOption[] = [
  { code: "en", native: "English", flag: "🇬🇧", active: true },
  { code: "tr", native: "Türkçe", flag: "🇹🇷", active: true },
  { code: "de", native: "Deutsch", flag: "🇩🇪", active: false },
  { code: "fr", native: "Français", flag: "🇫🇷", active: false },
  { code: "es", native: "Español", flag: "🇪🇸", active: false },
  { code: "it", native: "Italiano", flag: "🇮🇹", active: false },
  { code: "nl", native: "Nederlands", flag: "🇳🇱", active: false },
  { code: "pt", native: "Português", flag: "🇵🇹", active: false },
  { code: "ru", native: "Русский", flag: "🇷🇺", active: false },
  { code: "uk", native: "Українська", flag: "🇺🇦", active: false },
  { code: "pl", native: "Polski", flag: "🇵🇱", active: false },
  { code: "ro", native: "Română", flag: "🇷🇴", active: false },
  { code: "el", native: "Ελληνικά", flag: "🇬🇷", active: false },
  { code: "bg", native: "Български", flag: "🇧🇬", active: false },
  { code: "sr", native: "Srpski", flag: "🇷🇸", active: false },
  { code: "cs", native: "Čeština", flag: "🇨🇿", active: false },
  { code: "hu", native: "Magyar", flag: "🇭🇺", active: false },
  { code: "sv", native: "Svenska", flag: "🇸🇪", active: false },
  { code: "no", native: "Norsk", flag: "🇳🇴", active: false },
  { code: "da", native: "Dansk", flag: "🇩🇰", active: false },
  { code: "fi", native: "Suomi", flag: "🇫🇮", active: false },
  { code: "az", native: "Azərbaycanca", flag: "🇦🇿", active: false },
  { code: "ar", native: "العربية", flag: "🇸🇦", active: false },
  { code: "fa", native: "فارسی", flag: "🇮🇷", active: false },
  { code: "ur", native: "اردو", flag: "🇵🇰", active: false },
  { code: "he", native: "עברית", flag: "🇮🇱", active: false },
  { code: "hi", native: "हिन्दी", flag: "🇮🇳", active: false },
  { code: "zh", native: "中文", flag: "🇨🇳", active: false },
  { code: "ja", native: "日本語", flag: "🇯🇵", active: false },
  { code: "ko", native: "한국어", flag: "🇰🇷", active: false },
  { code: "id", native: "Bahasa Indonesia", flag: "🇮🇩", active: false },
  { code: "th", native: "ไทย", flag: "🇹🇭", active: false },
  { code: "vi", native: "Tiếng Việt", flag: "🇻🇳", active: false },
  { code: "sw", native: "Kiswahili", flag: "🇰🇪", active: false },
];

export function langOption(code: string): LangOption {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}

type Dict = Record<string, string>;

const en: Dict = {
  // nav / chrome
  "nav.community": "Community",
  "nav.opportunities": "Opportunities",
  "nav.gallery": "Gallery",
  "nav.guide": "Guide",
  "nav.members": "Members",
  "nav.language": "Language",
  "nav.dashboard": "My dashboard",
  "nav.operations": "Operations",
  "nav.signout": "Sign out",
  "nav.join": "Join",
  // footer
  "footer.tagline": "Güney, Yeşilova, Burdur — the village, online.",
  "footer.privacy": "Privacy",
  "footer.terms": "Terms",
  "footer.contact": "Contact",
  // home hero
  "home.eyebrow": "Yeşilova · Burdur · Türkiye",
  "home.title": "The village of Güney, open to the world.",
  "home.subtitle":
    "A 900-year-old village, 8 km from Lake Salda. This is its digital home — what's happening, who needs help, and what you can build here.",
  "home.cta.join": "Become part of Güney",
  "home.cta.visit": "Plan a visit",
  "home.where": "Where it is",
  "home.directions": "Directions →",
  "home.pictures": "The village in pictures",
  "home.all": "All →",
  "home.col.latest": "Latest from the village",
  "home.col.coming": "Coming up",
  "home.col.doors": "Open doors",
  "home.noevents": "No events pinned yet.",
  "home.allupdates": "All updates →",
  "home.allevents": "All events →",
  "home.allopps": "All opportunities →",
  "home.orient.new.t": "New here?",
  "home.orient.new.b": "Where Güney is, how to get here, where to stay — the practical guide.",
  "home.orient.build.t": "Want to build?",
  "home.orient.build.b": "Stone houses to restore, land to farm, a guesthouse waiting to exist.",
  "home.orient.in.t": "Want in?",
  "home.orient.in.b": "Join the community — villagers, diaspora, newcomers, visitors. All of it counts.",
  // welcome modal
  "welcome.title": "Köyümüz Güney'e hoş geldiniz!",
  "welcome.subtitle": "Welcome to our village. Choose your language to get started.",
  "welcome.pick": "Choose your language",
  "welcome.soon": "soon",
  "welcome.continue": "Continue",
  // language picker
  "lang.title": "Choose language",
  "lang.soon": "Coming soon",
};

const tr: Dict = {
  "nav.community": "Topluluk",
  "nav.opportunities": "Fırsatlar",
  "nav.gallery": "Galeri",
  "nav.guide": "Rehber",
  "nav.members": "Üyeler",
  "nav.language": "Dil",
  "nav.dashboard": "Panelim",
  "nav.operations": "Yönetim",
  "nav.signout": "Çıkış yap",
  "nav.join": "Katıl",
  "footer.tagline": "Güney, Yeşilova, Burdur — köyümüz, çevrimiçi.",
  "footer.privacy": "Gizlilik",
  "footer.terms": "Koşullar",
  "footer.contact": "İletişim",
  "home.eyebrow": "Yeşilova · Burdur · Türkiye",
  "home.title": "Güney köyü, dünyaya açık.",
  "home.subtitle":
    "900 yıllık bir köy, Salda Gölü'ne 8 km uzaklıkta. Burası onun dijital evi — neler oluyor, kimin yardıma ihtiyacı var ve burada ne inşa edebilirsiniz.",
  "home.cta.join": "Güney'in bir parçası ol",
  "home.cta.visit": "Ziyaret planla",
  "home.where": "Nerede",
  "home.directions": "Yol tarifi →",
  "home.pictures": "Resimlerle köy",
  "home.all": "Tümü →",
  "home.col.latest": "Köyden son haberler",
  "home.col.coming": "Yaklaşan etkinlikler",
  "home.col.doors": "Açık kapılar",
  "home.noevents": "Henüz etkinlik yok.",
  "home.allupdates": "Tüm haberler →",
  "home.allevents": "Tüm etkinlikler →",
  "home.allopps": "Tüm fırsatlar →",
  "home.orient.new.t": "Yeni misiniz?",
  "home.orient.new.b": "Güney nerede, nasıl gelinir, nerede kalınır — pratik rehber.",
  "home.orient.build.t": "İnşa etmek mi istiyorsunuz?",
  "home.orient.build.b": "Restore edilecek taş evler, ekilecek topraklar, kurulmayı bekleyen bir pansiyon.",
  "home.orient.in.t": "Katılmak mı istiyorsunuz?",
  "home.orient.in.b": "Topluluğa katılın — köylüler, diaspora, yeni gelenler, ziyaretçiler. Hepsi değerli.",
  "welcome.title": "Köyümüz Güney'e hoş geldiniz!",
  "welcome.subtitle": "Köyümüze hoş geldiniz. Başlamak için dilinizi seçin.",
  "welcome.pick": "Dilinizi seçin",
  "welcome.soon": "yakında",
  "welcome.continue": "Devam et",
  "lang.title": "Dil seçin",
  "lang.soon": "Yakında",
};

export const DICTS: Record<Lang, Dict> = { en, tr };

export function normalizeLang(value: string | undefined | null): Lang {
  return value === "tr" ? "tr" : "en";
}

export function makeT(lang: Lang) {
  const table = DICTS[lang] ?? en;
  return (key: string): string => table[key] ?? en[key] ?? key;
}
