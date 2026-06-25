# Dobi-elf v2.0 升级计划

> 🧦 Agent 驱动架构 | 知识库 | 成长之树 | 亲子打分 | 个人展示（预留）
> 版本：2.0 | 创建：2026-06-25

---

## 📋 升级概述

v2.0 是 dobby-elf 的架构级升级，核心变化：

| 维度 | v1.0 | v2.0 |
|------|------|------|
| **问答引擎** | 直接调 LLM API | Agent 编排层（安全检查 → 意图识别 → 工具调度 → 生成） |
| **知识库** | ❌ 无 | ✅ RAG 检索增强（向量化 + 相似度搜索） |
| **右栏展示** | 手动切换标签 | Agent 指令驱动（自动展示相关内容） |
| **安全护栏** | 简单 system prompt | 多重安全审核（关键词 + LLM） |
| **成长激励** | 基础积分 | 成长之树 + 亲子打分系统 |
| **个人展示** | ❌ 无 | ✅ 数据库预留（v2.1 开发） |

---

## 🏗️ 新架构

```
┌──────────────────────────────────────────────────────┐
│                    前端 Web 界面                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ 左栏      │  │ 中栏      │  │ 右栏（按需展开）    │   │
│  │ · 快捷按钮│  │ · 问答对话 │  │ · 知识卡片        │   │
│  │ · 知识库  │  │ · 语音交互 │  │ · 练习题/解答     │   │
│  │ · 历史记录│  │          │  │ · 课表/作业       │   │
│  │ · 成长之树│  │          │  │ · 个人展示(v2.1)   │   │
│  │ · 亲子打分│  │          │  │ · 图片/短视频     │   │
│  └──────────┘  └──────────┘  └──────────────────┘   │
└────────────────────────┬─────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼─────────────────────────────┐
│              Agent 编排层（v2.0 新增核心）              │
│                                                     │
│  1. 安全检查 → 2. 意图识别 → 3. 工具调度 → 4. 生成   │
│                                                     │
│  System Prompt（小学生安全护栏）                      │
│  + 知识库上下文注入                                   │
│  + 右栏面板指令解析                                   │
└────────────────────────┬─────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────┐
│              数据层                                    │
│  SQLite + 向量索引 + 文件存储                           │
│  + 知识库（knowledge_items）                           │
│  + 成长之树（growth_trees）                            │
│  + 成长积分（growth_point_records）                     │
│  + 亲子打分（score_rules + daily_score_records）       │
│  + 个人展示（showcase_profiles，预留）                  │
└──────────────────────────────────────────────────────┘
```

---

## 📁 新增文件清单

### Agent 编排层
```
app/lib/agent/
├── types.ts            # 类型定义
├── system-prompt.ts    # System Prompt（安全护栏）
├── tools.ts            # 工具定义
├── intent-router.ts    # 意图路由（关键词 + LLM）
└── index.ts            # Agent 主入口
```

### 知识库模块
```
app/lib/knowledge/
├── types.ts            # 类型定义
├── embedder.ts         # 向量化服务（DashScope）
├── search.ts           # 检索服务（向量 + 关键词）
└── index.ts            # 统一导出 + 文本分块
```

### 成长积分模块
```
app/lib/growth/
├── tree.ts             # 成长之树
├── scoring.ts          # 亲子打分
└── index.ts            # 统一导出
```

### API 路由
```
app/api/chat/agent/route.ts     # Agent 驱动聊天（取代原 /api/chat）
app/api/knowledge/route.ts      # 知识库搜索
app/api/knowledge/upload/route.ts  # 知识库上传
app/api/growth/tree/route.ts    # 成长之树查询
app/api/growth/records/route.ts # 积分记录
app/api/growth/water/route.ts   # 浇水
app/api/score/rules/route.ts    # 打分规则
app/api/score/daily/route.ts    # 每日打分记录
```

### 数据库迁移
```
app/lib/db-migration-v2.ts      # v2.0 数据库迁移
```

---

## 🗄️ 数据库变更

### 新增表

| 表名 | 用途 |
|------|------|
| `knowledge_items` | 知识库条目（含向量 embedding） |
| `growth_trees` | 成长之树（等级、积分、阶段） |
| `growth_point_records` | 成长积分记录 |
| `score_rules` | 亲子打分规则 |
| `daily_score_records` | 每日打分记录 |
| `showcase_profiles` | 个人展示（v2.1 预留） |

### 迁移方式

自动执行：应用启动时调用 `ensureV2Schema()`，检查 `_migrations` 表后自动迁移。

---

## 🚀 开发阶段

