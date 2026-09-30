// Test script to verify API calls
console.log('🧪 Testing API calls with language parameter...');

// Simulate the API call that MessageInput makes
const testApiCall = async () => {
  const formData = new FormData();
  formData.append('query', 'Test message');
  formData.append('user_id', 'test_user');
  formData.append('language', 'lg'); // Luganda
  
  console.log('🌍 [TEST] FormData contents:');
  for (let [key, value] of formData.entries()) {
    console.log(`  ${key}: ${value}`);
  }
  
  try {
    const response = await fetch('https://wakilibot-agent-0wm0.onrender.com/agents/conversations', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('🌍 [TEST] Response received:', data.answer?.substring(0, 100) + '...');
    } else {
      console.error('🌍 [TEST] Error:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('🌍 [TEST] Exception:', error);
  }
};

// Run the test
testApiCall();
