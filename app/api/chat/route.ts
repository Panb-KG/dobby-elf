import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const apiKey = process.env.DASHSCOPE_API_KEY;

let client: OpenAI | null = null;

function getClient() {
  if (!client) {
    if (!apiKey) {
      throw new Error('DASHSCOPE_API_KEY is not configured');
    }
    client = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    });
  }
  return client;
}

export async function POST(req: Request) {
  if (!apiKey) {
    return NextResponse.json({ error: 'DASHSCOPE_API_KEY is not configured' }, { status: 500 });
  }

  try {
    const { messages, tools, systemInstruction } = await req.json();
    const openai = getClient();

    const response = await openai.chat.completions.create({
      model: 'qwen-plus',
      messages: [
        { role: 'system', content: systemInstruction },
        ...messages
      ],
      tools: tools,
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || '';
          const toolCalls = chunk.choices[0]?.delta?.tool_calls;
          
          if (text || toolCalls) {
            controller.enqueue(JSON.stringify({ text, toolCalls }) + '\n');
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'application/x-ndjson' },
    });
  } catch (error: any) {
    console.error('DashScope API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
