/**
 * AI 模型调度器
 * 根据输入类型和任务场景，自动选择百炼 Token Plan 中的最优模型
 * 
 * 调度策略：
 * - 普通对话（无图）: qwen3.6-flash（快，TTFT <1s）
 * - 图片输入（拍题）: qwen3.6-flash（支持视觉理解）
 * - 复杂推理: qwen3.7-plus（能力强）
 * - 图片生成: qwen-image-2.0-pro（质量高）
 * - 超长文本: deepseek-v4-flash（上下文大）
 */

export type TaskType =
  | 'text_chat'        // 普通文本对话
  | 'image_input'      // 图片输入（拍题、识图）
  | 'image_output'     // 图片生成（魔法绘图）
  | 'complex_reasoning' // 复杂推理（数学、逻辑）
  | 'long_context';    // 超长上下文

export interface ModelConfig {
  model: string;
  maxTokens: number;
  temperature: number;
  supportsVision: boolean;
  supportsImageGen: boolean;
}

// 百炼 Token Plan 可用模型配置
const MODEL_REGISTRY: Record<string, ModelConfig> = {
  // 快速对话（默认）
  'qwen3.6-flash': {
    model: 'qwen3.6-flash',
    maxTokens: 4096,
    temperature: 0.7,
    supportsVision: true,   // ✅ 支持视觉理解
    supportsImageGen: false,
  },
  // 复杂推理
  'qwen3.7-plus': {
    model: 'qwen3.7-plus',
    maxTokens: 8192,
    temperature: 0.5,
    supportsVision: true,
    supportsImageGen: false,
  },
  'qwen3.7-max': {
    model: 'qwen3.7-max',
    maxTokens: 8192,
    temperature: 0.5,
    supportsVision: false,
    supportsImageGen: false,
  },
  // 图片生成
  'qwen-image-2.0-pro': {
    model: 'qwen-image-2.0-pro',
    maxTokens: 1024,
    temperature: 0.9,
    supportsVision: false,
    supportsImageGen: true,
  },
  'qwen-image-2.0': {
    model: 'qwen-image-2.0',
    maxTokens: 1024,
    temperature: 0.9,
    supportsVision: false,
    supportsImageGen: true,
  },
  // DeepSeek（备选）
  'deepseek-v4-flash': {
    model: 'deepseek-v4-flash',
    maxTokens: 4096,
    temperature: 0.7,
    supportsVision: false,
    supportsImageGen: false,
  },
  // Kimi（视觉理解备选）
  'kimi-k2.6': {
    model: 'kimi-k2.6',
    maxTokens: 4096,
    temperature: 0.7,
    supportsVision: true,
    supportsImageGen: false,
  },
};

/**
 * 根据任务类型选择模型
 */
export function selectModel(
  taskType: TaskType,
  options?: {
    forceModel?: string;  // 强制指定模型（调试用）
    hasImages?: boolean;  // 是否有图片输入
    isComplex?: boolean;  // 是否复杂问题
  }
): ModelConfig {
  // 强制指定模型（优先级最高）
  if (options?.forceModel && MODEL_REGISTRY[options.forceModel]) {
    return MODEL_REGISTRY[options.forceModel];
  }

  // 根据任务类型选择
  switch (taskType) {
    case 'image_input':
      // 图片输入：需要视觉理解能力
      return MODEL_REGISTRY['qwen3.6-flash'];  // 快 + 支持视觉

    case 'image_output':
      // 图片生成
      return MODEL_REGISTRY['qwen-image-2.0-pro'];

    case 'complex_reasoning':
      // 复杂推理
      return MODEL_REGISTRY['qwen3.7-plus'];

    case 'long_context':
      // 超长上下文
      return MODEL_REGISTRY['deepseek-v4-flash'];

    case 'text_chat':
    default:
      // 普通对话：根据是否有图片、是否复杂问题来决定
      if (options?.hasImages) {
        return MODEL_REGISTRY['qwen3.6-flash'];  // 支持视觉
      }
      if (options?.isComplex) {
        return MODEL_REGISTRY['qwen3.7-plus'];
      }
      // 默认：快速模型
      return MODEL_REGISTRY['qwen3.6-flash'];
  }
}

/**
 * 检测问题是否复杂（简单启发式）
 */
export function isComplexQuestion(text: string): boolean {
  const complexKeywords = [
    '为什么', '怎么理解', '分析', '比较', '推理', '证明',
    '计算过程', '解方程', '几何', '物理', '化学',
    '写一篇', '写一篇文章', '详细说明',
  ];
  return complexKeywords.some(kw => text.includes(kw)) || text.length > 200;
}

/**
 * 获取模型列表（用于前端下拉选择）
 */
export function getAvailableModels(): Array<{ id: string; name: string; description: string }> {
  return [
    { id: 'qwen3.6-flash', name: '千问3.6极速版', description: '快速响应，支持图片输入（推荐）' },
    { id: 'qwen3.7-plus', name: '千问3.7增强版', description: '能力强，适合复杂问题' },
    { id: 'qwen3.7-max', name: '千问3.7旗舰版', description: '最强推理能力' },
    { id: 'deepseek-v4-flash', name: 'DeepSeek极速版', description: '低成本，速度快' },
    { id: 'kimi-k2.6', name: 'Kimi2.6', description: '支持图片输入' },
  ];
}
