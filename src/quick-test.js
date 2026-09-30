// Quick API Test - Run this in browser console
const testAPI = async () => {
  console.log('🧪 Testing API Connection...');
  
  try {
    const formData = new FormData();
    formData.append('query', 'Hello test');
    formData.append('user_id', 'test_user');
    
    const response = await fetch('https://wakilibot-agent-0wm0.onrender.com/agents/conversations', {
      method: 'POST',
      body: formData
    });
    
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success:', data.answer);
    } else {
      const error = await response.text();
      console.error('❌ Error:', error);
    }
  } catch (error) {
    console.error('❌ Network Error:', error);
  }
};

testAPI();
