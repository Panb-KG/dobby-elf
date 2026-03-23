import { NextResponse } from 'next/server';

const apiKey = process.env.BAILIAN_API_KEY || process.env.DASHSCOPE_API_KEY;

// 使用 DashScope API 格式，因为这是有效的
export async function POST(req: Request) {
  if (!apiKey) {
    return NextResponse.json({ error: 'BAILIAN_API_KEY or DASHSCOPE_API_KEY is not configured' }, { status: 500 });
  }

  try {
    const { messages, systemInstruction, tools } = await req.json();

    console.log('Chat request received:', {
      messages: messages,
      systemInstruction: systemInstruction
    });

    // 构建消息，处理附件（图片）
    const processedMessages = messages
      .map((msg: any) => {
        const role = msg.role === 'model' ? 'assistant' : msg.role;
        const text = msg.content || msg.text;
        
        // 如果消息包含附件（图片），需要使用多模态内容格式
        if (msg.files && msg.files.length > 0) {
          const content: any[] = [];
          
          // 添加文本内容
          if (text && text.trim()) {
            content.push({ type: 'text', text });
          }
          
          // 添加图片内容
          for (const file of msg.files) {
            if (file.mimeType && file.mimeType.startsWith('image/') && file.data) {
              // 检查图片数据长度
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
        
        // 普通文本消息
        if (text && text.trim()) {
          return { role, content: text };
        }
        return null;
      })
      .filter((msg: any) => msg !== null);

    // 检查是否有有效的消息
    if (processedMessages.length === 0) {
      return NextResponse.json({ error: 'No valid messages to send' }, { status: 400 });
    }

    // 检查是否包含图片消息，如果是则使用 qwen3-vl-plus 模型
    const hasImages = processedMessages.some((msg: any) => {
      // 检查消息是否包含图片内容
      if (Array.isArray(msg.content)) {
        return msg.content.some((c: any) => c.type === 'image_url');
      }
      return false;
    });
    const model = hasImages ? 'qwen3-vl-plus' : 'qwen-plus';
    
    console.log('Using model:', model, 'Has images:', hasImages);

    // 使用 OpenAI 兼容模式 API 端点
    const apiEndpoint = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
    
    console.log('Using API endpoint:', apiEndpoint);

    // OpenAI 兼容模式格式
    const requestBody = {
      model: model,
      messages: [
        { role: 'system', content: systemInstruction },
        ...processedMessages
      ],
      stream: false
    };
    
    console.log('Request to OpenAI compatible API:', {
      url: apiEndpoint,
      body: JSON.stringify(requestBody, (key, value) => {
        // 隐藏base64数据太长的问题
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

    console.log('Response from DashScope API:', {
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
        throw new Error(`API error: ${error.error?.message || error.message || 'Unknown error'}`);
      } catch (e) {
        throw new Error(`API error: ${errorText || 'Unknown error'}`);
      }
    }

    // 处理 OpenAI 兼容模式响应
    const data = await response.json();
    console.log('Response data:', data);
    
    // 检查响应格式
    if (data.choices && data.choices[0] && data.choices[0].message) {
      // OpenAI 格式响应
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
      // 原始 DashScope 格式响应
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
      // 如果有工具调用，转换为 ndjson 格式
      const ndjsonResponse = JSON.stringify({
        toolCalls: data.output.tool_calls
      }) + '\n';
      
      return new Response(ndjsonResponse, {
        headers: { 'Content-Type': 'application/x-ndjson' },
      });
    } else {
      // 其他情况，返回原始数据
      const ndjsonResponse = JSON.stringify(data) + '\n';
      
      return new Response(ndjsonResponse, {
        headers: { 'Content-Type': 'application/x-ndjson' },
      });
    }
  } catch (error: any) {
    console.error('Chat API error:', error);
    const errorMessage = error.message || 'Unknown error';
    return NextResponse.json({ 
      error: errorMessage,
      details: error.stack || ''
    }, { status: 500 });
  }
}
