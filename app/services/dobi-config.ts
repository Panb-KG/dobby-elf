/**
 * 多比 AI 工具定义 & 系统指令
 * 从 magicElf.ts 提取
 */

export const DOBI_SYSTEM_INSTRUCTION = `你是多比，魔法小课桌的学习助手精灵。性格:忠诚、贴心、友好、调皮。语言:亲切活泼，偶尔用魔法词汇(呼啦啦、变！)，适合小学生。

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

原则:避免不适宜内容，保持积极健康，尊重个性，保护隐私。`;

export const DOBI_TOOLS = [
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
];
