
require('dotenv').config();

async function testSql() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  
  if (!supabaseUrl || !token) {
    console.error('❌ Missing URL or Token in .env');
    return;
  }

  // Extract project ref from URL (https://zzthllzsbwlongthunxx.supabase.co -> zzthllzsbwlongthunxx)
  const projectRef = supabaseUrl.split('//')[1].split('.')[0];
  const apiEndpoint = `https://api.supabase.com/v1/projects/${projectRef}/sql`;

  console.log(`🌍 Endpoint: ${apiEndpoint}`);
  console.log(`🔑 Token: ${token.substring(0, 5)}...`);

  try {
    const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            query: 'SELECT count(*) FROM ventas;'
        })
    });

    if (!response.ok) {
        console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.error('Response:', text);
        return;
    }

    const data = await response.json();
    console.log('✅ SQL Executed Successfully!');
    console.log('Result:', JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('❌ Execution Error:', error.message);
  }
}

testSql();
