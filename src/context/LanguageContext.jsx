import React, { createContext, useState, useContext } from 'react';
import { en } from '../locales/en';
import { ta } from '../locales/ta';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Default to English, check localStorage if saved previously
  const [language, setLanguage] = useState(localStorage.getItem('uyir_lang') || 'en');

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ta' : 'en';
    setLanguage(newLang);
    localStorage.setItem('uyir_lang', newLang);
  };

  // Select the correct dictionary based on state
  const t = language === 'en' ? en : ta;

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language anywhere easily
export const useLanguage = () => useContext(LanguageContext);