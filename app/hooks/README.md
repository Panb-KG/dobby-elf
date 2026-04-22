# Hooks 目录

自定义 React Hooks，封装业务逻辑，供组件层使用。

## 设计原则

1. **单一职责** - 每个 Hook 只负责一个领域
2. **可复用** - 不依赖具体 UI，可在多个组件中使用
3. **类型安全** - 完整的 TypeScript 类型定义
4. **易于测试** - 逻辑与 UI 分离，便于单元测试

---

## 现有 Hooks（Phase 1 完成）

### useChat ✅
聊天功能 Hook，管理消息状态和 API 调用。

**文件**: `useChat.ts`

**API**:
- `messages: Message[]` - 消息列表
- `input: string` - 输入框内容
- `isLoading: boolean` - 加载状态
- `sendMessage: (text, image?) => Promise<void>` - 发送消息
- `handleInputChange: (value) => void` - 处理输入变化
- `handleShortcut: (prompt) => Promise<void>` - 快捷指令

**配置**:
```ts
useChat({ initialMessage: '自定义欢迎语' })
```

---

### useCourses ✅
课程表管理 Hook，管理课程数据和视图状态。

**文件**: `useCourses.ts`

**API**:
- `courses: Course[]` - 课程列表
- `scheduleView: 'week' | 'day'` - 视图模式
- `selectedDay: string` - 选中日期
- `addCourse: () => void` - 添加课程
- `removeCourse: (index) => void` - 删除课程

**配置**:
```ts
useCourses({ 
  initialCourses: [...],
  defaultView: 'week'
})
```

---

### useAuth ✅
用户认证 Hook，管理登录状态和认证流程。

**文件**: `useAuth.ts`

**API**:
- `user: User | null` - 当前用户
- `isAuthReady: boolean` - 认证初始化完成
- `login: (username, password) => Promise<void>` - 登录
- `register: (username, password, confirm) => Promise<void>` - 注册
- `logout: () => void` - 登出

---

### useHomework ✅
作业管理 Hook，管理作业任务和状态。

**文件**: `useHomework.ts`

**API**:
- `tasks: HomeworkTask[]` - 作业列表（已筛选）
- `filter: HomeworkStatus | 'all'` - 当前筛选状态
- `addTask: (task) => void` - 添加作业
- `updateTaskStatus: (id, status) => void` - 更新状态
- `deleteTask: (id) => void` - 删除作业
- `getOverdueTasks: () => HomeworkTask[]` - 获取逾期作业

---

### useAchievements ✅
成就系统 Hook，管理成就和积分。

**文件**: `useAchievements.ts`

**API**:
- `achievements: Achievement[]` - 成就列表
- `totalPoints: number` - 总积分
- `userLevel: string` - 用户等级
- `addAchievement: (achievement) => void` - 添加成就
- `getAchievementsByType: (type) => Achievement[]` - 按类型筛选

---

### useFocus ✅
专注模式 Hook，番茄钟和白噪音。

**文件**: `useFocus.ts`

**API**:
- `isFocusing: boolean` - 是否正在专注
- `elapsedTime: number` - 已用时间（秒）
- `startFocus: (minutes) => void` - 开始专注
- `pauseFocus: () => void` - 暂停
- `resumeFocus: () => void` - 恢复
- `setWhiteNoise: (type) => void` - 设置白噪音

**配置**:
```ts
useFocus({ 
  defaultDuration: 25,  // 分钟
  autoSave: true 
})
```

---

## 待创建 Hooks

- [ ] `useExercise` - 互动练习

---

## 测试

每个 Hook 都应该有对应的测试文件：

```
hooks/
├── useChat.ts
├── useChat.test.ts
├── useCourses.ts
├── useCourses.test.ts
└── ...
```

运行测试：
```bash
npm test
```

---

*最后更新：2026-04-22 11:30 | Phase 1 进度：60%*
