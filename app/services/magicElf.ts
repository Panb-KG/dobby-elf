// Dobby Magic Service for DashScope
export interface Message {
  role: "user" | "model";
  text: string;
  files?: { mimeType: string; data: string }[];
  timestamp?: number;
}

export class DobbyService {
  async generateMagicImage(prompt: string): Promise<string | null> {
    try {
      // 获取认证令牌
      let authHeaders: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('dobby_auth_token');
        if (token) {
          authHeaders['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch('/api/image', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) throw new Error('Image generation failed');
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Image generation failed:", error);
      return null;
    }
  }

  async *chatStream(messages: Message[]) {
    try {
      // 获取认证令牌
      let authHeaders: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('dobby_auth_token');
        if (token) {
          authHeaders['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          messages: messages.map(m => ({
            role: m.role,
            content: m.text,
            files: m.files
          })),
          systemInstruction: `你是一个名叫“多比”的学习助手小精灵。你生活在“魔法小课桌”里。
你的性格：忠诚、贴心、友好、有一些调皮，充满魔力感。
你的任务：
1. 帮助小学生解答各种学科问题（数学、语文、英语、科学等）。
2. 用魔法比喻来解释复杂的概念，让学习变得有趣。
3. 鼓励学生，给他们加油打气，培养学习兴趣和自信心。
4. 语言风格：亲切，偶尔使用一些魔法词汇（如：呼啦啦、变！、魔法能量），适合小学生理解。
5. 保持简洁明了，但也要有温度和童趣。
6. 如果学生问你非学习相关的问题，你可以礼貌地引导回学习话题，或者用魔法的方式幽默回应。
7. 你可以接收并分析学生上传的图片、文档或视频，并根据内容提供学习建议。特别要注意：
   - 当用户上传课表图片时，请仔细识别表格中的所有课程信息，包括星期、时间、科目等
   - 如果图片模糊或不清楚，请主动询问用户确认
   - 识别课表后，主动调用 addCourse 工具帮助用户记录课程
   - 对于课表中的重复课程，也要逐一记录
8. 你拥有"自动排课"的能力。当用户说"下周二下午三点我要去练琴"之类的话时，你应该调用 addCourse 工具来帮他记录。
9. 你拥有“魔法绘图”的能力。当用户提到抽象概念（如黑洞、原子、恐龙等）或明确要求你画图时，请在回复中包含类似 [GENERATE_IMAGE: 描述内容] 的标记，多比的魔法系统会自动为你生成图片。
10. 你拥有“互动教学”的能力。你可以调用 generateExercises 工具为学生生成动态练习题。
11. 你拥有“知识追踪”的能力。当学生掌握了新知识或表现出对某个知识点的生疏时，请调用 updateKnowledgeGraph 工具更新他的知识图谱。
12. 当学生上传作业照片时，请仔细分析图片内容，指出错误并给出魔法解析，但绝对不能直接给出答案和解题步骤，而应该采用辅导和启发的方式，引导学生自己思考。
13. 记录成功后，用你活泼的语气告诉用户你已经帮他安排好了。

重要原则：
- 绝对避免任何成人、暴力、歧视等不适宜小学生的内容
- 始终保持积极、健康、向上的引导
- 尊重学生的个性和差异，鼓励探索和创新
- 保护学生隐私，不询问或分享个人敏感信息
- 在学习辅导中，注重方法引导而非直接答案`,
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
                description: '更新学生的知识图谱，记录掌握情况。',
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
        console.error('Chat API error:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText || '(empty response)'
        });
        
        // 尝试解析错误信息
        let errorMessage = `Chat failed: ${response.status} ${response.statusText}`;
        if (errorText) {
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.error) {
              errorMessage = `API Error: ${errorJson.error}`;
            } else if (errorJson.message) {
              errorMessage = `API Error: ${errorJson.message}`;
            }
          } catch (e) {
            // 如果不是 JSON，使用原始错误文本
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
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            // 处理 DashScope API 响应格式
            if (data.output && data.output.text) {
              yield data.output.text;
            }
            // 处理工具调用（如果有）
            if (data.toolCalls) {
              yield { functionCalls: data.toolCalls.map((tc: any) => ({
                name: tc.function.name,
                args: JSON.parse(tc.function.arguments)
              })) };
            }
          } catch (e) {
            console.error('Error parsing line:', e);
          }
        }
      }
    } catch (error) {
      console.error('Chat stream error:', error);
      yield '哎呀，多比的魔法出了一点小状况... 请稍后再试。🪄';
    }
  }
}

export const dobby = new DobbyService();
