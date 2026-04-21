import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type Language = 'en' | 'so' | 'ar';

export const translations = {
  "nav.eas": { en: "EAs", so: "EAs", ar: "EAs" },
  "nav.indicators": { en: "Indicators", so: "Indicators", ar: "المؤشرات" },
  "nav.charts": { en: "Live Charts", so: "Live Charts", ar: "الرسوم البيانية" },
  "nav.courses": { en: "Courses", so: "Koorsooyinka", ar: "الدورات" },
  "nav.login": { en: "Login", so: "Gal", ar: "تسجيل الدخول" },
  "nav.register": { en: "Register", so: "Isdiiwaangeli", ar: "التسجيل" },
  "nav.logout": { en: "Logout", so: "Bax", ar: "تسجيل الخروج" },
  "nav.store": { en: "Store", so: "Store", ar: "المتجر" },
  "nav.profile": { en: "Profile", so: "Profile", ar: "الملف الشخصي" },
  "store.liveBadge": { en: "🟢 LIVE · 20+ EAs READY", so: "🟢 LIVE · 20+ EAs DIYAAR AH", ar: "🟢 مباشر · +20 مستشار خبير جاهز" },
  "store.heroDesc": { en: "Professional Expert Advisors & Trading Tools for MetaTrader 4 & 5.", so: "Expert Advisors xirfadleh oo MetaTrader 4 & 5 ah.", ar: "مستشارون خبراء وأدوات تداول احترافية لـ MetaTrader 4 و 5." },
  "store.browseEAs": { en: "Browse EAs →", so: "Eeg EAs →", ar: "تصفح EAs ←" },
  "store.courses": { en: "📚 Courses", so: "📚 Koorsooyin", ar: "📚 الدورات" },
  "store.socialMedia": { en: "Social Media", so: "Social Media", ar: "وسائل التواصل" },
  "store.support": { en: "Support", so: "Taageero", ar: "الدعم" },
  "store.searchEAs": { en: "Search Expert Advisors...", so: "Raadi Expert Advisors...", ar: "ابحث عن مستشار خبير..." },
  "store.all": { en: "All", so: "Dhammaan", ar: "الكل" },
  "store.found": { en: "found", so: "la helay", ar: "وُجد" },
  "store.noResults": { en: "No results found", so: "Wax lama helin", ar: "لم يتم العثور على نتائج" },
  "store.buy": { en: "Buy →", so: "Iibso →", ar: "← شراء" },
  "store.loginFirst": { en: "Please login first!", so: "Fadlan marka hore gal!", ar: "يرجى تسجيل الدخول أولاً!" },
  "store.tradingRisk": { en: "© 2025 SomFX Store — Trading involves risk.", so: "© 2025 SomFX Store — Ganacsigu khatarta wuu leeyahay.", ar: "© 2025 SomFX Store — التداول ينطوي على مخاطر." },
  "login.welcome": { en: "Welcome Back", so: "Ku soo dhawoow", ar: "مرحباً بعودتك" },
  "login.subtitle": { en: "Login to your SomFX Store account", so: "Gal akoonkaaga SomFX Store", ar: "سجّل الدخول إلى حسابك في SomFX Store" },
  "login.email": { en: "Email", so: "Email", ar: "البريد الإلكتروني" },
  "login.password": { en: "Password", so: "Password", ar: "كلمة المرور" },
  "login.submit": { en: "Login →", so: "Gal →", ar: "← تسجيل الدخول" },
  "login.noAccount": { en: "Don't have an account?", so: "Akoon ma lihid?", ar: "ليس لديك حساب؟" },
  "login.registerHere": { en: "Register here", so: "Halkan isdiiwaangeli", ar: "سجّل هنا" },
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof translations) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => (localStorage.getItem('somfx-lang') as Language) || 'en');

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('somfx-lang', newLang);
  }, []);

  const t = useCallback((key: keyof typeof translations) => {
    return translations[key]?.[lang] || key;
  }, [lang]);

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [dir, lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
