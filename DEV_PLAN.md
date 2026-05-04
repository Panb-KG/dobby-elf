# Dobby-elf 开发计划

> **注意：** 本文档仅针对 GitHub/Panb-KG/dobby-elf 项目（Next.js 版魔法小课桌）。与 Panb-KG/Dobi-ai（Vite/React 版）是独立项目。

---

## 📋 项目现状

- **技术栈：** Next.js 16 + TypeScript + SQLite + Tailwind CSS
- **核心功能：** 儿童 AI 学习助手（聊天、课程表、作业、成就、专注模式）
- **部署：** Zeabur（Docker）
- **AI：** 阿里 DashScope / Token Plan（Qwen 模型）
- **当前状态：** 功能基本完整，安全、架构、测试方面需要完善

---

## 🔴 P0 — 安全基础（立即修复）

### #1 修复 JWT 密钥硬编码

**问题：** `app/api/auth/login/route.ts` 中 `process.env.JWT_SECRET || 'your-secret-key'`，生产环境 token 可被伪造。

**方案：**
- 移除所有 fallback 默认值
- 启动时检查 `JWT_SECRET` 环境变量，缺失则报错退出
- 生成强随机密钥（32 位+），更新 `.env.example`
- 添加密钥强度验证（长度、字符集）

**涉及文件：**
- `app/api/auth/login/route.ts`
- `app/api/auth/register/route.ts`
- `app/services/auth.ts`
- `.env.example`
- 新建 `app/lib/auth.ts`（统一 JWT 工具）

**验收标准：**
- [ ] 无 JWT_SECRET 环境变量时服务启动失败
- [ ] 所有 token 签名使用强随机密钥
- [ ] `.env.example` 更新为强密钥示例

---

### #2 修复中间件位置，启用安全头

**问题：** `app/api/middleware.ts` 不是 Next.js 标准位置，速率限制、CSP、安全头全部未生效。

**方案：**
- 将 `app/api/middleware.ts` 移至项目根目录 `middleware.ts`
- 修正 matcher 配置，覆盖 `/api/:path*`
- 添加 IP 黑名单/白名单机制
- 速率限制改为 per-endpoint 配置（聊天接口更宽松）

**涉及文件：**
- 移动 `app/api/middleware.ts` → `middleware.ts`
- 更新中间件逻辑

**验收标准：**
- [ ] 所有 API 响应包含安全头
- [ ] 速率限制生效（超过限制返回 429）
- [ ] OPTIONS 预检请求正确处理

---

### #3 给 API 路由加 JWT 鉴权

**问题：** `/api/courses`、`/api/homework`、`/api/users` 等读写接口没有验证 JWT token，任何人可直接操作任意用户数据。

**方案：**
- 新建 `app/lib/auth.ts`：统一 JWT 签发、验证、用户提取
- 新建 `app/lib/api-middleware.ts`：API 鉴权中间件
- 所有需要登录的 API route 调用鉴权
- 公开接口（登录、注册、健康检查）排除

**涉及文件：**
- 新建 `app/lib/auth.ts`
- 新建 `app/lib/api-middleware.ts`
- 修改所有 `/api/` route（courses、homework、users、achievements、focus、chat 等）

**验收标准：**
- [ ] 未登录时调用受保护 API 返回 401
- [ ] 登录后正常访问
- [ ] 过期 token 返回 401
- [ ] 伪造 token 返回 401
- [ ] 公开接口（登录、注册、健康检查）不受影响

---

## 🟡 P1 — 架构优化（本周完成）

### #4 拆分 MagicLayout.tsx（1068 行）

**问题：** 单个文件 1068 行，包含 3 个内联子组件，难以维护。

**方案：**
- 提取 `CourseSidebarContent` → `app/components/layout/CourseSidebar.tsx`
- 提取 `ExerciseSidebarContent` → `app/components/layout/ExerciseSidebar.tsx`
- 提取 `FocusSidebarContent` → `app/components/layout/FocusSidebar.tsx`
- 提取 `AchievementsSidebarContent` → `app/components/layout/AchievementsSidebar.tsx`
- MagicLayout 保留布局和状态管理

**验收标准：**
- [ ] MagicLayout.tsx 降至 400 行以内
- [ ] 功能完全不变
- [ ] 新增组件测试

