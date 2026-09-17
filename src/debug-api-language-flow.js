// Debug script to test the complete language flow from frontend to backend
// Run this in the browser console

console.log('🔍 Debugging API Language Flow');
console.log('==============================');

// Function to test the complete language flow
window.debugLanguageFlow = async function() {
    console.log('🧪 Testing Complete Language Flow');
    console.log('=================================');
    
    // Step 1: Check Redux state
    console.log('1️⃣ Checking Redux State...');
    try {
        const reduxState = store.getState();
        const reduxLanguage = reduxState.language?.selectedLanguage;
        console.log('   Redux language:', reduxLanguage);
        console.log('   Redux initialized:', reduxState.language?.isInitialized);
    } catch (error) {
        console.error('   ❌ Error accessing Redux state:', error);
    }
    
    // Step 2: Check localStorage
    console.log('2️⃣ Checking localStorage...');
    const localStorageLang = localStorage.getItem('wakilibot_language');
    console.log('   localStorage language:', localStorageLang);
    
    // Step 3: Check API service language getter
    console.log('3️⃣ Checking API Service Language Getter...');
    try {
        const apiLanguage = api.utils.getCurrentLanguage();
        console.log('   API service language:', apiLanguage);
    } catch (error) {
        console.error('   ❌ Error accessing API service:', error);
    }
    
    // Step 4: Test API call with detailed logging
    console.log('4️⃣ Testing API Call with Detailed Logging...');
    
    const testMessage = 'Hello, I need help with a complaint';
    const testLanguage = 'lg'; // Force Luganda for testing
    
    console.log('   Test message:', testMessage);
    console.log('   Test language:', testLanguage);
    
    // Create FormData manually to see exactly what's being sent
    const formData = new FormData();
    formData.append('query', testMessage);
    formData.append('user_id', 'debug_test_user');
    formData.append('language', testLanguage);
    
    console.log('   📤 FormData contents:');
    for (let [key, value] of formData.entries()) {
        console.log(`     ${key}: ${value}`);
    }
    
    try {
        console.log('   📡 Making API call...');
        const response = await fetch('https://wakilibot-agent.onrender.com/agents/conversations', {
            method: 'POST',
            body: formData
        });
        
        console.log('   📥 Response status:', response.status);
        console.log('   📥 Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const data = await response.json();
            console.log('   ✅ API Response received');
            console.log('   🎯 Answer:', data.answer?.substring(0, 100) + '...');
            console.log('   🎯 Intent:', data.intent);
            console.log('   🎯 Task Status:', data.task_status);
            console.log('   🎯 Full response:', data);
            
            // Check if response is in the expected language
            const answer = data.answer || '';
            if (testLanguage === 'lg') {
                if (answer.includes('Webale') || answer.includes('Oli otya') || answer.includes('CTDRU')) {
                    console.log('   🌍 ✅ Response appears to be in Luganda!');
                } else {
                    console.log('   🌍 ❌ Response appears to be in English, not Luganda');
                }
            }
        } else {
            const errorText = await response.text();
            console.error('   ❌ API Error:', response.status, errorText);
        }
    } catch (error) {
        console.error('   💥 Exception:', error);
    }
    
    // Step 5: Test with different languages
    console.log('5️⃣ Testing with Different Languages...');
    const testLanguages = ['en', 'lg', 'sw'];
    
    for (const lang of testLanguages) {
        console.log(`   Testing with language: ${lang}`);
        
        const testFormData = new FormData();
        testFormData.append('query', 'Hello');
        testFormData.append('user_id', 'debug_test_user');
        testFormData.append('language', lang);
        
        try {
            const response = await fetch('https://wakilibot-agent.onrender.com/agents/conversations', {
                method: 'POST',
                body: testFormData
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`     ${lang}: ${data.answer?.substring(0, 50)}...`);
            } else {
                console.log(`     ${lang}: Error ${response.status}`);
            }
        } catch (error) {
            console.log(`     ${lang}: Exception ${error.message}`);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('🏁 Language flow debug completed!');
};

// Function to test Redux integration
window.testReduxIntegration = function() {
    console.log('🧪 Testing Redux Integration');
    console.log('============================');
    
    // Check if Redux store is available
    if (typeof store !== 'undefined') {
        console.log('✅ Redux store is available');
        const state = store.getState();
        console.log('   Current state:', state);
        console.log('   Language state:', state.language);
    } else {
        console.log('❌ Redux store is not available');
    }
    
    // Check if API service is available
    if (typeof api !== 'undefined') {
        console.log('✅ API service is available');
        console.log('   API getCurrentLanguage():', api.utils.getCurrentLanguage());
    } else {
        console.log('❌ API service is not available');
    }
    
    // Check if useLanguage hook is available
    if (typeof useLanguage !== 'undefined') {
        console.log('✅ useLanguage hook is available');
    } else {
        console.log('❌ useLanguage hook is not available');
    }
};

console.log('📋 Available functions:');
console.log('  - debugLanguageFlow() - Test complete language flow');
console.log('  - testReduxIntegration() - Test Redux integration');
console.log('');
console.log('🚀 Run: debugLanguageFlow() to start debugging');

