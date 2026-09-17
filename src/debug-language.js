// Debug script to test language context
console.log('🌍 [DEBUG] Testing language context...');

// Check if language context is available
try {
  const { useLanguage } = require('./contexts/LanguageContext');
  console.log('🌍 [DEBUG] Language context imported successfully');
} catch (error) {
  console.error('🌍 [DEBUG] Error importing language context:', error);
}

// Check localStorage
const savedLanguage = localStorage.getItem('wakilibot_language');
console.log('🌍 [DEBUG] Saved language in localStorage:', savedLanguage);

// Check if the language context is working
console.log('🌍 [DEBUG] Testing complete');
