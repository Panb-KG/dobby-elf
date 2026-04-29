# Components 目录

可复用的 React 组件，负责 UI 渲染和用户交互。

## 设计原则

1. **无状态优先** - 组件本身不管理状态，通过 props 接收
2. **职责单一** - 每个组件只负责一个 UI 模块
3. **类型安全** - 完整的 TypeScript Props 类型定义
4. **可组合性** - 组件可自由组合，构建复杂界面

---

## 组件列表

### ChatModule ✅
聊天模块组件，展示消息列表和输入框。

**路径**: `chat/ChatModule.tsx`

**Props**:
```ts
interface ChatModuleProps {
  messages: Message[];
  input: string;
  isLoading: boolean;
  onSend: (text: string) => void;
  onInputChange: (value: string) => void;
  onShortcut: (prompt: string) => void;
  shortcuts: Array<{
    id: string;
    name: string;
    icon: React.ElementType;
    prompt: string;
  }>;
}
```

**使用示例**:
```tsx
import { ChatModule } from './chat/ChatModule';
import { useChat } from '../hooks/useChat';
import { SPELLS } from '../../Global';

function ChatPage() {
  const { messages, input, isLoading, sendMessage, handleInputChange, handleShortcut } = useChat();
  
  return (
    <ChatModule
      messages={messages}
      input={input}
      isLoading={isLoading}
      onSend={sendMessage}
      onInputChange={handleInputChange}
      onShortcut={handleShortcut}
      shortcuts={SPELLS.map(s => ({ ...s, icon: getIcon(s.id) }))}
    />
  );
}
```

---

### CourseModule ✅
课程表模块组件，支持周视图/日视图切换。

**路径**: `course/CourseModule.tsx`

**Props**:
```ts
interface CourseModuleProps {
  courses: Course[];
  scheduleView: ScheduleView;
  selectedDay: string;
  isAddingCourse: boolean;
  newCourse: Omit<Course, 'id' | 'color'>;
  onScheduleViewChange: (view: ScheduleView) => void;
  onSelectedDayChange: (day: string) => void;
  onIsAddingCourseChange: (adding: boolean) => void;
  onNewCourseChange: (course: Omit<Course, 'id' | 'color'>) => void;
  onAddCourse: () => void;
  onRemoveCourse: (index: number) => void;
}
```

**使用示例**:
```tsx
import { CourseModule } from './course/CourseModule';
import { useCourses } from '../hooks/useCourses';

function CoursePage() {
  const { courses, scheduleView, addCourse, removeCourse, ... } = useCourses();
  
  return (
    <CourseModule
      courses={courses}
      scheduleView={scheduleView}
      onScheduleViewChange={setScheduleView}
      onAddCourse={addCourse}
      onRemoveCourse={removeCourse}
      {...otherProps}
    />
  );
}
```

---

### HomeworkModule ✅
作业管理模块组件。

**路径**: `homework/HomeworkModule.tsx`

**功能**:
- 作业列表展示
- 按状态筛选（待完成/进行中/已完成）
- 添加/编辑/删除作业
- 逾期提醒

---

### AchievementModule ✅
成就系统模块组件。

**路径**: `achievements/AchievementModule.tsx`

**功能**:
- 成就墙展示
- 积分和等级显示
- 成就分类筛选
- 最近成就高亮

---

### FocusModule ✅
专注模式模块组件。

**路径**: `focus/FocusModule.tsx`

**功能**:
- 番茄钟倒计时
- 白噪音选择
- 专注历史记录
- 开始/暂停/恢复控制

---

### DobiAvatar ✅
多比头像组件。

**路径**: `DobiAvatar.tsx`

**Props**:
```ts
interface DobiAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}
```

---

## 组件目录结构

```
components/
├── chat/
│   ├── ChatModule.tsx
│   └── README.md
├── course/
│   ├── CourseModule.tsx
│   └── README.md
├── homework/
│   ├── HomeworkModule.tsx
│   └── README.md
├── achievements/
│   ├── AchievementModule.tsx
│   └── README.md
├── focus/
│   ├── FocusModule.tsx
│   └── README.md
├── DobiAvatar.tsx
└── README.md (本文件)
```

---

## 组件测试

每个组件都应该有测试：

```tsx
// ChatModule.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatModule } from './ChatModule';

describe('ChatModule', () => {
  it('渲染消息列表', () => {
    const messages = [
      { role: 'user', text: 'Hello' },
      { role: 'model', text: 'Hi there!' },
    ];
    
    render(
      <ChatModule
        messages={messages}
        input=""
        isLoading={false}
        onSend={() => {}}
        onInputChange={() => {}}
        onShortcut={() => {}}
        shortcuts={[]}
      />
    );
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });
  
  it('发送消息', () => {
    const onSend = jest.fn();
    
    render(
      <ChatModule
        messages={[]}
        input="Test"
        isLoading={false}
        onSend={onSend}
        onInputChange={() => {}}
        onShortcut={() => {}}
        shortcuts={[]}
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /发送/i }));
    expect(onSend).toHaveBeenCalledWith('Test');
  });
});
```

---

## 样式指南

### 命名约定
- 使用 Tailwind CSS 工具类
- 自定义样式用 CSS Modules
- 玻璃态效果用 `.glass-panel` 类

### 响应式
- 移动端优先
- 断点：sm (640px), md (768px), lg (1024px)

### 动画
- 使用 `motion` from `motion/react`
- 微交互：`whileHover`, `whileTap`
- 进入动画：`initial`, `animate`

---

*最后更新：2026-04-22 12:30 | Phase 1 进度：70%*
