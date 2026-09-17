// Debug script to test language integration in the frontend
// This should be run in the browser console

console.log('🔍 Debugging Language Integration');
console.log('================================');

// Function to test language setting and API calls
window.testLanguageIntegration = async function() {
    console.log('🧪 Starting Language Integration Test');
    
    // Step 1: Check current localStorage
    const currentLang = localStorage.getItem('wakilibot_language');
    console.log('1️⃣ Current localStorage language:', currentLang);
    
    // Step 2: Set language to Luganda
    console.log('2️⃣ Setting language to Luganda...');
    localStorage.setItem('wakilibot_language', 'lg');
    console.log('   ✅ localStorage updated to:', localStorage.getItem('wakilibot_language'));
    
    // Step 3: Wait a moment for any React updates
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 4: Test API call with Luganda
    console.log('3️⃣ Testing API call with Luganda...');
    
    const formData = new FormData();
    formData.append('query', 'Oli otya, nina okusaba obuyambi');
    formData.append('user_id', 'debug_test_user');
    formData.append('language', 'lg');
    
    console.log('   📤 Sending request with:');
    for (let [key, value] of formData.entries()) {
        console.log(`     ${key}: ${value}`);
    }
    
    try {
        const response = await fetch('https://wakilibot-agent.onrender.com/agents/conversations', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('   ✅ API Response received');
            console.log('   🎯 Answer:', data.answer);
            console.log('   🎯 Intent:', data.intent);
            console.log('   🎯 Task Status:', data.task_status);
            
            // Check if response is in Luganda
            const answer = data.answer || '';
            if (answer.includes('Webale') || answer.includes('Oli otya') || answer.includes('CTDRU')) {
                console.log('   🌍 ✅ Response appears to be in Luganda!');
            } else {
                console.log('   🌍 ❌ Response appears to be in English');
            }
        } else {
            console.error('   ❌ API Error:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('   💥 Exception:', error);
    }
    
    // Step 5: Test with English for comparison
    console.log('4️⃣ Testing API call with English for comparison...');
    
    const formDataEn = new FormData();
    formDataEn.append('query', 'Hello, I need help');
    formDataEn.append('user_id', 'debug_test_user');
    formDataEn.append('language', 'en');
    
    try {
        const responseEn = await fetch('https://wakilibot-agent.onrender.com/agents/conversations', {
            method: 'POST',
            body: formDataEn
        });
        
        if (responseEn.ok) {
            const dataEn = await responseEn.json();
            console.log('   ✅ English API Response received');
            console.log('   🎯 Answer:', dataEn.answer?.substring(0, 100) + '...');
        }
    } catch (error) {
        console.error('   💥 English test exception:', error);
    }
    
    console.log('🏁 Language Integration Test Completed!');
};

// Function to check current language state
window.checkLanguageState = function() {
    console.log('🔍 Checking Current Language State');
    console.log('==================================');
    
    console.log('localStorage language:', localStorage.getItem('wakilibot_language'));
    
    // Try to access React context if available
    if (window.React && window.React.useContext) {
        console.log('React is available');
    } else {
        console.log('React not available in global scope');
    }
    
    // Check if API service is available
    if (typeof api !== 'undefined') {
        console.log('API service is available');
        console.log('API getCurrentLanguage():', api.utils.getCurrentLanguage());
    } else {
        console.log('API service not available');
    }
};

console.log('📋 Available functions:');
console.log('  - testLanguageIntegration() - Run full language test');
console.log('  - checkLanguageState() - Check current language state');
console.log('');
console.log('🚀 Run: testLanguageIntegration() to start testing');

