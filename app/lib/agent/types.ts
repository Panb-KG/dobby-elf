/**
 * Agent 编排层 - 类型定义
 * 
 * v2.0 新增：Agent 驱动的智能问答引擎
 */

// ===== 意图类型 =====

export type IntentType =
  | 'subject_question'     // 学科问答（查知识库）
  | 'homework_help'        // 作业辅导
  | 'schedule_query'       // 课表查询
  | 'exercise_generate'    // 生成练习题
  | 'knowledge_upload'     // 上传知识
  | 'growth_tree'          // 成长之树查询/操作
  | 'parent_score'         // 亲子打分
  | 'image_generate'       // 生成图片
  | 'casual_chat'          // 闲聊陪伴
  | 'safety_violation'     // 安全违规（拦截）
  | 'unknown';             // 未知意图

// ===== Agent 工具 =====

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

// ===== Agent 工具调用结果 =====

export interface ToolCallResult {
  toolName: string;
  success: boolean;
  data?: unknown;
  error?: string;
}

// ===== 右栏面板指令 =====

export type PanelType =
  | 'none'           // 不展示右栏
  | 'knowledge_card' // 知识卡片
  | 'exercise'       // 练习题
  | 'schedule'       // 课表
  | 'homework'       // 作业
  | 'image'          // 图片
  | 'growth_tree'    // 成长之树
  | 'parent_score'   // 亲子打分
  | 'profile';       // 个人展示（预留）

export interface PanelAction {
  type: PanelType;
  title?: string;
  data?: Record<string, unknown>;
  open?: boolean;  // true=打开右栏, false=关闭
}

// ===== Agent 响应结构 =====

export interface AgentResponse {
  /** AI 回复文本 */
  text: string;
  /** 识别到的意图 */
  intent: IntentType;
  /** 使用的工具列表 */
  toolsUsed: string[];
  /** 右栏面板操作指令 */
  panelAction?: PanelAction;
  /** 安全拦截标记 */
  safetyBlocked: boolean;
  /** 安全拦截原因 */
  safetyReason?: string;
  /** 引用的知识条目 ID */
  knowledgeRefs?: string[];
}

// ===== Agent 编排配置 =====

export interface AgentConfig {
  /** 模型名称 */
  model: string;
  /** API Base URL */
  baseUrl: string;
  /** API Key */
  apiKey: string;
  /** 最大 token */
  maxTokens: number;
  /** 温度 */
  temperature: number;
  /** 是否流式响应 */
  stream: boolean;
  /** 安全级别 */
  safetyLevel: 'strict' | 'moderate' | 'relaxed';
}

// ===== 知识库检索请求 =====

export interface KnowledgeSearchRequest {
  query: string;
  topK?: number;
  category?: string;
  grade?: number;
  type?: 'textbook' | 'question' | 'outline' | 'reference';
}

export interface KnowledgeSearchResult {
  id: string;
  source: string;
  category: string;
  title: string;
  content: string;
  score: number;
  metadata: {
    grade: number;
    chapter: string;
    page?: number;
    type: string;
  };
}

// ===== 成长之树 =====

export interface GrowthTreeNode {
  id: string;
  userId: string;
  totalPoints: number;
  treeLevel: number;      // 树的等级（1-100）
  treeStage: string;      // 树的阶段：种子/嫩芽/小树/大树/参天树
  waterCount: number;     // 今日浇水次数
  lastWateredAt?: string;
  achievements: string[]; // 解锁的成就
  createdAt: string;
  updatedAt: string;
}

export interface GrowthPointRecord {
  id: string;
  userId: string;
  points: number;
  reason: string;
  source: 'chat' | 'homework' | 'exercise' | 'focus' | 'parent_score' | 'daily_task';
  createdAt: string;
}

// ===== 亲子打分 =====

export interface ScoreRule {
  id: string;
  userId: string;
  title: string;
  description: string;
  maxPoints: number;       // 最高分
  icon: string;            // emoji 图标
  category: 'study' | 'life' | 'behavior' | 'exercise' | 'other';
  createdAt: string;
}

export interface DailyScoreRecord {
  id: string;
  userId: string;
  ruleId: string;
  score: number;           // 实际得分
  comment?: string;        // 父母评语
  scoredBy: string;        // 打分人（parent 或 child）
  date: string;            // 日期 YYYY-MM-DD
  createdAt: string;
}

// ===== 安全审核结果 =====

export interface SafetyCheckResult {
  passed: boolean;
  reason?: string;
  level: 'safe' | 'warning' | 'blocked';
}
