// Test script to verify frontend-backend connectivity
// Run this in the browser console or as a separate test file

const testAPI = async () => {
  const API_BASE_URL = 'http://localhost:8000';
  
  console.log('🧪 Testing CTDRU AI Agent API Endpoints...\n');
  
  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Status:', healthData.status);
    console.log('📊 Version:', healthData.version);
    console.log('🔧 Features:', Object.keys(healthData.features || {}));
    console.log('');
    
    // Test 2: Service Info
    console.log('2️⃣ Testing Service Info Endpoint...');
    const serviceResponse = await fetch(`${API_BASE_URL}/`);
    const serviceData = await serviceResponse.json();
    console.log('✅ Service:', serviceData.service);
    console.log('📋 Capabilities:', serviceData.capabilities?.length || 0);
    console.log('');
    
    // Test 3: Session Info
    console.log('3️⃣ Testing Session Endpoint...');
    const userId = `test_user_${Date.now()}`;
    const sessionResponse = await fetch(`${API_BASE_URL}/sessions/${userId}`);
    const sessionData = await sessionResponse.json();
    console.log('✅ Session Status:', sessionData.status);
    console.log('👤 User ID:', sessionData.user_id);
    console.log('');
    
    // Test 4: Conversation Endpoint
    console.log('4️⃣ Testing Conversation Endpoint...');
    const formData = new FormData();
    formData.append('query', 'Hello, I want to submit a complaint against MTN');
    formData.append('user_id', userId);
    
    const conversationResponse = await fetch(`${API_BASE_URL}/agents/conversations`, {
      method: 'POST',
      body: formData
    });
    const conversationData = await conversationResponse.json();
    console.log('✅ Conversation Response:', conversationData.answer?.substring(0, 100) + '...');
    console.log('🎯 Intent:', conversationData.intent);
    console.log('📋 Task Status:', conversationData.task_status);
    console.log('⏱️ Response Time:', conversationData.response_time);
    console.log('');
    
    console.log('🎉 All tests passed! Frontend can successfully connect to backend.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the customAgent backend is running on port 8000');
    console.log('2. Check if there are any CORS issues');
    console.log('3. Verify the API_BASE_URL is correct');
  }
};

// Run the test
testAPI();
