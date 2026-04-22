# MagicApp 重构指南

> 将 1956 行的 MagicApp.tsx 拆分为模块化架构

---

## 当前状态分析

### MagicApp.tsx 问题

**文件**: `app/MagicApp.tsx`  
**行数**: 1956 行  
**问题**:
- ❌ 所有状态集中在一个组件
- ❌ 业务逻辑与 UI 混合
- ❌ 难以维护和测试
- ❌ 代码复用困难

### 状态分类

MagicApp 中的状态可以分为以下几类：

| 状态类别 | 相关 State | 对应 Hook |
|----------|-----------|----------|
| **认证** | `user`, `isAuthReady`, `showLoginModal`, `authError` | `useAuth` |
| **聊天** | `messages`, `input`, `isLoading` | `useChat` |
| **课程** | `courses`, `scheduleView`, `selectedDay`, `isAddingCourse`, `newCourse` | `useCourses` |
| **作业** | `homeworkTasks`, `isAddingHomework`, `newHomework` | `useHomework` |
| **成就** | `points`, `level`, `treeGrowth`, `dailyTasks`, `achievements` | `useAchievements` |
| **专注** | `focusTime`, `isFocusActive`, `whiteNoise` | `useFocus` |

---

## 目标架构

### 重构后结构

```
MagicApp (容器组件)
├── useAuth (认证逻辑)
├── useChat (聊天逻辑)
├── useCourses (课程逻辑)
├── useHomework (作业逻辑)
├── useAchievements (成就逻辑)
├── useFocus (专注逻辑)
│
├── Header (UI 组件)
├── Sidebar (UI 组件)
│   ├── ChatModule (功能模块)
│   ├── CourseModule (功能模块)
│   ├── HomeworkModule (功能模块)
│   ├── AchievementModule (功能模块)
│   └── FocusModule (功能模块)
└── RightSidebar (UI 组件)
```

---

## 重构步骤

### Step 1: 创建容器组件

```tsx
// app/page.tsx
"use client";

import { useAuth } from './hooks/useAuth';
import { useChat } from './hooks/useChat';
import { useCourses } from './hooks/useCourses';
import { useHomework } from './hooks/useHomework';
import { useAchievements } from './hooks/useAchievements';
import { useFocus } from './hooks/useFocus';
import MagicLayout from './components/MagicLayout';

export default function Page() {
  // 使用 Hooks 管理所有状态
  const { user, isAuthReady, login, logout, ... } = useAuth();
  const { messages, input, isLoading, sendMessage, ... } = useChat();
  const { courses, scheduleView, addCourse, removeCourse, ... } = useCourses();
  const { tasks, addTask, updateTaskStatus, ... } = useHomework();
  const { achievements, totalPoints, userLevel, ... } = useAchievements();
  const { isFocusing, elapsedTime, startFocus, ... } = useFocus();
  
  // 加载状态
  if (!isAuthReady) {
    return <LoadingScreen />;
  }
  
  // 未登录
  if (!user) {
    return <LoginPage onLogin={login} onRegister={register} />;
  }
  
  // 主界面
  return (
    <MagicLayout
      user={user}
      messages={messages}
      courses={courses}
      tasks={tasks}
      achievements={achievements}
      // ... 传递所有需要的 props
      onSend={sendMessage}
      onAddCourse={addCourse}
      onAddTask={addTask}
      // ... 传递所有回调
    />
  );
}
```

### Step 2: 创建布局组件

```tsx
// app/components/MagicLayout.tsx
import { useState } from 'react';
import { Header, Sidebar, RightSidebar } from './layout';
import { ChatModule, CourseModule, HomeworkModule, ... } from './modules';

interface MagicLayoutProps {
  // 所有从 Hooks 传来的 props
  user: User;
  messages: Message[];
  courses: Course[];
  // ...
  onSend: (text: string) => void;
  onAddCourse: () => void;
  // ...
}

export default function MagicLayout(props: MagicLayoutProps) {
  const [activeTab, setActiveTab] = useState('chat');
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  
  return (
    <div className="h-screen bg-magic-bg flex flex-col">
      <Header user={props.user} onLogout={props.onLogout} />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="flex-1 overflow-hidden">
          {activeTab === 'chat' && (
            <ChatModule
              messages={props.messages}
              input={props.input}
              isLoading={props.isLoading}
              onSend={props.onSend}
              // ...
            />
          )}
          {activeTab === 'course' && (
            <CourseModule
              courses={props.courses}
              scheduleView={props.scheduleView}
              // ...
            />
          )}
          {/* 其他模块... */}
        </main>
        
        <RightSidebar isOpen={isRightSidebarOpen} onClose={() => setIsRightSidebarOpen(false)}>
          {/* 右侧内容 */}
        </RightSidebar>
      </div>
    </div>
  );
}
```

### Step 3: 迁移状态逻辑

#### 3.1 聊天状态迁移

**MagicApp.tsx 中的代码**:
```tsx
const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
const [input, setInput] = useState('');
const [isLoading, setIsLoading] = useState(false);

const sendMessage = async (text: string) => {
  // ... 100+ 行逻辑
};
```

