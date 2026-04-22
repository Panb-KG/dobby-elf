# Dobi-elf 开发计划

> 🧦 多比的项目重构与开发路线图 | 版本：2.0 | 创建：2026-04-22

---

## 📋 目录

- [项目概述](#项目概述)
- [当前状态](#当前状态)
- [Phase 1: 组件重构](#phase-1-组件重构)
- [Phase 2: Harness 集成](#phase-2-harness-集成)
- [Phase 3: Wiki 自动化](#phase-3-wiki-自动化)
- [Phase 4: 群协作功能](#phase-4-群协作功能)
- [Phase 5: 生产部署](#phase-5-生产部署)
- [开发规范](#开发规范)
- [检查清单](#检查清单)

---

## 项目概述

### 项目名称
**Dobi-elf** - 魔法小课桌 (Dobby's Magic Desk)

### 项目定位
- 基于 Next.js + TypeScript 的现代化 Web 应用
- 集成 AI 助手（多比）提供智能对话、学习规划、成就追踪
- 采用 MagicApp 架构模式，支持模块化扩展

### 目标用户
小学生（6-12 岁）及关注孩子学习的家长

### 核心价值
1. **学习管理** - 课程表、作业追踪、考试日历
2. **成就系统** - 游戏化激励，追踪成长轨迹
3. **智能助手** - AI 对话、学习建议、情感陪伴
4. **专注模式** - 番茄钟、任务分解、进度追踪

### 技术栈
| 层级 | 技术选型 |
|------|----------|
| 前端框架 | Next.js 12.3.4 + React 18.2 (Node.js 14 兼容) |
| 语言 | TypeScript 5.x |
| 样式 | Tailwind CSS 3.4 + CSS Modules |
| 状态管理 | React Hooks + Context |
| UI 组件 | Radix UI + 自研组件 |
| 后端 API | Dobby API (dobby.chat, dobby.user, etc.) |
| 数据库 | SQLite (better-sqlite3) |
| 部署 | Zeabur / Ubuntu 24.04 + PM2 |

---

## 当前状态

### 最后更新
**2026-04-22 08:47** - 项目从 GitHub 克隆

### 已完成工作
- ✅ 项目初始化（Next.js 12 + TypeScript）
- ✅ Node.js 14.15.2 兼容性调整
- ✅ 核心 API 实现：
  - ✅ `/api/chat` - 智能聊天助手
  - ✅ `/api/auth` - 用户认证系统
  - ✅ `/api/courses` - 课程表管理
  - ✅ `/api/achievements` - 成就系统
  - ✅ `/api/knowledge` - 知识图谱
  - ✅ `/api/image` - 魔法绘图

### 待办事项
- [ ] Phase 1: 组件重构（拆分 MagicApp）
- [ ] Phase 2: Harness 集成
- [ ] Phase 3: Wiki 自动化
- [ ] Phase 4: 群协作功能
- [ ] Phase 5: 生产部署

---

## Phase 1: 组件重构

**时间估算**: 15-20 小时  
**优先级**: 🔴 高  
**状态**: ⚪ 未开始

### 目标
将 MagicApp 中的业务逻辑拆分为独立的、可复用的组件和 Hooks，实现关注点分离。

### 任务分解

#### 1.1 组件提取（预计 10 小时）

| 组件 | 文件路径 | 依赖 | 工时 | 状态 |
|------|----------|------|------|------|
| `ChatModule` | `app/components/chat/ChatModule.tsx` | `useChat` | 2h | ⏳ 待开始 |
| `CourseModule` | `app/components/course/CourseModule.tsx` | `useCourses` | 2h | ⏳ 待开始 |
| `HomeworkModule` | `app/components/homework/HomeworkModule.tsx` | `useHomework` | 2h | ⏳ 待开始 |
| `AchievementModule` | `app/components/achievement/AchievementModule.tsx` | `useAchievements` | 2h | ⏳ 待开始 |
| `FocusModule` | `app/components/focus/FocusModule.tsx` | `useFocus` | 2h | ⏳ 待开始 |

#### 1.2 Hooks 提取（预计 5 小时）

| Hook | 文件路径 | 功能 | 工时 | 状态 |
|------|----------|------|------|------|
| `useChat` | `app/hooks/useChat.ts` | 聊天消息管理 | 1.5h | ⏳ 待开始 |
| `useCourses` | `app/hooks/useCourses.ts` | 课程数据管理 | 1h | ⏳ 待开始 |
| `useHomework` | `app/hooks/useHomework.ts` | 作业追踪 | 1h | ⏳ 待开始 |
| `useAchievements` | `app/hooks/useAchievements.ts` | 成就系统 | 1h | ⏳ 待开始 |
| `useFocus` | `app/hooks/useFocus.ts` | 专注模式 | 0.5h | ⏳ 待开始 |

#### 1.3 类型定义（预计 2 小时）

- [ ] 创建 `types/index.ts` - 统一类型导出
- [ ] 定义 `types/chat.ts` - 聊天相关类型
- [ ] 定义 `types/course.ts` - 课程相关类型
- [ ] 定义 `types/homework.ts` - 作业相关类型
- [ ] 定义 `types/achievement.ts` - 成就相关类型
- [ ] 定义 `types/focus.ts` - 专注相关类型

#### 1.4 测试编写（预计 3 小时）

- [ ] 为每个 Hook 编写单元测试
- [ ] 为每个组件编写集成测试
- [ ] 配置 Vitest 测试框架
- [ ] 设置 CI 自动测试

### 交付物
- ✅ 独立的组件库（5 个模块）
- ✅ 独立的 Hooks 库（5 个 Hooks）
- ✅ 完整的 TypeScript 类型定义
- ✅ 单元测试覆盖率 > 80%

---

## Phase 2: Harness 集成

**时间估算**: 10-15 小时  
**优先级**: 🔴 高  
**状态**: ⚪ 未开始

### 目标
将 Dobi-harness 多 Agent 编排系统集成到 Dobi-elf，实现智能任务分解和自动化工作流。

### 任务分解

#### 2.1 核心编排器集成（预计 4 小时）

- [ ] 安装 `dobi-harness` 包
- [ ] 配置 `harness/orchestrator.js`
- [ ] 创建 `lib/harness/client.ts` - Harness 客户端封装
- [ ] 实现任务提交接口 `POST /api/harness/execute`

#### 2.2 工作流实现（预计 6 小时）

| 工作流 | 描述 | 优先级 | 工时 |
|--------|------|--------|------|
| `CodeReview` | 自动代码审查 | 🔴 高 | 2h |
| `TestGen` | 测试用例生成 | 🟡 中 | 2h |
| `DocGen` | 文档自动生成 | 🟡 中 | 1h |
| `LearningPlan` | 学习计划生成 | 🔴 高 | 1h |

#### 2.3 UI 集成（预计 3 小时）

- [ ] 创建 `app/components/harness/HarnessPanel.tsx` - 控制面板
- [ ] 添加任务状态实时显示
- [ ] 实现任务日志流式输出
- [ ] 添加任务取消/重试功能

#### 2.4 配置与优化（预计 2 小时）

- [ ] 配置并发限制（`maxParallel: 5`）
- [ ] 配置超时策略（`timeoutSeconds: 300`）
- [ ] 配置重试机制（`retryAttempts: 2`）
- [ ] 性能基准测试

### 交付物
- ✅ Harness 编排器集成
- ✅ 4 个生产工作流
- ✅ 可视化控制面板
- ✅ 性能优化配置

---

## Phase 3: Wiki 自动化

**时间估算**: 8-12 小时  
**优先级**: 🟡 中  
**状态**: ⚪ 未开始

### 目标
基于 Karpathy LLM Wiki 模式，实现任务执行自动沉淀知识到 Wiki 系统。

### 任务分解

#### 3.1 Wiki 工具链（预计 4 小时）

- [ ] 配置 `wiki-ingest` 工具
- [ ] 配置 `wiki-query` 工具
- [ ] 配置 `wiki-search` 工具
- [ ] 配置 `wiki-lint` 工具

#### 3.2 Wiki 结构设计（预计 2 小时）

```
memory/wiki/
├── entities/          # 实体页（人、项目、组织）
│   ├── DobiElf.md
│   └── PanBo.md
├── concepts/          # 概念页（技术、模式、方法）
│   ├── MagicApp.md
│   └── HarnessEngineering.md
├── sources/           # 源文档（会议记录、文章）
│   └── ...
├── queries/           # 查询结果缓存
│   └── ...
└── index.md           # Wiki 首页
```

#### 3.3 自动化集成（预计 4 小时）

- [ ] 实现任务完成自动触发 `wiki-ingest`
- [ ] 实现 Query First 模式（执行前先查 Wiki）
- [ ] 配置交叉引用自动更新
- [ ] 实现时间线日志自动追加

#### 3.4 健康检查（预计 2 小时）

- [ ] 配置每周自动 `wiki-lint`
- [ ] 实现断链检测
- [ ] 实现孤立页面检测
- [ ] 生成 Wiki 健康报告

### 交付物
- ✅ Wiki 工具链配置完成
- ✅ Wiki 结构完整
- ✅ 自动化摄入流程
- ✅ 健康检查机制

---

## Phase 4: 群协作功能

**时间估算**: 6-10 小时  
**优先级**: 🟡 中  
**状态**: ⚪ 未开始

### 目标
实现群聊协作记忆能力，支持话题追踪、成员识别、进度汇报。

### 任务分解

#### 4.1 话题追踪（预计 3 小时）

- [ ] 实现 `#话题` 自动识别
- [ ] 创建话题归档到 `memory/wiki/topics/`
- [ ] 实现话题关联查询
- [ ] 配置话题时间线

#### 4.2 成员识别（预计 2 小时）

- [ ] 实现群成员 OpenID 映射
- [ ] 创建成员档案 `memory/wiki/groups/`
- [ ] 记录成员偏好和习惯
- [ ] 实现成员提及识别

#### 4.3 进度汇报（预计 3 小时）

- [ ] 配置定期汇报（每 4 小时）
- [ ] 实现汇报内容自动生成
- [ ] 支持汇报模板定制
- [ ] 实现汇报历史查询

#### 4.4 任务跟进（预计 2 小时）

- [ ] 实现任务自动分配
- [ ] 配置任务到期提醒
- [ ] 实现任务状态同步
- [ ] 生成任务完成报告

### 交付物
- ✅ 话题追踪系统
- ✅ 成员档案管理
- ✅ 自动进度汇报
- ✅ 任务跟进机制

---

## Phase 5: 生产部署

**时间估算**: 4-6 小时  
**优先级**: 🟢 低  
**状态**: ⚪ 未开始

### 目标
完成生产环境部署，确保系统稳定运行。

### 任务分解

#### 5.1 环境配置（预计 2 小时）

- [ ] 配置生产环境变量
- [ ] 配置数据库连接
- [ ] 配置 API 密钥管理
- [ ] 配置日志收集

#### 5.2 性能优化（预计 2 小时）

- [ ] 启用 Next.js ISR
- [ ] 配置 CDN 缓存
- [ ] 优化图片加载
- [ ] 实现懒加载

#### 5.3 监控告警（预计 2 小时）

- [ ] 配置错误追踪（Sentry）
- [ ] 配置性能监控
- [ ] 配置 uptime 监控
- [ ] 配置告警通知

### 交付物
- ✅ 生产环境部署
- ✅ 性能优化完成
- ✅ 监控告警系统

---

## 开发规范

### 代码规范

#### 命名约定
```typescript
// 组件：PascalCase
ChatModule.tsx
CourseModule.tsx

// Hooks: camelCase + use 前缀
useChat.ts
useCourses.ts

// 类型：PascalCase
interface ChatMessage { ... }
type CourseStatus = 'active' | 'completed';

// 工具函数：camelCase
formatDate.ts
calculateProgress.ts
```

#### 目录结构
```
dobby-elf/
├── app/
│   ├── components/
│   │   ├── chat/
│   │   ├── course/
│   │   ├── homework/
│   │   ├── achievement/
│   │   └── focus/
│   ├── hooks/
│   ├── types/
│   ├── lib/
│   └── api/
├── data/
├── memory/
└── tests/
```

#### 提交规范
```bash
# 格式：<type>(<scope>): <subject>

# 示例
feat(chat): 添加消息快捷指令
fix(course): 修复课程颜色冲突
docs: 更新开发计划
refactor(hooks): 提取 useChat 逻辑
```

### 测试规范

- 单元测试覆盖率 > 80%
- 关键路径必须编写测试
- 使用 Vitest 作为测试框架
- CI 自动运行测试

### 文档规范

- 每个组件必须有 README.md
- 每个 Hook 必须有使用示例
- API 接口必须有 OpenAPI 文档
- 变更必须更新 CHANGELOG.md

---

## 检查清单

### 每日检查
- [ ] 查看 `DEVELOPMENT_PLAN.md` 确认当前任务
- [ ] 更新 `memory/wiki/log.md` 记录进展
- [ ] 提交代码前运行测试
- [ ] 代码符合 ESLint 规范

### 阶段检查
- [ ] Phase 完成度确认
- [ ] 交付物完整性检查
- [ ] 文档更新检查
- [ ] 测试覆盖率检查

### 发布检查
- [ ] 所有测试通过
- [ ] 文档完整
- [ ] 性能基准测试
- [ ] 安全审计通过

---

## 里程碑

| 里程碑 | 预计完成 | 状态 |
|--------|----------|------|
| Phase 1 完成（组件重构） | 2026-04-25 | ⚪ 未开始 |
| Phase 2 完成（Harness 集成） | 2026-05-05 | ⚪ 未开始 |
| Phase 3 完成（Wiki 自动化） | 2026-05-15 | ⚪ 未开始 |
| Phase 4 完成（群协作） | 2026-05-25 | ⚪ 未开始 |
| Phase 5 完成（生产部署） | 2026-06-01 | ⚪ 未开始 |

---

## 风险与应对

| 风险 | 影响 | 概率 | 应对措施 |
|------|------|------|----------|
| API 变更 | 高 | 中 | 抽象 API 层，快速适配 |
| 性能瓶颈 | 中 | 低 | 提前基准测试，优化关键路径 |
| 依赖冲突 | 中 | 中 | 锁定版本，定期更新 |
| 时间延期 | 高 | 中 | 拆分任务，优先核心功能 |

---

## 联系方式

- **项目负责人**: 皮爷
- **开发**: 多比 🧦
- **项目地址**: `/home/admin/.openclaw/workspace/dobby-elf`
- **GitHub**: https://github.com/Panb-KG/dobby-elf
- **文档**: 本文件 + `PRD.md` + `DEPLOYMENT_UBUNTU.md`

---

*最后更新：2026-04-22 08:50 | 版本：2.0 | 状态：活跃*
