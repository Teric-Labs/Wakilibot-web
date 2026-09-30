import React, { createContext, useContext, useState, useEffect } from 'react';
import { t as translateFn } from '../i18n/translations';

// Language options with display names and codes
export const LANGUAGE_OPTIONS = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'sw', name: 'Swahili', flag: '🇹🇿' },
  { code: 'lg', name: 'Luganda', flag: '🇺🇬' },
  { code: 'ac', name: 'Acholi', flag: '🇺🇬' },
  { code: 'at', name: 'Ateso', flag: '🇺🇬' },
  { code: 'nyn', name: 'Runyankole', flag: '🇺🇬' },
  { code: 'xog', name: 'Lusoga', flag: '🇺🇬' },
];

// Create the language context
const LanguageContext = createContext();

// Language provider component
export const LanguageProvider = ({ children }) => {
  // Initialize with localStorage value if available, otherwise default to 'en'
  const getInitialLanguage = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedLanguage = localStorage.getItem('wakilibot_language');
        if (savedLanguage && LANGUAGE_OPTIONS.find((lang) => lang.code === savedLanguage)) {
          console.log('🌍 [INIT] Loading saved language from localStorage:', savedLanguage);
          return savedLanguage;
        }
      }
    } catch (error) {
      console.warn('🌍 [INIT] Error accessing localStorage:', error);
    }
    console.log('🌍 [INIT] Using default language: en');
    return 'en';
  };

  const [selectedLanguage, setSelectedLanguage] = useState(getInitialLanguage);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load language preference from localStorage on mount
  useEffect(() => {
    const initializeLanguage = () => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const savedLanguage = localStorage.getItem('wakilibot_language');
          if (savedLanguage && LANGUAGE_OPTIONS.find((lang) => lang.code === savedLanguage)) {
            console.log('🌍 [EFFECT] Setting language from localStorage:', savedLanguage);
            setSelectedLanguage(savedLanguage);
          } else {
            console.log('🌍 [EFFECT] No valid saved language, using default: en');
            setSelectedLanguage('en');
            localStorage.setItem('wakilibot_language', 'en');
          }
        }
      } catch (error) {
        console.warn('🌍 [EFFECT] Error accessing localStorage:', error);
        setSelectedLanguage('en');
      }
      setIsInitialized(true);
    };

    initializeLanguage();
  }, []);

  // Save language preference to localStorage when changed
  const updateLanguage = (languageCode) => {
    if (LANGUAGE_OPTIONS.find((lang) => lang.code === languageCode)) {
      setSelectedLanguage(languageCode);
      localStorage.setItem('wakilibot_language', languageCode);
      console.log('🌍 Language updated to:', languageCode);
    }
  };

  // Get current language info
  const getCurrentLanguageInfo = () => {
    return LANGUAGE_OPTIONS.find((lang) => lang.code === selectedLanguage) || LANGUAGE_OPTIONS[0];
  };

  // Centralized language getter that ensures consistency
  const getCurrentLanguage = () => {
    return selectedLanguage;
  };

  /**
   * Translation helper bound to the current language.
   * Usage: t('sidebar', 'workspace') → 'Eneo la Kazi' (in Swahili)
   */
  const t = (section, key) => translateFn(selectedLanguage, section, key);

  const value = {
    selectedLanguage,
    updateLanguage,
    getCurrentLanguageInfo,
    getCurrentLanguage,
    languageOptions: LANGUAGE_OPTIONS,
    isInitialized,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
