// Test script to verify frontend-backend connectivity
// Run this in the browser console

const testFrontendAPI = async () => {
  console.log('🧪 Testing Frontend API Connection...\n');
  
  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Endpoint...');
    const healthResponse = await fetch('https://wakilibot-agent-0wm0.onrender.com/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health Status:', healthData.status);
    console.log('📊 Version:', healthData.version);
    console.log('');
    
    // Test 2: Direct API Call
    console.log('2️⃣ Testing Direct API Call...');
    const formData = new FormData();
    formData.append('query', 'Hello from frontend test');
    formData.append('user_id', 'frontend_test_user');
    
    const apiResponse = await fetch('https://wakilibot-agent-0wm0.onrender.com/agents/conversations', {
      method: 'POST',
      body: formData
    });
    
    console.log('Response status:', apiResponse.status);
    console.log('Response headers:', Object.fromEntries(apiResponse.headers.entries()));
    
    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      console.log('✅ API Response:', apiData.answer);
      console.log('🎯 Intent:', apiData.intent);
      console.log('📋 Task Status:', apiData.task_status);
    } else {
      const errorText = await apiResponse.text();
      console.error('❌ API Error:', errorText);
    }
    
    console.log('\n🎉 Frontend API test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the customAgent backend is running at https://wakilibot-agent-0wm0.onrender.com');
    console.log('2. Check browser console for CORS errors');
    console.log('3. Verify the API_BASE_URL is correct');
  }
};

// Run the test
testFrontendAPI();
