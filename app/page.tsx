"use client";

/**
 * Dobi-elf 主页面
 * 
 * 这是重构后的容器组件，负责：
 * 1. 使用 Hooks 管理所有状态
 * 2. 协调各个功能模块
 * 3. 处理用户认证流程
 * 
 * @see ../hooks/useAuth - 认证逻辑
 * @see ../hooks/useChat - 聊天逻辑
 * @see ../hooks/useCourses - 课程逻辑
 * @see ../hooks/useHomework - 作业逻辑
 * @see ../hooks/useAchievements - 成就逻辑
 * @see ../hooks/useFocus - 专注逻辑
 */

import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useChat } from './hooks/useChat';
import { useCourses } from './hooks/useCourses';
import { useHomework } from './hooks/useHomework';
import { useAchievements } from './hooks/useAchievements';
import { useFocus } from './hooks/useFocus';
import { SPELLS } from '../Global';
import MagicLayout from './components/MagicLayout';
import LoginPage from './components/auth/LoginPage';
import LoadingScreen from './components/ui/LoadingScreen';

export default function Page() {
  // ========== 认证状态 ==========
  const {
    user,
    isAuthReady,
    showLoginModal,
    showRegisterModal,
    authError,
    login,
    register,
    logout,
    setShowLoginModal,
    setShowRegisterModal,
  } = useAuth();

  // ========== 聊天状态 ==========
  const {
    messages,
    input,
    isLoading,
    sendMessage,
    handleInputChange,
    handleShortcut,
  } = useChat();

  // ========== 课程状态 ==========
  const {
    courses,
    scheduleView,
    selectedDay,
    isAddingCourse,
    newCourse,
    setScheduleView,
    setSelectedDay,
    setIsAddingCourse,
    setNewCourse,
    addCourse,
    removeCourse,
  } = useCourses();

  // ========== 作业状态 ==========
  const {
    tasks: homeworkTasks,
    filter: homeworkFilter,
    setFilter: setHomeworkFilter,
    addTask: addHomework,
    updateTaskStatus: updateHomeworkStatus,
    deleteTask: deleteHomework,
    getOverdueTasks,
  } = useHomework();

  // ========== 成就状态 ==========
  const {
    achievements,
    totalPoints,
    userLevel,
    addAchievement,
  } = useAchievements({ user });

  // ========== 专注状态 ==========
  const {
    isFocusing,
    elapsedTime,
    duration: focusDuration,
    whiteNoise,
    sessions: focusSessions,
    startFocus,
    pauseFocus,
    resumeFocus,
    stopFocus,
    setWhiteNoise,
    completeSession,
  } = useFocus({ defaultDuration: 25, autoSave: true });

  // ========== UI 状态 ==========
  const [activeTab, setActiveTab] = useState<'chat' | 'course' | 'homework' | 'achievements' | 'focus'>('chat');
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [sidebarContentType, setSidebarContentType] = useState<'schedule' | 'exercise' | 'achievements' | 'focus'>('schedule');

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
        onCloseLogin={() => setShowLoginModal(false)}
        onCloseRegister={() => setShowRegisterModal(false)}
      />
    );
  }

  // ========== 主界面 ==========
  return (
    <MagicLayout
      // 用户信息
      user={user}
      onLogout={logout}
      
      // 当前激活标签
      activeTab={activeTab}
      onTabChange={setActiveTab}
      
      // 右侧边栏
      isRightSidebarOpen={isRightSidebarOpen}
      onRightSidebarChange={setIsRightSidebarOpen}
      sidebarContentType={sidebarContentType}
      onSidebarContentTypeChange={setSidebarContentType}
      
      // 聊天模块
      chat={{
        messages,
        input,
        isLoading,
        sendMessage,
        handleInputChange,
        handleShortcut,
      }}
      shortcuts={SPELLS}
      
      // 课程模块
      course={{
        courses,
        scheduleView,
        selectedDay,
        isAddingCourse,
        newCourse,
        setScheduleView,
        setSelectedDay,
        setIsAddingCourse,
        setNewCourse,
        addCourse,
        removeCourse,
      }}
      
      // 作业模块
      homework={{
        tasks: homeworkTasks,
        filter: homeworkFilter,
        setFilter: setHomeworkFilter,
        addTask: addHomework,
        updateTaskStatus: updateHomeworkStatus,
        deleteTask: deleteHomework,
        overdueTasks: getOverdueTasks(),
      }}
      
      // 成就模块
      achievements={{
        achievements,
        totalPoints,
        userLevel,
        addAchievement,
      }}
      
      // 专注模块
      focus={{
        isFocusing,
        elapsedTime,
        duration: focusDuration,
        whiteNoise,
        sessions: focusSessions,
        startFocus,
        pauseFocus,
        resumeFocus,
        stopFocus,
        setWhiteNoise,
        completeSession,
      }}
    />
  );
}
