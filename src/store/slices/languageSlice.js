import { createSlice } from '@reduxjs/toolkit';

// Language options with display names and codes
export const LANGUAGE_OPTIONS = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'sw', name: 'Swahili', flag: '🇹🇿' },
  { code: 'lg', name: 'Luganda', flag: '🇺🇬' },
  { code: 'ac', name: 'Acholi', flag: '🇺🇬' },
  { code: 'at', name: 'Ateso', flag: '🇺🇬' },
  { code: 'nyn', name: 'Runyankole', flag: '🇺🇬' },
  { code: 'xog', name: 'Lusoga', flag: '🇺🇬' }
];

// Get initial language from localStorage or default to English
const getInitialLanguage = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedLanguage = localStorage.getItem('wakilibot_language');
      if (savedLanguage && LANGUAGE_OPTIONS.find(lang => lang.code === savedLanguage)) {
        console.log('🌍 [REDUX] Loading saved language from localStorage:', savedLanguage);
        return savedLanguage;
      }
    }
  } catch (error) {
    console.warn('🌍 [REDUX] Error accessing localStorage:', error);
  }
  console.log('🌍 [REDUX] Using default language: en');
  return 'en';
};

const initialState = {
  selectedLanguage: getInitialLanguage(),
  isInitialized: false,
  languageOptions: LANGUAGE_OPTIONS,
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      const languageCode = action.payload;
      if (LANGUAGE_OPTIONS.find(lang => lang.code === languageCode)) {
        state.selectedLanguage = languageCode;
        state.isInitialized = true;
        
        // Also update localStorage for backward compatibility
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('wakilibot_language', languageCode);
          }
        } catch (error) {
          console.warn('🌍 [REDUX] Error updating localStorage:', error);
        }
        
        console.log('🌍 [REDUX] Language updated to:', languageCode);
        console.log('🌍 [REDUX] State updated - selectedLanguage:', state.selectedLanguage);
      }
    },
    initializeLanguage: (state) => {
      const savedLanguage = getInitialLanguage();
      state.selectedLanguage = savedLanguage;
      state.isInitialized = true;
      console.log('🌍 [REDUX] Language initialized:', savedLanguage);
    },
    resetLanguage: (state) => {
      state.selectedLanguage = 'en';
      state.isInitialized = true;
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('wakilibot_language', 'en');
        }
      } catch (error) {
        console.warn('🌍 [REDUX] Error resetting localStorage:', error);
      }
      console.log('🌍 [REDUX] Language reset to English');
    },
  },
});

export const { setLanguage, initializeLanguage, resetLanguage } = languageSlice.actions;

// Selectors
export const selectLanguage = (state) => state.language.selectedLanguage;
export const selectIsInitialized = (state) => state.language.isInitialized;
export const selectLanguageOptions = (state) => state.language.languageOptions;
export const selectCurrentLanguageInfo = (state) => {
  const currentLang = state.language.selectedLanguage;
  return LANGUAGE_OPTIONS.find(lang => lang.code === currentLang) || LANGUAGE_OPTIONS[0];
};

export default languageSlice.reducer;

