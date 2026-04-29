# Dobi-elf 开发原则

> 🧦 工程哲学与开发准则 | 版本：1.0 | 创建：2026-04-22

**本文档与 PRD.md、DEVELOPMENT_PLAN.md、Global.ts 并列为核心主导文件**

---

## 📜 核心原则

### 1. 用户第一 (Users First)
- **目标用户是小学生** - 所有设计决策围绕 6-12 岁儿童的认知特点
- **魔法主题贯穿始终** - 用趣味性和沉浸感激发学习兴趣
- **简洁优于复杂** - 避免过度功能，保持界面清晰
- **即时反馈** - 每个操作都有明确的视觉/听觉反馈

### 2. 代码质量 (Code Quality)
- **TypeScript 严格模式** - 类型安全是底线，不用 `any`
- **组件单一职责** - 每个组件只做一件事，做好一件事
- **Hooks 封装逻辑** - 业务逻辑进 Hooks，组件只负责渲染
- **测试覆盖关键路径** - 核心功能必须有测试保护

### 3. 性能优先 (Performance First)
- **首屏加载 < 2 秒** - 懒加载、代码分割、图片优化
- **避免不必要的重渲染** - 合理使用 `React.memo`、`useMemo`、`useCallback`
- **数据库查询优化** - SQLite 索引、预编译语句
- **监控性能指标** - LCP、FID、CLS 持续追踪

### 4. 可维护性 (Maintainability)
- **约定优于配置** - 统一命名、目录结构、代码风格
- **文档即代码** - 代码变更时同步更新文档
- **小步快跑** - 小提交、频繁提交、清晰的提交信息
- **技术债务可视化** - 用 TODO 注释标记，定期清理

---

## 🏗️ 架构模式

### MagicApp 架构

```
┌─────────────────────────────────────────────────────────┐
│                    MagicApp (主容器)                      │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  ChatModule  │  │ CourseModule │  │ HomeworkMod  │  │
│  │   (聊天)     │  │   (课程)     │  │   (作业)     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │ Achievement  │  │  FocusModule │                     │
│  │   (成就)     │  │   (专注)     │                     │
│  └──────────────┘  └──────────────┘                     │
├─────────────────────────────────────────────────────────┤
│                    Hooks 层                               │
│  useChat | useCourses | useHomework | useFocus          │
├─────────────────────────────────────────────────────────┤
│                    API 层                                 │
│  /api/chat | /api/courses | /api/homework | /api/image  │
├─────────────────────────────────────────────────────────┤
│                    数据层                                 │
│  SQLite (better-sqlite3) + 本地存储                      │
└─────────────────────────────────────────────────────────┘
```

### 分层职责

| 层级 | 职责 | 文件位置 |
|------|------|----------|
| **容器层** | 状态协调、模块切换 | `app/page.tsx` |
| **组件层** | UI 渲染、用户交互 | `app/components/*/` |
| **Hooks 层** | 业务逻辑、API 调用 | `app/hooks/` |
| **API 层** | 请求处理、数据验证 | `app/api/` |
| **数据层** | 持久化存储、CRUD | `data/` + `app/lib/db/` |

---

## 📐 设计原则

### 1. 组件设计

```typescript
// ✅ 好的组件：职责单一、props 清晰
interface ChatModuleProps {
  messages: ChatMessage[];
  onSend: (content: string) => void;
  isLoading: boolean;
}

export function ChatModule({ messages, onSend, isLoading }: ChatModuleProps) {
  // 只负责聊天 UI 渲染
}

// ❌ 坏的组件：职责混杂、props 过多
interface BadProps {
  // 20+ 个 props...
}
```

### 2. Hooks 设计

```typescript
// ✅ 好的 Hook：专注单一领域、可复用
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const sendMessage = async (content: string) => {
    // 调用 API、更新状态、错误处理
  };
  
  return { messages, isLoading, sendMessage };
}

// ❌ 坏的 Hook：包罗万象、难以测试
export function useEverything() {
  // 聊天 + 课程 + 作业 + 成就... 全在一起
}
```

