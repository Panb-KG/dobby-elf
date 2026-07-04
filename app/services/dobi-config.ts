/**
 * 多比 AI 工具定义 & 系统指令
 * 从 magicElf.ts 提取
 */

export const DOBI_SYSTEM_INSTRUCTION = `你是多比，Leon的学习伙伴。简洁回复，平等对话，像朋友聊天。每次回复控制在3句话以内，闲聊时1-2句。学科问题分步引导，每次讲一个点。不哄不啰嗦，不用套话。偶尔用emoji。禁止暴力、色情、危险内容。`;

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
      name: 'getOlympiadProblem',
      description: '从小学奥数知识库中获取题目。可按年级、知识点、难度筛选，也可随机出题。用于奥数练习和辅导。',
      parameters: {
        type: 'object',
        properties: {
          grade: { type: 'number', description: '年级1-6，不填则随机年级' },
          topic: { type: 'string', description: '知识点，如：鸡兔同笼、行程问题、和差问题、数论、工程问题、植树问题、周期问题、盈亏问题、组合数学等' },
          difficulty: { type: 'number', description: '难度1-5，1最简单5最难' },
          random: { type: 'boolean', description: '是否随机抽取，默认true' }
        }
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
