import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// 读取 .env 文件
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env file not found');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      env[key.trim()] = value.trim();
    }
  });

  return env;
}

// 测试 API
async function testApi() {
  try {
    console.log('Loading environment variables from .env file...');
    const env = loadEnv();

    const apiKey = env.DASHSCOPE_API_KEY;
    const baseUrl = env.DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';

    if (!apiKey) {
      console.error('Error: DASHSCOPE_API_KEY is not set in .env file');
      return;
    }

    console.log('Environment variables:');
    console.log('  DASHSCOPE_API_KEY:', apiKey ? '***' + apiKey.slice(-4) : 'empty');
    console.log('  DASHSCOPE_BASE_URL:', baseUrl);

    const apiEndpoint = baseUrl + '/chat/completions';
    console.log('\nTesting API endpoint:', apiEndpoint);

    const requestBody = {
      model: 'qwen-plus',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.'
        },
        {
          role: 'user',
          content: 'Hello, test API connection'
        }
      ],
      stream: false
    };

    console.log('\nSending request...');
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('\nResponse status:', response.status);
    console.log('Response status text:', response.statusText);

    const responseText = await response.text();
    console.log('\nResponse text:', responseText);

    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('\n✅ API test successful!');
        if (data.choices && data.choices[0] && data.choices[0].message) {
          console.log('Response message:', data.choices[0].message.content);
        }
      } catch (e) {
        console.error('Error parsing JSON response:', e);
      }
    } else {
      console.error('❌ API test failed');
      try {
        const error = JSON.parse(responseText);
        if (error.error) {
          console.error('Error details:', error.error);
        }
      } catch (e) {
        console.error('Error parsing error response:', e);
      }
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// 运行测试
testApi();