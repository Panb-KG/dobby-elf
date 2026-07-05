import type { User, Spell } from '../../types';
import type { UseChatReturn } from '../../hooks/useChat';
import type { UseCoursesReturn } from '../../hooks/useCourses';
import type { UseHomeworkReturn } from '../../hooks/useHomework';
import type { UseAchievementsReturn } from '../../hooks/useAchievements';
import type { UseFocusReturn } from '../../hooks/useFocus';

export interface MagicLayoutProps {
  user: User;
  onLogout: () => void;
  activeTab: 'chat' | 'course' | 'homework' | 'achievements' | 'focus';
  onTabChange: (tab: 'chat' | 'course' | 'homework' | 'achievements' | 'focus') => void;
  isRightSidebarOpen: boolean;
  onRightSidebarChange: (open: boolean) => void;
  sidebarContentType: 'schedule' | 'exercise' | 'image' | 'achievements' | 'focus' | 'content' | 'none';
  onSidebarContentTypeChange: (type: 'schedule' | 'exercise' | 'image' | 'achievements' | 'focus' | 'content') => void;
  chat: UseChatReturn;
  shortcuts: Spell[];
  course: UseCoursesReturn;
  homework: UseHomeworkReturn;
  achievements: UseAchievementsReturn;
  focus: UseFocusReturn;
  streak: number;
  onStreak: () => void;
}
