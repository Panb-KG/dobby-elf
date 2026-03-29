import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 读取 .env 文件
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env file not found');
    return {};
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

// 获取 API Key
const env = loadEnv();
const dashscopeApiKey = env.DASHSCOPE_API_KEY || '';
const apiKey = dashscopeApiKey;
const baseUrl = env.DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';

console.log('Environment variables (from .env):', {
  dashscopeApiKey: dashscopeApiKey ? '***' + dashscopeApiKey.slice(-4) : 'empty',
  baseUrl: baseUrl
});

console.log('API key status:', {
  apiKey: apiKey ? '***' + apiKey.slice(-4) : 'empty',
  apiKeyLength: apiKey.length
});

export async function POST(req: Request) {
  if (!apiKey || !apiKey.trim()) {
    return NextResponse.json(
      { error: 'DASHSCOPE_API_KEY is not configured' },
      { status: 500 }
    );
  }

  try {
    const { messages, systemInstruction, tools } = await req.json();

    console.log('Chat request received:', {
      messages: messages,
      systemInstruction: systemInstruction
    });

    const processedMessages = messages
      .map((msg: any) => {
        const role = msg.role === 'model' ? 'assistant' : msg.role;
        const text = msg.content || msg.text;
        
        if (msg.files && msg.files.length > 0) {
          const content: any[] = [];
          
          if (text && text.trim()) {
            content.push({ type: 'text', text });
          }
          
          for (const file of msg.files) {
            if (file.mimeType && file.mimeType.startsWith('image/') && file.data) {
              console.log('Image file:', {
                mimeType: file.mimeType,
                dataLength: file.data.length,
                dataPrefix: file.data.substring(0, 50) + '...'
              });
              
              content.push({
                type: 'image_url',
                image_url: {
                  url: `data:${file.mimeType};base64,${file.data}`
                }
              });
            }
          }
          
          if (content.length > 0) {
            return { role, content };
          }
          return null;
        }
        
        if (text && text.trim()) {
          return { role, content: text };
        }
        return null;
      })
      .filter((msg: any) => msg !== null);

    if (processedMessages.length === 0) {
      return NextResponse.json(
        { error: 'No valid messages to send' },
        { status: 400 }
      );
    }

    const hasImages = processedMessages.some((msg: any) => {
      if (Array.isArray(msg.content)) {
        return msg.content.some((c: any) => c.type === 'image_url');
      }
      return false;
    });
    const model = hasImages ? 'qwen3-vl-plus' : 'qwen-plus';
    
    console.log('Using model:', model, 'Has images:', hasImages);

    const apiEndpoint = baseUrl + '/chat/completions';
    
    console.log('Using API endpoint:', apiEndpoint);

    const requestBody = {
      model: model,
      messages: [
        { role: 'system', content: systemInstruction },
        ...processedMessages
      ],
      stream: false
    };
    
    console.log('Request to API:', {
      url: apiEndpoint,
      body: JSON.stringify(requestBody, (key, value) => {
        if (key === 'image' && typeof value === 'string' && value.length > 100) {
          return value.substring(0, 50) + '...[base64 data]';
        }
        return value;
      }, 2)
    });

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response from API:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error text:', errorText);
      try {
        const error = JSON.parse(errorText);
        console.error('API error details:', error);
        
        // 处理 API Key 错误
        if (error.error && error.error.code === 'invalid_api_key') {
          return NextResponse.json(
            {
              error: 'Invalid API key provided',
              message: 'Please check your DASHSCOPE_API_KEY in .env file',
              details: error.error.message
            },
            { status: 401 }
          );
        }
        
        throw new Error(`API error: ${error.error?.message || error.message || 'Unknown error'}`);
      } catch (e) {
        throw new Error(`API error: ${errorText || 'Unknown error'}`);
      }
    }

    const data = await response.json();
    console.log('Response data:', data);
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const message = data.choices[0].message;
      const ndjsonResponse = JSON.stringify({
        output: {
          text: message.content || '',
          finish_reason: data.choices[0].finish_reason || 'stop'
        }
      }) + '\n';
      
      return new Response(ndjsonResponse, {
        headers: { 'Content-Type': 'application/x-ndjson' },
      });
    } else if (data.output && data.output.text) {
      const ndjsonResponse = JSON.stringify({
        output: {
          text: data.output.text,
          finish_reason: data.output.finish_reason || 'stop'
        }
      }) + '\n';
      
      return new Response(ndjsonResponse, {
        headers: { 'Content-Type': 'application/x-ndjson' },
      });
    } else if (data.output && data.output.tool_calls) {
      const ndjsonResponse = JSON.stringify({
        toolCalls: data.output.tool_calls
      }) + '\n';
      
      return new Response(ndjsonResponse, {
        headers: { 'Content-Type': 'application/x-ndjson' },
      });
    } else {
      const ndjsonResponse = JSON.stringify(data) + '\n';
      
      return new Response(ndjsonResponse, {
        headers: { 'Content-Type': 'application/x-ndjson' },
      });
    }
  } catch (error: any) {
    console.error('Chat API error:', error);
    const errorMessage = error.message || 'Unknown error';
    return NextResponse.json(
      {
        error: errorMessage,
        details: error.stack || ''
      },
      { status: 500 }
    );
  }
}
