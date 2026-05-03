# Dobby-elf 优化路线图

> 更新时间：2026-05-03 19:05 GMT+8

---

## ✅ 已完成

- ✅ #1 MagicLayout 瘦身（抽离 useAudioPlayer, useSmartReminder, useUserData, useExercise）
- ✅ #2 流式聊天性能优化（ref 累积 + 80ms 批量更新）
- ✅ #3 MagicApp.tsx 归档到 app/archive/
- ✅ #4 统一控制台日志（创建 app/lib/console.ts，替换 132 处 console 调用）
- ✅ #5 消除 any 类型（useChat.ts, LoginPage.tsx, CourseModule.tsx, MagicLayout.tsx）
- ✅ #6 移动端底部导航图标修正（「我的」tab 改为 User 图标）
- ✅ #7 白噪音音频源替换（使用 Pixabay CDN）

---

## 🔴 P0 — 性能与架构

### 1. MagicLayout.tsx 瘦身（1068 行 → 目标 <400 行）
**问题**：主组件包含白噪音音频、智能提醒、用户数据管理、成就/练习等内联逻辑。
**方案**：
- 抽 `useAudioPlayer` hook（白噪音音频管理）
- 抽 `useSmartReminder` hook（课程提醒逻辑）
- 抽 `useUserData` hook（积分/等级/每日任务/知识之树）
- 抽 `useExercise` hook（知识图谱/动态练习/答题流程）
- MagicLayout 只负责布局组装和 props 传递

**验收**：MagicLayout.tsx ≤ 400 行，功能完全不变。

### 2. 流式聊天性能优化
**问题**：`useChat.ts` 每收到一个 chunk 就 `setMessages`，对 50 条消息数组做全量克隆，导致频繁重渲染。
**方案**：
- 用 `useRef` 累积 streaming 文本，而非直接操作 messages 数组
- 用 `requestAnimationFrame` 或 `setTimeout` 批量更新（每 100ms 一次）
- 只更新最后一条消息的 text，不克隆整个数组
- 考虑用 `produce` (immer) 做不可变更新

**验收**：流式响应时 CPU 占用降低 50%+，UI 不卡顿。

### 3. MagicApp.tsx 归档清理
**问题**：2849 行的旧架构文件仍留在 `app/` 目录，已不再使用。
**方案**：
- 创建 `app/archive/` 目录
- 移动 `MagicApp.tsx` 到 `app/archive/MagicApp.tsx`
- 确认没有 import 引用
- 在 README 中注明归档原因

**验收**：`app/` 根目录无 MagicApp.tsx，构建无报错。

---

## 🟡 P1 — 代码质量

### 4. 清理 132 处 console.log/error
**问题**：生产环境不应有调试日志。
**方案**：
- 统一使用 `app/lib/logger.ts`
- 按 NODE_ENV 控制日志级别
- dev 环境：debug+，prod 环境：warn+

### 5. 消除 `any` 类型残留
**问题**：`useChat.ts`、`LoginPage.tsx`、`CourseModule.tsx`、`MagicLayout.tsx` 中有 `error: any`、`q: any`。
**方案**：
- 全部替换为 `unknown` + 类型守卫
- 定义 `AppError` 接口

---

## 🟡 P2 — 体验修复

### 6. 移动端底部导航图标修正
**问题**：「我的」tab 用了 `MessageSquare`（和「对话」一样）。
**方案**：改用 `User` 或 `CircleUser`。

### 7. 白噪音音频源替换
**问题**：`soundjay.com` URL 可能失效或跨域。
**方案**：
- 使用可靠的免费音频 CDN（如 pixabay、freesound）
- 或打包本地静态资源
- 添加加载失败 fallback

---

## 🟢 P3 — 工程化

### 8. 添加 Error Boundary
**问题**：无错误边界，任何组件崩溃导致白屏。
**方案**：
- 创建 `app/components/ui/ErrorBoundary.tsx`
- layout.tsx 中包裹根组件
- 显示友好的错误页面

### 9. 代码分割（Dynamic Import）
**问题**：所有组件一次性加载。
**方案**：
- 右侧边栏模块（成就/专注/练习）用 `next/dynamic` 懒加载
- 登录页用 `next/dynamic`
- 测量首屏 LCP 改善

### 10. 补充测试
**问题**：vitest/playwright 已配置但测试为空。
**方案**：
- 先补 hooks 单元测试（useChat、useCourses、useAuth、useLocalStorage）
- 补 storage.ts 测试
- 关键组件快照测试

---

## 执行顺序

| 批次 | 项目 | 状态 |
|------|------|------|
| 第一批 | #1 #2 #3 | ✅ 完成 |
| 第二批 | #4 #5 #6 #7 | ✅ 完成 |
| 第三批 | #8 #9 #10 | ⏳ 待执行 |
