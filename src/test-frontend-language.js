// Test script to verify frontend language integration
// Run this in the browser console when the app is running

console.log('🧪 Testing Frontend Language Integration');
console.log('=' * 50);

// Test 1: Check localStorage
const localStorageLang = localStorage.getItem('wakilibot_language');
console.log('1️⃣ localStorage language:', localStorageLang);

// Test 2: Check if we can access the API service
if (typeof api !== 'undefined') {
    console.log('2️⃣ API service available');
    
    // Test 3: Check getCurrentLanguage function
    const currentLang = api.utils.getCurrentLanguage();
    console.log('3️⃣ API getCurrentLanguage():', currentLang);
    
    // Test 4: Test API call with language
    console.log('4️⃣ Testing API call with language...');
    
    const testMessage = 'Hello, I need help';
    const testLanguage = localStorageLang || 'en';
    
    console.log('   Message:', testMessage);
    console.log('   Language:', testLanguage);
    
    // Simulate the API call
    const formData = new FormData();
    formData.append('query', testMessage);
    formData.append('user_id', 'test_user_frontend');
    formData.append('language', testLanguage);
    
    console.log('   FormData contents:');
    for (let [key, value] of formData.entries()) {
        console.log(`     ${key}: ${value}`);
    }
    
    // Make actual API call
    fetch('https://wakilibot-agent.onrender.com/agents/conversations', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('   ✅ API Response received');
        console.log('   🎯 Answer:', data.answer?.substring(0, 100) + '...');
        console.log('   🎯 Intent:', data.intent);
        console.log('   🎯 Language used:', testLanguage);
    })
    .catch(error => {
        console.error('   ❌ API Error:', error);
    });
    
} else {
    console.log('2️⃣ API service not available - make sure the app is loaded');
}

// Test 5: Check React Context (if available)
if (typeof React !== 'undefined' && typeof useContext !== 'undefined') {
    console.log('5️⃣ React Context available');
} else {
    console.log('5️⃣ React Context not available in console');
}

console.log('🏁 Frontend language test completed!');

