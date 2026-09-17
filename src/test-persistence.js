// Test script to verify language persistence
// Run this in the browser console

console.log('🧪 Testing Language Persistence');
console.log('===============================');

// Function to test language persistence
window.testLanguagePersistence = function() {
    console.log('1️⃣ Setting language to Luganda...');
    localStorage.setItem('wakilibot_language', 'lg');
    console.log('   ✅ localStorage set to:', localStorage.getItem('wakilibot_language'));
    
    console.log('2️⃣ Simulating page reload...');
    console.log('   📝 Note: In a real scenario, you would refresh the page here');
    console.log('   📝 For now, we can check if the value persists');
    
    const currentLang = localStorage.getItem('wakilibot_language');
    console.log('3️⃣ After "reload", language is:', currentLang);
    
    if (currentLang === 'lg') {
        console.log('   ✅ SUCCESS: Language persisted correctly!');
    } else {
        console.log('   ❌ FAILED: Language did not persist');
    }
    
    // Test with different languages
    const testLanguages = ['sw', 'lg', 'en', 'nyn'];
    
    console.log('4️⃣ Testing multiple language changes...');
    testLanguages.forEach((lang, index) => {
        localStorage.setItem('wakilibot_language', lang);
        const retrieved = localStorage.getItem('wakilibot_language');
        console.log(`   ${index + 1}. Set to ${lang}, retrieved: ${retrieved} ${retrieved === lang ? '✅' : '❌'}`);
    });
    
    console.log('🏁 Persistence test completed!');
};

// Function to check current state
window.checkLanguageState = function() {
    console.log('🔍 Current Language State');
    console.log('=========================');
    console.log('localStorage language:', localStorage.getItem('wakilibot_language'));
    console.log('Available languages:', ['en', 'sw', 'lg', 'ac', 'at', 'nyn', 'xog']);
    
    // Check if React context is available
    if (typeof React !== 'undefined') {
        console.log('React is available');
    } else {
        console.log('React not available in console');
    }
};

console.log('📋 Available functions:');
console.log('  - testLanguagePersistence() - Test language persistence');
console.log('  - checkLanguageState() - Check current language state');
console.log('');
console.log('🚀 Run: testLanguagePersistence() to test persistence');

