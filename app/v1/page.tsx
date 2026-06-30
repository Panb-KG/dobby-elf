"use client";

/**
 * Dobi-elf 主页面 - 儿童友好版
 * 
 * 设计理念：
 * - 打开应用首先看到"今日冒险"卡片
 * - 简洁、鼓励、有趣
 * - 快速行动按钮
 * - 聊天是核心，但日常任务一目了然
 */

import { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { useCourses } from '@/hooks/useCourses';
import { useHomework } from '@/hooks/useHomework';
import { useAchievements } from '@/hooks/useAchievements';
import { useFocus } from '@/hooks/useFocus';
import { SPELLS } from '@/lib/Global';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { PWAProvider } from '@/components/PWAProvider';

// 代码分割：懒加载重组件
const MagicLayout = dynamic(() => import('@/components/MagicLayout'), {
  loading: () => <LoadingScreen />,
  ssr: false,
});
const LoginPage = dynamic(() => import('@/components/auth/LoginPage'), {
  loading: () => <LoadingScreen />,
  ssr: false,
});

export default function Page() {
  // ========== 认证状态 ==========
  const {
    user,
    isAuthReady,
    showLoginModal,
    showRegisterModal,
    authError,
    login,
    childLogin,
    register,
    logout,
    setShowLoginModal,
    setShowRegisterModal,
  } = useAuth();

  // ========== 聊天状态 ==========
  const chat = useChat();

  // ========== 课程状态 ==========
  const course = useCourses({ userId: user?.id });

  // ========== 作业状态 ==========
  const homework = useHomework();

  // ========== 成就状态 ==========
  const achievements = useAchievements({ user });

  // ========== 专注状态 ==========
  const focus = useFocus({ defaultDuration: 25, autoSave: true });

  // ========== UI 状态 ==========
  const [activeTab, setActiveTab] = useState<'chat' | 'course' | 'homework' | 'achievements' | 'focus'>('chat');
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [sidebarContentType, setSidebarContentType] = useState<'schedule' | 'exercise' | 'image' | 'achievements' | 'focus' | 'content' | 'none'>('none');

  // ========== 连续打卡天数 ==========
  const [streak, setStreak] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dobi_streak');
      if (saved) {
        const data = JSON.parse(saved);
        const lastDate = new Date(data.date);
        const today = new Date();
        const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return data.count; // 今天已经打卡
        if (diffDays === 1) return data.count; // 昨天打卡，今天继续
        return 0; // 断了，重新开始
      }
    }
    return 0;
  });

  // 打卡
  const doStreak = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem('dobi_streak', JSON.stringify({
      date: today,
      count: newStreak,
    }));
  }, [streak]);

  // ========== 加载状态 ==========
  if (!isAuthReady) {
    return <LoadingScreen />;
  }

  // ========== 未登录 ==========
  if (!user) {
    return (
      <LoginPage
        showLogin={showLoginModal}
        showRegister={showRegisterModal}
        error={authError}
        onLogin={login}
        onRegister={register}
        onChildLogin={childLogin}
        onCloseLogin={() => setShowLoginModal(false)}
        onCloseRegister={() => setShowRegisterModal(false)}
      />
    );
  }

  // ========== 主界面 ==========
  return (
    <PWAProvider>
      <MagicLayout
        user={user}
        onLogout={logout}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isRightSidebarOpen={isRightSidebarOpen}
        onRightSidebarChange={setIsRightSidebarOpen}
        sidebarContentType={sidebarContentType}
        onSidebarContentTypeChange={setSidebarContentType as any}
        chat={chat}
        shortcuts={SPELLS}
        course={course}
        homework={homework}
        achievements={achievements}
        focus={focus}
        streak={streak}
        onStreak={doStreak}
      />
    </PWAProvider>
  );
}