### 3. API 设计

```typescript
// ✅ RESTful 风格、统一响应格式
GET    /api/courses          // 获取课程列表
POST   /api/courses          // 创建课程
GET    /api/courses/:id      // 获取单个课程
PUT    /api/courses/:id      // 更新课程
DELETE /api/courses/:id      // 删除课程

// 统一响应格式
{
  success: true,
  data: { ... },
  error: null
}
```

---

## 🔧 工程规范

### 1. 文件命名

```
✅ 正确：
- ChatModule.tsx        (组件 PascalCase)
- useChat.ts            (Hooks camelCase + use 前缀)
- chat.types.ts         (类型 领域 + .types)
- chat.test.ts          (测试 领域 + .test)
- utils.ts              (工具 小写)

❌ 错误：
- chatModule.tsx        (组件首字母小写)
- ChatHook.ts           (Hook 命名不规范)
- types.ts              (太泛，不知道是谁的类型)
```

### 2. 目录结构

```
dobi-elf/
├── app/
│   ├── api/              # API 路由
│   │   ├── chat/
│   │   ├── courses/
│   │   └── auth/
│   ├── components/       # 可复用组件
│   │   ├── chat/
│   │   ├── course/
│   │   └── ui/           # 基础 UI 组件
│   ├── hooks/            # 自定义 Hooks
│   ├── types/            # TypeScript 类型
│   ├── lib/              # 工具函数
│   └── globals.css       # 全局样式
├── data/                 # 数据库文件
├── memory/               # Wiki 记忆系统
├── tests/                # 测试文件
├── PRD.md                # 产品需求
├── DEVELOPMENT_PLAN.md   # 开发计划
├── ENGINEERING-PRINCIPLES.md  # 开发原则 (本文件)
└── Global.ts             # 全局配置
```

### 3. 提交规范

```bash
# 格式：<type>(<scope>): <subject>

# 类型说明
feat:     新功能
fix:      修复 bug
docs:     文档更新
style:    代码格式 (不影响功能)
refactor: 重构
test:     测试
chore:    构建/工具/配置

# 示例
feat(chat): 添加消息快捷指令
fix(course): 修复课程颜色冲突
docs: 更新开发原则文档
refactor(hooks): 提取 useChat 逻辑
test(chat): 添加 ChatModule 单元测试
```

### 4. 代码审查清单

提交前自检：
- [ ] TypeScript 无错误
- [ ] ESLint 无警告
- [ ] 测试通过
- [ ] 组件有 PropTypes/类型定义
- [ ] 关键逻辑有注释
- [ ] 无 console.log (调试用除外)
- [ ] 无硬编码字符串 (提取到 Global.ts 或 i18n)

---

## 🧪 测试策略

### 测试金字塔

```
           /\
          /  \
         / E2E \        (10%) - Playwright
        /______\
       /        \
      / Integration\    (30%) - 组件集成测试
     /______________\
    /                \
   /    Unit Tests    \  (60%) - 单元测试
  /____________________\
```

### 测试优先级

| 优先级 | 测试对象 | 工具 |
|--------|----------|------|
| 🔴 高 | API 端点、核心 Hooks | Vitest |
| 🟡 中 | 组件渲染、用户交互 | Testing Library |
| 🟢 低 | 工具函数、样式 | Vitest + CSS Modules |

### 测试示例

```typescript
// useChat.test.ts
import { renderHook, act } from '@testing-library/react';
import { useChat } from './useChat';

describe('useChat', () => {
  it('发送消息后添加到列表', async () => {
    const { result } = renderHook(() => useChat());
    
    await act(async () => {
      await result.current.sendMessage('你好');
    });
    
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('你好');
  });
});
```

---

## 📊 性能指标