| 阶段 | 内容 | 状态 |
|------|------|------|
| **Phase 0** | Agent system prompt + 工具定义 | ✅ 完成 |
| **Phase 1** | Agent 编排层（意图路由 + 工具调度） | ✅ 完成 |
| **Phase 2** | 知识库（向量化 + 检索 + 上传） | ✅ 完成 |
| **Phase 3** | 成长之树 + 亲子打分 | ✅ 完成 |
| **Phase 4** | 数据库迁移 + API 路由 | ✅ 完成 |
| **Phase 5** | 前端 v2.0 页面 + Agent 对接 | ✅ 完成 |
| **Phase 6** | 右栏 Agent 驱动展示 | ✅ 完成 |
| **Phase 7** | 语音输入/输出 | ✅ 基础完成 |
| **Phase 8** | 内容安全过滤层 | ⏳ 待完善 |
| **Phase 9** | 个人展示页面（v2.1） | ⏳ 预留 |
| **Phase 10** | 魔法日记 | ✅ 完成 |

---

## 🔌 API 使用指南

### 1. Agent 聊天

```typescript
// 非流式
POST /api/chat/agent
{
  "messages": [
    { "role": "user", "content": "鸡兔同笼问题怎么做？" }
  ]
}

// 响应
{
  "text": "鸡兔同笼是一种经典的数学题...",
  "intent": "subject_question",
  "toolsUsed": ["search_knowledge"],
  "panelAction": { "type": "knowledge_card", "open": true },
  "knowledgeRefs": ["kb_xxx", "kb_yyy"]
}

// 流式（SSE）
GET /api/chat/agent?message=鸡兔同笼怎么做&history=[]
```

### 2. 知识库

```typescript
// 搜索
GET /api/knowledge?q=鸡兔同笼&topK=3&category=数学

// 上传
POST /api/knowledge/upload
{
  "title": "鸡兔同笼专题",
  "source": "奥数题库.pdf",
  "category": "奥数",
  "content": "鸡兔同笼是中国古代...",
  "metadata": { "grade": 4, "chapter": "经典题型", "type": "question" }
}
```

### 3. 成长之树

```typescript
// 查询
GET /api/growth/tree

// 浇水
POST /api/growth/water

// 积分记录
GET /api/growth/records?limit=20
```

### 4. 亲子打分

```typescript
// 获取规则
GET /api/score/rules

// 添加规则
POST /api/score/rules
{
  "title": "按时完成作业",
  "description": "每天放学后按时完成作业",
  "maxPoints": 5,
  "icon": "📚",
  "category": "study"
}

// 每日打分
POST /api/score/daily
{
  "ruleId": "scr_xxx",
  "score": 4,
  "comment": "今天很棒！",
  "scoredBy": "parent",
  "date": "2026-06-25"
}

// 查询今日
GET /api/score/daily?date=2026-06-25
```

---

## 🔧 环境变量

| 变量 | 用途 | 默认值 |
|------|------|--------|
| `AGENT_MODEL` | Agent 使用的模型 | `qwen-turbo` |
| `AGENT_MAX_TOKENS` | 最大 token 数 | `2048` |
| `AGENT_TEMPERATURE` | 温度 | `0.7` |
| `DASHSCOPE_API_KEY` | API Key | - |
| `DASHSCOPE_BASE_URL` | API 地址 | DashScope 默认 |

原有 `TOKEN_PLAN_API_KEY` / `TOKEN_PLAN_BASE_URL` 兼容。

---

## 📝 升级步骤

### 1. 代码已就绪 ✅

所有后端文件已创建：
- `app/lib/agent/` - Agent 编排层
- `app/lib/knowledge/` - 知识库
- `app/lib/growth/` - 成长积分
- `app/lib/db-migration-v2.ts` - 数据库迁移
- 新 API 路由

### 2. 安装依赖

```bash
cd dobby-elf
npm install
```

### 3. 配置环境变量

在 `.env.local` 中添加：
```
AGENT_MODEL=qwen-turbo
AGENT_MAX_TOKENS=2048
AGENT_TEMPERATURE=0.7
```

（DASHSCOPE_API_KEY 等已有配置不变）

### 4. 测试 Agent API

```bash
# 启动开发服务器
npm run dev

# 测试聊天
curl -X POST http://localhost:3000/api/chat/agent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"messages":[{"role":"user","content":"你好多比"}]}'
```

### 5. 前端改造（下一步）

- 重做三栏布局
- 集成语音输入/输出
- 右栏 Agent 驱动展示
- 成长之树 UI
- 亲子打分 UI

---

## 🎯 下一步

Phase 0-7 的核心功能已全部就绪！v2.0 页面位于 `/v2` 路由。

1. **前端三栏重做**：简化现有布局，对接 Agent API
2. **语音能力**：Web Speech API 输入 + TTS 播报
3. **右栏响应式**：根据 `panelAction` 动态展示
4. **成长之树 UI**：可视化成长树 + 浇水动画
5. **个人展示**：v2.1 开发，简历/证书/照片编排

---

*最后更新：2026-06-25 | 版本：2.0 | 状态：Phase 0-7 完成，前端 v2.0 可用*