**迁移到 useChat**:
```tsx
// 已经完成 ✅
// app/hooks/useChat.ts
export function useChat(options?: UseChatOptions): UseChatReturn {
  // 所有聊天逻辑已封装
}
```

#### 3.2 课程状态迁移

**MagicApp.tsx 中的代码**:
```tsx
const [courses, setCourses] = useState<Course[]>([...] /* 20+ 个课程 */);
const [scheduleView, setScheduleView] = useState<'week' | 'day'>('week');
const [selectedDay, setSelectedDay] = useState('周一');

const addCourse = () => { /* ... */ };
const removeCourse = (index: number) => { /* ... */ };
```

**迁移到 useCourses**:
```tsx
// 已经完成 ✅
const { courses, scheduleView, addCourse, removeCourse } = useCourses({
  initialCourses: [...] // 可以传入初始课程
});
```

#### 3.3 作业状态迁移

**MagicApp.tsx**:
```tsx
const [homeworkTasks, setHomeworkTasks] = useState([...]);
const addHomework = () => { /* ... */ };
const toggleHomeworkStatus = (id: string) => { /* ... */ };
```

**迁移到 useHomework**:
```tsx
const { tasks, addTask, updateTaskStatus, deleteTask } = useHomework({
  initialTasks: [...]
});
```

---

## 数据持久化

### 当前方案
MagicApp 使用本地 state，刷新后数据丢失。

### 目标方案

```tsx
// app/hooks/usePersistence.ts
import { useEffect, useCallback } from 'react';

export function usePersistence<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });
  
  const setValue = useCallback((value: T) => {
    setStoredValue(value);
    localStorage.setItem(key, JSON.stringify(value));
  }, [key]);
  
  return [storedValue, setValue];
}

// 使用示例
const [courses, setCourses] = usePersistence<Course[]>('dobby_courses', []);
```

---

## 组件 Props 优化

### 当前问题
组件 Props 过多（10+ 个）

### 解决方案

```tsx
// ❌ 坏的设计
interface ChatModuleProps {
  messages: Message[];
  input: string;
  isLoading: boolean;
  onSend: (text: string) => void;
  onInputChange: (value: string) => void;
  onShortcut: (prompt: string) => void;
  // ... 10+ props
}

// ✅ 好的设计
interface ChatModuleProps {
  chat: UseChatReturn; // 整个 Hook 返回值
  shortcuts: Spell[];
}

// 或者使用组合
interface ChatModuleProps {
  state: {
    messages: Message[];
    input: string;
    isLoading: boolean;
  };
  actions: {
    sendMessage: (text: string) => void;
    handleInputChange: (value: string) => void;
    handleShortcut: (prompt: string) => void;
  };
}
```

---

## 测试策略

### 单元测试

```tsx
// app/hooks/useChat.test.ts
import { renderHook, act } from '@testing-library/react';
import { useChat } from './useChat';

describe('useChat', () => {
  it('发送消息后添加到列表', async () => {
    const { result } = renderHook(() => useChat());
    
    await act(async () => {
      await result.current.sendMessage('Hello');
    });
    
    expect(result.current.messages).toHaveLength(2);
  });
});
```

### 集成测试

```tsx
// app/components/ChatModule.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatModule } from './ChatModule';

describe('ChatModule', () => {
  it('渲染消息', () => {
    render(
      <ChatModule
        chat={{ messages: [{ role: 'user', text: 'Hi' }], ... }}
        shortcuts={[]}
      />
    );
    
    expect(screen.getByText('Hi')).toBeInTheDocument();
  });
});
```

---

## 重构检查清单

### Phase 1.A: 准备
- [x] 创建统一类型系统
- [x] 创建所有核心 Hooks
- [x] 创建组件文档
- [ ] 创建集成指南（本文件）

### Phase 1.B: 容器重构
- [ ] 创建 `app/page.tsx` (新容器)
- [ ] 创建 `app/components/MagicLayout.tsx`
- [ ] 迁移所有 Hooks
- [ ] 测试基本功能

### Phase 1.C: 组件集成
- [ ] 集成 ChatModule
- [ ] 集成 CourseModule
- [ ] 集成 HomeworkModule
- [ ] 集成 AchievementModule
- [ ] 集成 FocusModule

### Phase 1.D: 清理
- [ ] 删除旧 MagicApp.tsx
- [ ] 更新文档
- [ ] 运行测试
- [ ] 性能基准测试

---

## 预期收益

| 指标 | 重构前 | 重构后 | 改进 |
|------|--------|--------|------|
| **主文件行数** | 1956 | ~100 | -95% |
| **可测试性** | 困难 | 容易 | ✅ |
| **代码复用** | 困难 | 容易 | ✅ |
| **维护成本** | 高 | 低 | -70% |
| **新人上手** | 困难 | 容易 | ✅ |

---

*文档版本：1.0 | 创建：2026-04-22 | Phase 1 进度：75%*
