import { createContext, useContext, useState, useEffect } from "react";
import translations from "../data/translations.js";

const LanguageContext = createContext();

export const supportedLanguages = [
  { code: 'en-US', name: 'English' },
  { code: 'ml-IN', name: 'മലയാളം' },
  { code: 'ta-IN', name: 'தமிழ்' },
];

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(
    localStorage.getItem("appLanguage") || "en-US"
  );

  useEffect(() => {
    localStorage.setItem("appLanguage", language);
  }, [language]);
  
  const langCode = language.split('-')[0]; // get 'en', 'ml', or 'ta' for translations
  const t = translations[langCode] || translations.en;

  const value = {
    language,
    setLanguage,
    supportedLanguages,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

