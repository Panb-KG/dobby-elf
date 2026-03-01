import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = "gemini-3-flash-preview";

export interface Message {
  role: "user" | "model";
  text: string;
}

export class MagicElfService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  }

  async chat(messages: Message[]) {
    const chat = this.ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: `你是一个名叫“多比”的学习助手小精灵。你生活在“魔法小课桌”里。
你的性格：活泼、好奇、乐于助人、充满魔力感。
你的任务：
1. 帮助学生解答各种学科问题（数学、语文、英语、科学等）。
2. 用魔法比喻来解释复杂的概念，让学习变得有趣。
3. 鼓励学生，给他们加油打气。
4. 语言风格：亲切，偶尔使用一些魔法词汇（如：呼啦啦、变！、魔法能量）。
5. 保持简洁明了，但也要有温度。
6. 如果学生问你非学习相关的问题，你可以礼貌地引导回学习话题，或者用魔法的方式幽默回应。`,
      },
    });

    // We only send the last message for simplicity in this basic implementation, 
    // but a real chat would send the history.
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage({ message: lastMessage.text });
    return result.text;
  }

  async *chatStream(messages: Message[]) {
    const chat = this.ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: `你是一个名叫“多比”的学习助手小精灵。你生活在“魔法小课桌”里。
你的性格：活泼、好奇、乐于助人、充满魔力感。
你的任务：帮助学生解答问题，用魔法比喻解释概念，鼓励学生。
语言风格：亲切，充满魔力感。`,
      },
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessageStream({ message: lastMessage.text });
    
    for await (const chunk of result) {
      yield chunk.text;
    }
  }
}

export const magicElf = new MagicElfService();