---

### #5 统一数据同步策略

**问题：** 课程、作业、成就数据同时存在 localStorage 和 SQLite，无同步策略，离线后数据冲突。

**方案：**
- 明确数据流向：SQLite 为唯一数据源，localStorage 为缓存
- 实现 `useSync` hook 的完整逻辑（当前为空壳）
- 离线时写入 localStorage，上线后同步到服务器
- 冲突解决策略：服务端优先 / 时间戳优先

**涉及文件：**
- `app/hooks/useSync.ts`
- `app/lib/offline-sync.ts`
- 相关 hook（useCourses、useHomework 等）

**验收标准：**
- [ ] 离线操作可恢复
- [ ] 上线后自动同步
- [ ] 冲突有明确解决策略

---

### #6 补充 API 路由测试

**问题：** 当前只有组件测试，API 路由完全无测试覆盖。

**方案：**
- 使用 `vitest` + `supertest` 或 Next.js test utils
- 覆盖核心 API：auth、courses、homework、chat
- 包含：正常流程、边界条件、错误处理

**验收标准：**
- [ ] API 测试覆盖率达到 60%
- [ ] CI 中自动运行

---

## 🟢 P2 — 功能完善（持续优化）

### #7 PWA 完善

- [ ] 注册 Service Worker（`app/layout.tsx` 调用 `registerSW()`）
- [ ] 补充 `manifest.json`（name、icons、theme_color）
- [ ] 生成 PWA icons（192x192、512x512）
- [ ] 测试离线访问

### #8 访问性（a11y）

- [ ] 所有交互元素添加 aria 标签
- [ ] 键盘导航支持（Tab、Enter、Escape）
- [ ] 焦点管理（模态框打开/关闭时）
- [ ] 颜色对比度检查（WCAG AA）
- [ ] 屏幕阅读器测试

### #9 主题/字体大小切换

- [ ] 护眼模式（暖色背景）
- [ ] 大字体模式（适合儿童）
- [ ] 设置持久化

### #10 聊天搜索/历史浏览

- [ ] 聊天记录按日期分组
- [ ] 搜索功能（关键词匹配）
- [ ] 分页加载历史消息

---

## 🔵 P3 — 性能优化

### #11 图片优化

- [ ] 使用 `next/image` 替代原生 `<img>`
- [ ] 配置图片域名白名单
- [ ] 懒加载非首屏图片

### #12 API 缓存层

- [ ] 课程表、成就等数据添加 `revalidate` 缓存
- [ ] 考虑引入 Redis（Zeabur 支持）

### #13 CSS 优化

- [ ] Tailwind 配置优化（移除未使用样式）
- [ ] 关键 CSS 内联
- [ ] 非关键样式异步加载

---

## 🟣 P4 — 测试与 CI/CD

### #14 测试覆盖提升

- [ ] 组件测试覆盖率 > 70%
- [ ] Hook 测试覆盖率 > 80%
- [ ] API 测试覆盖率 > 60%
- [ ] 集成测试（用户注册→登录→使用）
- [ ] E2E 测试（Playwright）

### #15 CI/CD 完善

- [ ] GitHub Actions 添加测试步骤
- [ ] 测试通过后才部署
- [ ] 代码质量检查（lint、type check）
- [ ] 覆盖率报告

---

## 📝 技术债务清单

| 项目 | 优先级 | 状态 |
|------|--------|------|
| JWT 密钥硬编码 | P0 | 待修复 |
| 中间件位置错误 | P0 | 待修复 |
| API 无鉴权 | P0 | 待修复 |
| MagicLayout 臃肿 | P1 | 待拆分 |
| 数据同步缺失 | P1 | 待实现 |
| API 测试缺失 | P1 | 待补充 |
| PWA 不完整 | P2 | 待完善 |
| 访问性不足 | P2 | 待改进 |
| 图片未优化 | P3 | 待优化 |
| 测试覆盖率低 | P4 | 待提升 |

---

## 📅 里程碑

- **P0 完成：** 安全基础稳固，可安全部署
- **P1 完成：** 架构清晰，可维护性提升
- **P2 完成：** 功能完善，用户体验提升
- **P3 完成：** 性能优化，加载速度提升
- **P4 完成：** 质量保障，持续集成

---

*最后更新：2026-05-04*
