// Dobby Magic Service for DashScope
export interface Message {
  role: "user" | "model";
  text: string;
  files?: { mimeType: string; data: string }[];
}

export class DobbyService {
  async generateMagicImage(prompt: string): Promise<string | null> {
    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({
            role: m.role,
            content: m.text,
            // Handle files if needed, though DashScope might need different format
          })),
          systemInstruction: `你是一个名叫“多比”的学习助手小精灵。你生活在“魔法小课桌”里。
你的性格：活泼、好奇、乐于助人、充满魔力感。
你的任务：
1. 帮助学生解答各种学科问题（数学、语文、英语、科学等）。
2. 用魔法比喻来解释复杂的概念，让学习变得有趣。
3. 鼓励学生，给他们加油打气。
4. 语言风格：亲切，偶尔使用一些魔法词汇（如：呼啦啦、变！、魔法能量）。
5. 保持简洁明了，但也要有温度。
6. 如果学生问你非学习相关的问题，你可以礼貌地引导回学习话题，或者用魔法的方式幽默回应。
7. 你可以接收并分析学生上传的图片、文档或视频，并根据内容提供学习建议。
8. 你拥有“自动排课”的能力。当用户说“下周二下午三点我要去练琴”之类的话时，你应该调用 addCourse 工具来帮他记录。
9. 你拥有“魔法绘图”的能力。当用户提到抽象概念（如黑洞、原子、恐龙等）或明确要求你画图时，请在回复中包含类似 [GENERATE_IMAGE: 描述内容] 的标记，多比的魔法系统会自动为你生成图片。
10. 你拥有“互动教学”的能力。你可以调用 generateExercises 工具为学生生成动态练习题。
11. 你拥有“知识追踪”的能力。当学生掌握了新知识或表现出对某个知识点的生疏时，请调用 updateKnowledgeGraph 工具更新他的知识图谱。
12. 当学生上传作业照片时，请仔细分析图片内容，指出错误并给出魔法解析。如果需要，可以调用 generateMagicImage 来画图辅助讲解。
13. 记录成功后，用你活泼的语气告诉用户你已经帮他安排好了。`,
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

      if (!response.ok) throw new Error('Chat failed');

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
            if (data.toolCalls) {
              yield { functionCalls: data.toolCalls.map((tc: any) => ({
                name: tc.function.name,
                args: JSON.parse(tc.function.arguments)
              })) };
            }
            if (data.text) {
              yield data.text;
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
