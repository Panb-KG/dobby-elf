/**
 * Agent 工具定义
 * 
 * 定义所有 Agent 可调用的工具
 * v2.0 新增
 */

import type { AgentTool } from './types';

/**
 * 全部工具定义
 */
export const AGENT_TOOLS: AgentTool[] = [
  {
    name: 'search_knowledge',
    description: '从知识库中检索与用户问题相关的知识条目。适用于学科问答、知识点查询、题库检索等场景。',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '搜索关键词',
        },
        category: {
          type: 'string',
          enum: ['数学', '语文', '英语', '科学', '奥数', '其他'],
          description: '知识分类',
        },
        topK: {
          type: 'number',
          description: '返回结果数量，默认3',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_schedule',
    description: '查询用户的课程表。可以查今日课表、本周课表或特定日期的课表。',
    parameters: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: '日期，格式 YYYY-MM-DD，不传则查今日',
        },
        week: {
          type: 'boolean',
          description: '是否返回整周课表',
        },
      },
    },
  },
  {
    name: 'get_homework',
    description: '查询用户的作业列表。可以查今日作业、全部作业或特定科目的作业。',
    parameters: {
      type: 'object',
      properties: {
        subject: {
          type: 'string',
          description: '科目筛选，如"数学"、"语文"',
        },
        status: {
          type: 'string',
          enum: ['pending', 'completed', 'all'],
          description: '作业状态',
        },
      },
    },
  },
  {
    name: 'generate_question',
    description: '根据科目、年级、知识点生成练习题。可以指定题目数量和难度。',
    parameters: {
      type: 'object',
      properties: {
        subject: {
          type: 'string',
          description: '科目，如"数学"、"语文"、"英语"',
        },
        topic: {
          type: 'string',
          description: '知识点/主题',
        },
        grade: {
          type: 'number',
          description: '年级，1-6',
        },
        difficulty: {
          type: 'string',
          enum: ['easy', 'medium', 'hard'],
          description: '难度',
        },
        count: {
          type: 'number',
          description: '题目数量，默认1',
        },
      },
      required: ['subject'],
    },
  },
  {
    name: 'generate_image',
    description: '根据文字描述生成插图/图片，帮助理解抽象概念。',
    parameters: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: '图片描述',
        },
      },
      required: ['description'],
    },
  },
  {
    name: 'show_panel',
    description: '控制右栏面板的展示内容。用于展示知识卡片、练习题、课表、作业等。',
    parameters: {
      type: 'object',
      properties: {
        panelType: {
          type: 'string',
          enum: [
            'knowledge_card', 'exercise', 'schedule',
            'homework', 'image', 'growth_tree', 'parent_score',
            'profile', 'none',
          ],
          description: '面板类型',
        },
        title: {
          type: 'string',
          description: '面板标题',
        },
        data: {
          type: 'object',
          description: '面板展示的数据',
        },
        open: {
          type: 'boolean',
          description: '是否打开右栏',
        },
      },
      required: ['panelType'],
    },
  },
  {
    name: 'get_growth_tree',
    description: '查询用户成长之树的状态，包括等级、积分、浇水次数等。',
    parameters: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: '用户ID',
        },
      },
      required: ['userId'],
    },
  },
  {
    name: 'get_daily_scores',
    description: '查询今日亲子打分记录。',
    parameters: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: '用户ID',
        },
        date: {
          type: 'string',
          description: '日期 YYYY-MM-DD，不传则查今日',
        },
      },
      required: ['userId'],
    },
  },
];

/**
 * 根据意图筛选可用工具
 */
export function getToolsForIntent(intent: string): AgentTool[] {
  switch (intent) {
    case 'subject_question':
      return ['search_knowledge', 'generate_question', 'generate_image', 'show_panel']
        .map(name => AGENT_TOOLS.find(t => t.name === name))
        .filter(Boolean) as AgentTool[];
    case 'homework_help':
      return ['get_homework', 'search_knowledge', 'show_panel']
        .map(name => AGENT_TOOLS.find(t => t.name === name))
        .filter(Boolean) as AgentTool[];
    case 'schedule_query':
      return ['get_schedule', 'show_panel']
        .map(name => AGENT_TOOLS.find(t => t.name === name))
        .filter(Boolean) as AgentTool[];
    case 'exercise_generate':
      return ['generate_question', 'search_knowledge', 'show_panel']
        .map(name => AGENT_TOOLS.find(t => t.name === name))
        .filter(Boolean) as AgentTool[];
    case 'growth_tree':
      return ['get_growth_tree', 'show_panel']
        .map(name => AGENT_TOOLS.find(t => t.name === name))
        .filter(Boolean) as AgentTool[];
    case 'parent_score':
      return ['get_daily_scores', 'show_panel']
        .map(name => AGENT_TOOLS.find(t => t.name === name))
        .filter(Boolean) as AgentTool[];
    default:
      return AGENT_TOOLS;
  }
}
