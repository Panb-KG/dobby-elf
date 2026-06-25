/**
 * Agent 意图路由
 * 
 * 轻量级意图识别（本地规则 + LLM 辅助）
 * v2.0 新增
 */

import type { IntentType } from './types';
import { INTENT_PROMPT, SHORT_SYSTEM_PROMPT } from './system-prompt';

/**
 * 关键词路由规则
 * 基于关键词快速判断意图，不需要调用 LLM
 */
const KEYWORD_RULES: { keywords: string[]; intent: IntentType }[] = [
  {
    keywords: ['课表', '课程', '今天有什么课', '明天上什么', '星期几'],
    intent: 'schedule_query',
  },
  {
    keywords: ['作业', ' homework', '写完了', '作业本'],
    intent: 'homework_help',
  },
  {
    keywords: ['出题', '练习题', '测试题', '做几道题', '给我出'],
    intent: 'exercise_generate',
  },
  {
    keywords: ['成长', '树', '积分', '浇水', '等级', '经验'],
    intent: 'growth_tree',
  },
  {
    keywords: ['打分', '评分', '爸爸妈妈评', '亲子'],
    intent: 'parent_score',
  },
  {
    keywords: ['画图', '画一张', '生成图片', '画个'],
    intent: 'image_generate',
  },
  {
    keywords: ['你好', 'hello', 'hi', '早上好', '下午好', '晚上好', '在吗', '在不在'],
    intent: 'casual_chat',
  },
  {
    keywords: ['上传', '添加教材', '导入资料', '加载知识'],
    intent: 'knowledge_upload',
  },
];

/**
 * 学科相关关键词
 */
const SUBJECT_KEYWORDS = [
  '数学', '语文', '英语', '科学', '物理', '化学', '生物', '历史', '地理',
  '算', '题', '公式', '字', '词', '句', '作文', '阅读', '单词', '语法',
  '奥数', '鸡兔同笼', '方程', '分数', '小数', '几何', '三角形', '圆',
  '背诵', '默写', '拼音', '笔顺', '成语', '古诗', '课文',
];

/**
 * 安全拦截关键词
 */
const SAFETY_KEYWORDS = [
  '杀', '死', '打', '枪', '刀', '血', '暴力', '色情', '裸', '色情',
  '自杀', '自残', '跳楼', '不想活',
];

/**
 * 快速判断意图（基于关键词）
 * 
 * @param text 用户输入文本
 * @returns 意图类型 + 置信度
 */
export function quickIntent(text: string): { intent: IntentType; confidence: number } {
  const lowerText = text.toLowerCase().trim();

  // 安全拦截优先
  for (const rule of KEYWORD_RULES) {
    for (const kw of rule.keywords) {
      if (lowerText.includes(kw.toLowerCase())) {
        // 检查是否是安全违规
        for (const skw of SAFETY_KEYWORDS) {
          if (lowerText.includes(skw)) {
            return { intent: 'safety_violation', confidence: 0.9 };
          }
        }
        return { intent: rule.intent, confidence: 0.8 };
      }
    }
  }

  // 安全拦截关键词检查
  for (const skw of SAFETY_KEYWORDS) {
    if (lowerText.includes(skw)) {
      return { intent: 'safety_violation', confidence: 0.85 };
    }
  }

  // 学科问答判断
  for (const kw of SUBJECT_KEYWORDS) {
    if (lowerText.includes(kw)) {
      return { intent: 'subject_question', confidence: 0.65 };
    }
  }

  // 默认闲聊
  if (lowerText.length < 15) {
    return { intent: 'casual_chat', confidence: 0.5 };
  }

  return { intent: 'unknown', confidence: 0.3 };
}

/**
 * 使用 LLM 辅助意图识别（当快速判断置信度较低时）
 * 
 * @param text 用户输入文本
 * @param apiKey LLM API Key
 * @param baseUrl API Base URL
 * @returns 意图类型
 */
export async function llmIntentRecognition(
  text: string,
  apiKey: string,
  baseUrl: string
): Promise<IntentType> {
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages: [
          { role: 'system', content: INTENT_PROMPT },
          { role: 'user', content: text },
        ],
        temperature: 0.1,
        max_tokens: 50,
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return 'unknown';
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return (parsed.intent as IntentType) || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * 混合意图识别：先用关键词快速判断，置信度低时再用 LLM
 * 
 * @param text 用户输入文本
 * @param apiKey LLM API Key（可选）
 * @param baseUrl API Base URL（可选）
 * @returns 意图类型
 */
export async function recognizeIntent(
  text: string,
  apiKey?: string,
  baseUrl?: string
): Promise<IntentType> {
  const quick = quickIntent(text);

  // 置信度 >= 0.65 直接用结果
  if (quick.confidence >= 0.65) {
    return quick.intent;
  }

  // 有 API Key 时用 LLM 辅助识别
  if (apiKey && baseUrl) {
    return llmIntentRecognition(text, apiKey, baseUrl);
  }

  // 兜底：返回快速判断结果
  return quick.intent;
}

/**
 * 安全内容检查
 */
export function checkSafety(text: string): { passed: boolean; reason?: string } {
  const lowerText = text.toLowerCase();

  for (const kw of SAFETY_KEYWORDS) {
    if (lowerText.includes(kw)) {
      return {
        passed: false,
        reason: '内容可能包含不适合小学生的话题，让我们聊聊别的吧～',
      };
    }
  }

  // 更复杂的审核可以用 LLM，这里先用关键词
  return { passed: true };
}
