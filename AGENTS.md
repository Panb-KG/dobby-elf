# AGENTS.md — Dobby-elf 编码Agent指引

## 项目概述

Dobby-elf（魔法精灵）是一款面向小学生的 AI 教育应用，采用 Next.js + Supabase 全栈架构。核心功能包括 AI 对话辅导、作业管理、魔法日记、成长之树、专注训练和知识问答。

- **框架**: Next.js 16 (App Router) + React 19 + TypeScript 5.8
- **后端**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **样式**: Tailwind CSS 4
- **测试**: Vitest + @testing-library/react + Playwright
- **部署**: Docker → Zeabur / 自建服务器

## 目录结构

```
app/
├── admin/          # 管理后台（用户、任务、审计、监控）
├── api/            # Next.js Route Handlers（服务端 API）
│   ├── auth-sb/    # Supabase Auth 路由
│   ├── chat/       # AI 对话 API
│   ├── diary/      # 日记 CRUD
│   ├── growth/     # 成长数据
│   ├── homework/   # 作业管理
│   ├── knowledge/  # 知识库问答
│   ├── score/      # 打分系统
│   └── middleware.ts # API 通用中间件（user_id 校验、错误响应）
├── components/     # React 组件
│   ├── v2/         # 当前主版本组件
│   ├── chat/       # 对话相关组件
│   ├── layout/     # 布局组件
│   └── ui/         # 通用 UI 组件
├── contexts/       # React Context（AuthContext）
├── hooks/          # 自定义 Hooks
├── lib/            # 核心库
│   ├── supabase.ts       # Supabase 客户端（浏览器单例 + 服务端工厂）
│   ├── supabase-queries.ts # 类型安全的数据库查询
│   ├── api-auth.ts       # API 鉴权（Bearer token → Supabase Auth）
│   ├── security.ts       # 安全头、速率限制
│   └── storage.ts        # 本地存储工具
├── services/       # 业务服务层
├── types/          # TypeScript 类型定义
└── data/           # 静态数据（奥数题库等）
```

## 路径别名

`@/*` 映射到 `./app/*`，在 tsconfig.json 中配置。

```ts
import { requireSupabaseClient } from '@/lib/supabase';
```

## Supabase 约定

### 客户端使用

- **浏览器端**: 使用 `getSupabaseBrowserClient()` 或 `requireSupabaseClient()`（单例）
- **服务端（API Route）**: 使用 `getSupabaseServerClient()`（每次新建，避免内存泄漏）
- **服务端写入**: 需要 `SUPABASE_SERVICE_ROLE_KEY` 绕过行级安全（RLS）

### 认证策略

- 用户名登录（无需邮箱），可选 4 位 PIN
- 首次使用自动创建账号（`profiles` 表）
- 访客模式默认启用，写入 Supabase 才需登录
- 用户角色: `student` | `parent` | `teacher`

### 数据库表

- `profiles` — 用户档案（id, username, role, grade, avatar_url）
- `diaries` — 日记
- `homework` — 作业
- `growth_records` — 成长记录
- `chat_messages` — 对话消息
- 所有用户数据表启用 RLS，按 `user_id` 隔离

### 实时同步

使用 `subscribeToTable()` 订阅表变更，按 `user_id` 过滤。

## API 路由约定

- 每个路由在 `app/api/<module>/route.ts` 导出 `GET`/`POST`/`PUT`/`DELETE`
- 使用 `app/api/middleware.ts` 的 `requireUserId()`、`errorResponse()`、`checkSupabase()`
- 鉴权用 `app/lib/api-auth.ts` 的 `requireAuth()` + `unauthorizedResponse()`
- 根目录 `middleware.ts` 处理 API 速率限制和安全头（仅 `/api/*`）

## 构建与测试命令

```bash
npm run dev          # 开发服务器
npm run build        # 生产构建
npm run lint         # ESLint 检查
npm test             # Vitest 单元测试
npm run migrate      # 数据库迁移
npm run healthcheck  # 健康检查（/api/health）
```

## 关键约束

1. **API 路由需 Next.js 环境** — 不能脱离 Next.js 单独测试，vitest 覆盖率排除 `app/api/`
2. **数据库依赖外部文件** — `app/lib/db.ts` 依赖 Supabase 连接，vitest 排除
3. **Supabase 客户端延迟初始化** — 避免构建时环境变量缺失报错
4. **standalone 模式已禁用** — Zeabur 平台不兼容，使用标准部署
5. **Node 20** — 通过 `.node-version` 固定
6. **TypeScript strict** — 所有代码必须通过严格类型检查
7. **环境变量**:
   - `NEXT_PUBLIC_SUPABASE_URL` — Supabase 项目 URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase 匿名密钥
   - `SUPABASE_SERVICE_ROLE_KEY` — 服务端密钥（绕过 RLS）
   - `DASHSCOPE_API_KEY` — 阿里云 AI 模型密钥

## 测试约定

- 单元测试: `tests/**/*.test.{ts,tsx}` 和 `app/**/*.test.{ts,tsx}`
- E2E 测试: `tests/*.spec.ts`（Playwright）
- 测试覆盖率阈值 80%（仅覆盖非 API、非数据库依赖文件）
- 组件测试使用 `@testing-library/react` + `jsdom` 环境

## CI/CD 流水线

`.github/workflows/ci-cd.yml`: test → build → docker → deploy

- test: lint + vitest（失败会阻断后续）
- build: Next.js 构建
- docker: 推送到 GHCR
- deploy: SSH 到生产服务器拉取镜像并重启
