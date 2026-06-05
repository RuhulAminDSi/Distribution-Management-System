import { createContext, useContext, useState, useEffect } from 'react';
import enMessages from '../messages/messages_en.json';
import bnMessages from '../messages/messages_bn.json';

const translations = { en: enMessages, bn: bnMessages };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const getInitialLanguage = () => {
    try {
      const saved = localStorage.getItem('dms_language');
      if (saved === 'bn' || saved === 'en') {
        return saved;
      }
    } catch (e) {
      console.error('Error reading language:', e);
    }
    return 'bn';
  };
  
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    localStorage.setItem('dms_language', language);
  }, [language]);

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('dms_language');
      if (saved && saved !== language) {
        setLanguage(saved);
      }
    };
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(handleStorage, 500);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, [language]);

  const t = (key) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, formatNumber, toBanglaNumber }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function formatCurrency(amount, lang = 'en') {
  if (amount === null || amount === undefined || isNaN(amount)) return lang === 'bn' ? '৳ 0' : '৳ 0';
  const formatted = new Intl.NumberFormat('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  return (lang === 'bn' ? '৳ ' : '৳ ') + (lang === 'bn' ? toBanglaNumber(formatted) : formatted);
}

export function toBanglaNumber(num) {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (digit) => banglaDigits[digit]);
}

export function formatNumber(num, lang = 'en') {
  if (num === null || num === undefined || isNaN(num)) return lang === 'bn' ? '০' : '0';
  const formatted = new Intl.NumberFormat('en-BD').format(num);
  return lang === 'bn' ? toBanglaNumber(formatted) : formatted;
}

export function formatDate(dateStr, lang = 'en') {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const formatted = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return lang === 'bn' ? toBanglaNumber(formatted) : formatted;
}

export function formatDateTime(dateStr, lang = 'en') {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const formatted = date.toLocaleString('en-GB', { 
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
  return lang === 'bn' ? toBanglaNumber(formatted) : formatted;
}
