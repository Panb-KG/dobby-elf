import { error } from '../lib/console';

export interface Message {
  role: "user" | "model";
  text: string;
  files?: { mimeType: string; data: string }[];
  timestamp?: number;
}

export interface ChatOptions {
  messages: { role: string; content: string; files?: { mimeType: string; data: string }[] }[];
  signal?: AbortSignal;
}

export interface ChatResponse {
  text: string;
}

export class DobiService {
  async chat(options: ChatOptions): Promise<ChatResponse> {
    const { messages, signal } = options;
    let fullText = '';

    for await (const chunk of this.chatStream(
      messages.map(m => ({ 
        role: m.role as 'user' | 'model', 
        text: m.content,
        files: m.files 
      }))
    )) {
      if (typeof chunk === 'string') {
        fullText += chunk;
      }
    }

    return { text: fullText };
  }

  async generateMagicImage(prompt: string): Promise<string | null> {
    try {
      let token: string | null = null;
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('dobi_auth_token');
      }

      const response = await fetch('/api/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error('Image generation failed');
      const data = await response.json();
      return data.url;
    } catch (error) {
      error("Image generation failed:", error);
      return null;
    }
  }

  async *chatStream(messages: Message[]) {
    try {
      let token: string | null = null;
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('dobi_auth_token');
      }

      const hasImages = messages.some(m => m.files && m.files.some(f => f.mimeType.startsWith('image/')));
      const model = hasImages ? 'qwen3.6-plus' : 'qwen3.6-plus';

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          messages: messages.map(m => ({
            role: m.role,
            content: m.text,
            files: m.files
          })),
          model,
          systemInstruction: `你是多比，魔法小课桌的学习助手精灵。性格:忠诚、贴心、友好、调皮。语言:亲切活泼，偶尔用魔法词汇(呼啦啦、变！)，适合小学生。

核心能力:
1. 解答数学、语文、英语、科学等学科问题
2. 用魔法比喻解释复杂概念，让学习有趣
3. 鼓励学生，培养学习兴趣和自信
4. 接收分析图片/文档，识别课表后调用 addCourse 工具
5. 魔法绘图:回复中用 [GENERATE_IMAGE: 描述] 标记
6. 互动教学:调用 generateExercises 生成练习题
7. 知识追踪:调用 updateKnowledgeGraph 更新知识图谱
8. 作业辅导:分析作业照片，启发引导而非直接给答案
9. 自动排课:用户说安排课程时调用 addCourse

原则:避免不适宜内容，保持积极健康，尊重个性，保护隐私。`,
          tools: [
            {
              type: 'function',
              function: {
                name: 'addCourse',
                description: '将新课程添加到学生的课程表中。只有当用户明确要求安排或添加课程时才调用此函数。',
                parameters: {
                  type: 'object',
                  properties: {
                    day: { type: 'string', enum: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"] },
                    subject: { type: 'string' },
                    time: { type: 'string' },
                    type: { type: 'string', enum: ["校内", "课外"] }
                  },
                  required: ["day", "subject", "time"]
                }
              }
            },
            {
              type: 'function',
              function: {
                name: 'addHomework',
                description: '添加新的作业任务到作业本。只有当用户明确要求添加作业时才调用。',
                parameters: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', description: '作业标题/名称' },
                    subject: { type: 'string', description: '科目，如：数学、语文、英语等' },
                    description: { type: 'string', description: '作业详细描述' },
                    dueDate: { type: 'string', description: '截止日期，格式YYYY-MM-DD' }
                  },
                  required: ["title", "subject"]
                }
              }
            },
            {
              type: 'function',
              function: {
                name: 'completeHomework',
                description: '标记作业为已完成。只有当用户说"完成"、"做好了"、"交了"等时才调用。',
                parameters: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', description: '要完成的作业标题关键词' }
                  },
                  required: ["title"]
                }
              }
            },
            {
              type: 'function',
              function: {
                name: 'deleteHomework',
                description: '删除作业任务。只有当用户明确要求删除作业时才调用。',
                parameters: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', description: '要删除的作业标题关键词' }
                  },
                  required: ["title"]
                }
              }
            },
            {
              type: 'function',
              function: {
                name: 'listHomework',
                description: '查看当前作业列表。当用户想了解有哪些作业时调用。',
                parameters: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ["all", "pending", "completed"], description: '过滤状态：all=全部，pending=待完成，completed=已完成' }
                  }
                }
              }
            },
            {
              type: 'function',
              function: {
                name: 'generateExercises',
                description: '根据学生的年级和学科生成互动练习题。',
                parameters: {
                  type: 'object',
                  properties: {
                    subject: { type: 'string' },
                    grade: { type: 'string' },
                    topic: { type: 'string' },
                    questions: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          question: { type: 'string' },
                          options: { type: 'array', items: { type: 'string' } },
                          answer: { type: 'string' },
                          explanation: { type: 'string' }
                        },
                        required: ["id", "question", "options", "answer", "explanation"]
                      }
                    }
                  },
                  required: ["subject", "grade", "questions"]
                }
              }
            },
            {
              type: 'function',
              function: {
                name: 'updateKnowledgeGraph',
                description: '更新学生的知识图谱,记录掌握情况。',
                parameters: {
                  type: 'object',
                  properties: {
                    points: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          status: { type: 'string', enum: ["mastered", "learning"] },
                          subject: { type: 'string' }
                        },
                        required: ["name", "status", "subject"]
                      }
                    }
                  },
                  required: ["points"]
                }
              }
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        error('Chat API error - Status:', response.status, response.statusText);
        error('Chat API error - Text:', errorText || '(empty response)');

        let errorMessage = `Chat failed: ${response.status} ${response.statusText}`;
        if (errorText) {
          try {
            const errorJson = JSON.parse(errorText);
            error('Chat API error - JSON:', errorJson);
            if (errorJson.error) {
              errorMessage = `API Error: ${errorJson.error}`;
            } else if (errorJson.message) {
              errorMessage = `API Error: ${errorJson.message}`;
            }
          } catch (e) {
            if (errorText.trim()) {
              errorMessage = `API Error: ${errorText.substring(0, 200)}`;
            }
          }
        }

        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;

          let jsonStr = trimmed;
          if (trimmed.startsWith('data: ')) {
            jsonStr = trimmed.slice(6);
          }

          if (!jsonStr || jsonStr === '[DONE]') continue;

          try {
            const data = JSON.parse(jsonStr);

            if (data.choices && data.choices[0]) {
              const delta = data.choices[0].delta;
              if (delta && delta.content) {
                yield delta.content;
              }
              if (data.choices[0].delta?.tool_calls) {
                const toolCalls = data.choices[0].delta.tool_calls;
                yield { functionCalls: toolCalls.map((tc: { function?: { name?: string; arguments?: string } }) => ({
                  name: tc.function?.name,
                  args: tc.function?.arguments ? JSON.parse(tc.function.arguments) : {}
                })) };
              }
            }
            else if (data.output && data.output.text) {
              yield data.output.text;
            }
            else if (data.output?.tool_calls) {
              yield { functionCalls: data.output.tool_calls.map((tc: { function: { name: string; arguments: string } }) => ({
                name: tc.function.name,
                args: JSON.parse(tc.function.arguments)
              })) };
            }
          } catch (e) {
          }
        }
      }
    } catch (error) {
      error('Chat stream error:', error);
      yield '哎呀,多比的魔法出了一点小状况... 请稍后再试。🪄';
    }
  }
}

export const dobi = new DobiService();