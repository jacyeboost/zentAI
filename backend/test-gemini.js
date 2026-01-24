
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY is missing in .env');
    return;
  }
  
  console.log(`🔑 API Key found: ${apiKey.substring(0, 5)}...`);
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Try to list models (if available in this SDK version) or just try a simple generation
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('🤖 Model initialized: gemini-1.5-flash');
    
    console.log('📨 Sending test prompt...');
    const result = await model.generateContent('Hello, are you working?');
    const response = await result.response;
    console.log('✅ Response received:', response.text());
  } catch (error) {
    console.error('❌ Error testing gemini-1.5-flash:', error.message);
    
    // Try fallback
    try {
        console.log('🔄 Trying gemini-pro as fallback...');
        const model2 = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result2 = await model2.generateContent('Hello?');
        const response2 = await result2.response;
        console.log('✅ Response received (gemini-pro):', response2.text());
    } catch (error2) {
        console.error('❌ Error testing gemini-pro:', error2.message);
        
        if (error.response) {
            console.error('🔍 Full Error Details:', JSON.stringify(error.response, null, 2));
        }
    }
  }
}

testGemini();
