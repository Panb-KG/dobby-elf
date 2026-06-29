/**
 * 内容安全过滤层
 * 
 * 对 Agent 回复进行二次审核，确保适合小学生
 * v2.0 Phase 8
 */

import { getErrorMessage } from '@/lib/error-helper';

// ===== 安全关键词库 =====

const BLOCKED_KEYWORDS = [
  // 暴力
  '杀人', '自杀', '打架', '砍人', '捅', '刀砍', '枪杀', '爆炸',
  // 色情
  '裸体', '色情', '性行为', '裸照',
  // 恐怖
  '鬼', '尸体', '血腥', '断头',
  // 危险行为
  '玩火', '爬楼', '跳楼', '喝药', '吃老鼠药',
  // 负面情绪
  '不想活', '去死', '活不下去', '想自杀',
  // 政治敏感（简化版）
  '法轮功', '台独', '港独',
];

const WARNING_KEYWORDS = [
  // 需要引导的内容
  '鬼故事', '恐怖故事', '噩梦', '害怕',
  '吵架', '欺负', '孤立', '霸凌',
  '父母离婚', '爸妈吵架',
];

export interface SafetyCheckResult {
  passed: boolean;
  level: 'safe' | 'warning' | 'blocked';
  reason?: string;
  suggestion?: string;  // 安全话术建议
}

/**
 * 文本安全检查
 */
export function checkTextSafety(text: string): SafetyCheckResult {
  const lowerText = text.toLowerCase();

  // 1. 拦截关键词检查
  for (const keyword of BLOCKED_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return {
        passed: false,
        level: 'blocked',
        reason: `检测到不适合小学生的内容（${keyword}）`,
        suggestion: '这个话题我们换个聊聊吧～不如跟我说说你今天在学校遇到了什么有趣的事情？🌟',
      };
    }
  }

  // 2. 警告关键词检查
  for (const keyword of WARNING_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return {
        passed: true,
        level: 'warning',
        reason: `检测到可能需要引导的内容（${keyword}）`,
        suggestion: undefined,
      };
    }
  }

  return { passed: true, level: 'safe' };
}

/**
 * 用户输入安全检查
 */
export function checkInputSafety(text: string): SafetyCheckResult {
  const lowerText = text.toLowerCase();

  // 拦截关键词
  for (const keyword of BLOCKED_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return {
        passed: false,
        level: 'blocked',
        reason: `输入包含不适合的内容`,
        suggestion: '这个话题我们换个聊聊吧～不如跟我说说你今天在学校学到了什么有趣的东西？',
      };
    }
  }

  return { passed: true, level: 'safe' };
}

/**
 * 使用 LLM 进行深度安全审核
 * 
 * @param text 待审核文本
 * @param apiKey API Key
 * @param baseUrl API Base URL
 */
export async function llmSafetyCheck(
  text: string,
  apiKey: string,
  baseUrl: string
): Promise<SafetyCheckResult> {
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
          {
            role: 'system',
            content: `你是一个面向小学生的内容安全审核助手。请判断以下文本是否适合6-12岁儿童阅读。

审核标准：
- 暴力、伤害、打架、武器 → blocked
- 色情、恐怖 → blocked
- 危险行为指导 → blocked
- 负面情绪引导（焦虑、抑郁、自残） → blocked
- 需要关注的内容（霸凌、家庭问题） → warning
- 正常内容 → safe

只返回 JSON：{"level": "safe"|"warning"|"blocked", "reason": "原因", "suggestion": "替代话术（仅blocked时需要）"}
不要返回其他内容。`,
          },
          { role: 'user', content: text.substring(0, 2000) },
        ],
        temperature: 0.1,
        max_tokens: 100,
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return { passed: true, level: 'safe' };  // 审核失败时默认通过
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return {
      passed: parsed.level !== 'blocked',
      level: parsed.level || 'safe',
      reason: parsed.reason,
      suggestion: parsed.suggestion,
    };
  } catch {
    // LLM 审核失败时回退到关键词审核
    return checkTextSafety(text);
  }
}

/**
 * 混合安全检查：先关键词，必要时 LLM
 */
export async function hybridSafetyCheck(
  text: string,
  apiKey?: string,
  baseUrl?: string
): Promise<SafetyCheckResult> {
  // 先做关键词检查
  const keywordResult = checkTextSafety(text);

  // blocked 直接拦截
  if (keywordResult.level === 'blocked') {
    return keywordResult;
  }

  // warning 时可以做 LLM 深度检查
  if (keywordResult.level === 'warning' && apiKey && baseUrl) {
    return llmSafetyCheck(text, apiKey, baseUrl);
  }

  return keywordResult;
}

/**
 * 安全话术替换
 */
export function getSafeResponse(result: SafetyCheckResult): string {
  if (result.level === 'blocked') {
    return result.suggestion || '让我们聊聊别的吧～';
  }
  if (result.level === 'warning') {
    // warning 不拦截，但可以附加关心的话
    return result.suggestion || undefined as any;
  }
  return '';
}

/**
 * 敏感信息脱敏
 */
export function sanitizeContent(text: string): string {
  // 替换手机号
  let sanitized = text.replace(/1[3-9]\d{9}/g, '***手机号已隐藏 ***');
  // 替换身份证号
  sanitized = sanitized.replace(/\d{17}[\dXx]/g, '***身份证号已隐藏 ***');
  // 替换邮箱
  sanitized = sanitized.replace(/[\w.-]+@[\w.-]+\.\w+/g, '***邮箱已隐藏 ***');
  return sanitized;
}
