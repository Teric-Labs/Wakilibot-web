import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { 
  selectLanguage, 
  selectIsInitialized, 
  selectLanguageOptions, 
  selectCurrentLanguageInfo,
  setLanguage,
  initializeLanguage 
} from '../store/slices/languageSlice';

export const useLanguage = () => {
  const dispatch = useDispatch();
  const selectedLanguage = useSelector(selectLanguage);
  const isInitialized = useSelector(selectIsInitialized);
  const languageOptions = useSelector(selectLanguageOptions);
  const currentLanguageInfo = useSelector(selectCurrentLanguageInfo);

  // Initialize language on mount
  useEffect(() => {
    if (!isInitialized) {
      console.log('🌍 [REDUX HOOK] Initializing language...');
      dispatch(initializeLanguage());
    }
  }, [dispatch, isInitialized]);

  // Update language function
  const updateLanguage = (languageCode) => {
    console.log('🌍 [REDUX HOOK] Updating language to:', languageCode);
    dispatch(setLanguage(languageCode));
  };

  // Get current language info
  const getCurrentLanguageInfo = () => {
    return currentLanguageInfo;
  };

  // Get current language code
  const getCurrentLanguage = () => {
    return selectedLanguage;
  };

  return {
    selectedLanguage,
    updateLanguage,
    getCurrentLanguageInfo,
    getCurrentLanguage,
    languageOptions,
    isInitialized
  };
};

export default useLanguage;

