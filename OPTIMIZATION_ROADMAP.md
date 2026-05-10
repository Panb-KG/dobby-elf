# Dobby-elf 优化路线图

> 更新时间：2026-05-05 21:30 GMT+8

---

## ✅ 第一轮优化（2026-05-03）— 全部完成

- ✅ #1 MagicLayout 瘦身（抽离 hooks）
- ✅ #2 流式聊天性能优化（ref 累积 + 80ms 批量更新）
- ✅ #3 MagicApp.tsx 归档
- ✅ #4 统一控制台日志
- ✅ #5 消除 any 类型
- ✅ #6 移动端底部导航图标修正
- ✅ #7 白噪音音频源替换
- ✅ #8 Error Boundary
- ✅ #9 代码分割（Dynamic Import）
- ✅ #10 补充测试（22 个测试用例）

---

## ✅ 第二轮优化（2026-05-05）— 全部完成

### N1 — MagicLayout 瘦身到 426 行 🔴
- 抽离 `RightSidebarContent.tsx`（右侧边栏全部内容）
- MagicLayout 只负责布局框架 + props 传递
- 从 1078 行 → 426 行

### N2 — 认证安全加固 🔴
- 登录接口速率限制：10 次/分钟
- 注册接口速率限制：5 次/分钟
- JWT Secret 强制环境变量，移除硬编码 `'your-secret-key'`
- 注册密码最低要求从 4 字符提升到 6 字符

### N3 — 聊天存储防抖 🔴
- `useChat` 自动保存加 500ms debounce
- 避免流式更新时每秒写入 10+ 次 LocalStorage

### N4 — 消除 chat route 中的 any 类型 🟡
- 定义 `ChatMessage`、`ChatApiError` 接口
- 替换所有 `any` 为具体类型

### N5 — 数据库单例加固 🟡
- 使用 `globalThis` 缓存 DB 实例
- 防止 HMR 和热更新时单例丢失

### N7 — 核心 API 输入校验 🟡
- Chat API 消息数量限制（最多 50 条）
- 单条消息长度限制（最多 8000 字符）

### N9 — 安全头 middleware 🟢
- 将 `middleware.ts` 移到项目根目录（Next.js 要求）
- 安全头、CORS、速率限制正式生效

### N10 — 移除无用语音输入按钮 🔵
- `ChatModule` 移除未实现的 Mic 按钮

---

## ✅ 第三轮优化（2026-05-08）— S1 完成

### S1 — Admin 鉴权安全加固 🔴
- 修复 `admin/auth` 路由 JWT 硬编码 fallback（两处 `|| 'dobi-admin-secret-key-2026'`）
- 新建 `app/lib/admin-auth.ts` 统一鉴权工具
- 给 6 个 admin API 全部加鉴权：monitoring、audit、tasks、users、settings、api-records
- middleware.ts 增加 admin 路由 defense-in-depth 检查
- 之前普通用户 API 已有鉴权，admin API 完全裸奔，现在补齐

## 📋 未来可考虑

| # | 项目 | 优先级 |
|---|------|--------|
| S2 | 消除剩余 any 类型（catch + params） | 🟡 |
| S3 | API 路由测试（auth/courses/homework/chat） | 🟡 |
| S4 | 日志异步队列化 | 🟡 |
| S5 | 大文件拆分（RightSidebar/LP/db） | 🟢 |
| S6 | 统一 console 调用 | 🟢 |
| S7 | 输入校验中间件 | 🟢 |
| S8 | PWA 完善 | 🟢 |
| S9 | 数据同步策略 | 🔵 |
| S10 | 错误监控（Sentry） | 🔵 |

---

## 执行记录

| 批次 | 项目 | 状态 | 日期 |
|------|------|------|------|
| 第一轮 | #1 #2 #3 | ✅ | 2026-05-03 |
| 第一轮 | #4 #5 #6 #7 | ✅ | 2026-05-03 |
| 第一轮 | #8 #9 #10 | ✅ | 2026-05-03 |
| 第二轮 | N1 N2 N3 N4 N5 N7 N9 N10 | ✅ | 2026-05-05 |
| 第三轮 | S1 Admin 鉴权加固 | ✅ | 2026-05-08 |
