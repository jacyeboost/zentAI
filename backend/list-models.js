
require('dotenv').config();
const fs = require('fs');

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY is missing');
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    console.log('🔍 Fetching models from:', url.replace(apiKey, 'HIDDEN'));
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.models) {
        console.log('✅ Models fetched. Saving to models.json...');
        fs.writeFileSync('models.json', JSON.stringify(data.models, null, 2));
        
        console.log('📋 Preview of Gemini models:');
        data.models.forEach(m => {
            if (m.name.includes('gemini')) {
                console.log(`- ${m.name}`);
            }
        });
    } else {
        console.log('⚠️ No models found in response:', data);
    }
    
  } catch (error) {
    console.error('❌ Error listing models:', error.message);
  }
}

listModels();