### 目标值

| 指标 | 目标 | 测量方式 |
|------|------|----------|
| **FCP** (首次内容绘制) | < 1.5s | Lighthouse |
| **LCP** (最大内容绘制) | < 2.5s | Lighthouse |
| **FID** (首次输入延迟) | < 100ms | Chrome DevTools |
| **CLS** (累积布局偏移) | < 0.1 | Lighthouse |
| **TTI** (可交互时间) | < 3.5s | Lighthouse |

### 优化策略

1. **代码分割** - 按路由、按组件懒加载
2. **图片优化** - WebP 格式、懒加载、适当尺寸
3. **缓存策略** - SWR/React Query、Service Worker
4. **数据库优化** - 索引、预编译、批量操作

---

## 🔒 安全准则

### 1. 认证安全
- ✅ 密码用 bcrypt 加密 (salt rounds ≥ 10)
- ✅ JWT 密钥存储在环境变量
- ✅ Token 设置合理过期时间
- ✅ 敏感操作需要重新验证

### 2. 数据安全
- ✅ SQL 注入防护 (预编译语句)
- ✅ XSS 防护 (转义用户输入)
- ✅ CSRF 防护 (SameSite Cookie)
- ✅ 输入验证 (Zod/Joi)

### 3. API 安全
- ✅ 速率限制 (rate-limit)
- ✅ 错误信息不泄露敏感数据
- ✅ CORS 配置正确
- ✅ HTTPS 强制

---

## 📚 文档规范

### 1. 代码注释

```typescript
// ✅ 好的注释：解释为什么，不是做什么
// 使用防抖避免频繁 API 调用 (用户输入时)
const debouncedSearch = debounce(search, 300);

// ❌ 坏的注释：重复代码
// 设置 isLoading 为 true
setIsLoading(true);
```

### 2. README 规范

每个组件/模块必须有 README.md：
```markdown
# ComponentName

描述组件用途

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|

## 使用示例

```tsx
<ComponentName prop="value" />
```
```

### 3. 变更日志

更新 CHANGELOG.md：
```markdown
## [1.0.0] - 2026-04-22

### Added
- 聊天功能
- 课程表管理

### Changed
- 优化性能

### Fixed
- 修复登录 bug
```

---

## 🎯 决策记录 (ADR)

### ADR-001: 选择 Next.js 12 而非 14

**日期**: 2026-04-22  
**状态**: 已采纳  
**决策**: 使用 Next.js 12.3.4 (Node.js 14 兼容)

**原因**:
- 部署环境限制 (Node.js 14.15.2)
- Next.js 14 需要 Node.js 18+
- Next.js 12 功能足够，稳定性好

**后果**:
- 无法使用最新的 App Router 特性
- 需要手动配置部分功能

---

### ADR-002: 选择 SQLite 而非 PostgreSQL

**日期**: 2026-04-22  
**状态**: 已采纳  
**决策**: 使用 SQLite (better-sqlite3)

**原因**:
- 单用户应用，无需并发
- 零配置，部署简单
- 性能足够 (本地存储)

**后果**:
- 不支持多用户并发
- 数据备份需要手动处理

---

## 🔄 持续改进

### 每周回顾
- [ ] 代码审查问题统计
- [ ] 性能指标变化
- [ ] 技术债务清理进度
- [ ] 文档更新情况

### 每月优化
- [ ] 依赖更新检查
- [ ] 安全漏洞扫描
- [ ] 重构计划制定
- [ ] 用户反馈收集

---

## 📖 相关文档

- [PRD.md](./PRD.md) - 产品需求文档
- [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) - 开发计划
- [Global.ts](./Global.ts) - 全局配置
- [DEPLOYMENT_UBUNTU.md](./DEPLOYMENT_UBUNTU.md) - 部署指南

---

*最后更新：2026-04-22 09:00 | 版本：1.0 | 状态：活跃*
