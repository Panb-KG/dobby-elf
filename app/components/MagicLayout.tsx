"use client";

/**
 * MagicLayout - 魔法布局组件
 * 
 * 主界面布局容器，负责：
 * 1. 渲染头部、侧边栏、主内容区
 * 2. 根据 activeTab 切换不同功能模块
 * 3. 管理右侧边栏的展开/收起
 * 
 * @see ChatModule - 聊天模块
 * @see CourseModule - 课程模块
 * @see HomeworkModule - 作业模块
 * @see AchievementModule - 成就模块
 * @see FocusModule - 专注模块
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Calendar,
  Pencil,
  Trophy,
  Hourglass,
  PanelRightClose,
  PanelRightOpen,
  X,
} from 'lucide-react';
import type { UseChatReturn } from '../hooks/useChat';
import type { UseCoursesReturn } from '../hooks/useCourses';
import type { UseHomeworkReturn } from '../hooks/useHomework';
import type { UseAchievementsReturn } from '../hooks/useAchievements';
import type { UseFocusReturn } from '../hooks/useFocus';
import type { User, Spell } from '../types';
import Header from './layout/Header';
import Sidebar from './layout/Sidebar';
import RightSidebar from './layout/RightSidebar';
import ChatModule from './chat/ChatModule';
import CourseModule from './course/CourseModule';
// HomeworkModule, AchievementModule, FocusModule 待集成

interface MagicLayoutProps {
  // 用户信息
  user: User;
  onLogout: () => void;
  
  // 当前激活标签
  activeTab: 'chat' | 'course' | 'homework' | 'achievements' | 'focus';
  onTabChange: (tab: 'chat' | 'course' | 'homework' | 'achievements' | 'focus') => void;
  
  // 右侧边栏
  isRightSidebarOpen: boolean;
  onRightSidebarChange: (open: boolean) => void;
  sidebarContentType: 'schedule' | 'exercise' | 'achievements' | 'focus';
  onSidebarContentTypeChange: (type: 'schedule' | 'exercise' | 'achievements' | 'focus') => void;
  
  // 聊天模块
  chat: UseChatReturn;
  shortcuts: Spell[];
  
  // 课程模块
  course: UseCoursesReturn;
  
  // 作业模块
  homework: UseHomeworkReturn;
  
  // 成就模块
  achievements: UseAchievementsReturn;
  
  // 专注模块
  focus: UseFocusReturn;
}

export default function MagicLayout({
  user,
  onLogout,
  activeTab,
  onTabChange,
  isRightSidebarOpen,
  onRightSidebarChange,
  sidebarContentType,
  onSidebarContentTypeChange,
  chat,
  shortcuts,
  course,
  homework,
  achievements,
  focus,
}: MagicLayoutProps) {
  // 将 SPELLS 转换为组件需要的格式
  const shortcutButtons = shortcuts.map(spell => ({
    id: spell.id,
    name: spell.name,
    icon: getSpellIcon(spell.id),
    prompt: spell.prompt,
  }));

  return (
    <div className="h-screen w-full bg-[#0a0502] flex flex-col overflow-hidden">
      {/* 头部 */}
      <Header
        user={user}
        points={achievements.totalPoints}
        level={achievements.userLevel}
        onLogout={onLogout}
      />
      
      {/* 主体内容 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧导航栏 */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
        
        {/* 主内容区 */}
        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {activeTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <ChatModule
                  messages={chat.messages}
                  input={chat.input}
                  isLoading={chat.isLoading}
                  onSend={chat.sendMessage}
                  onInputChange={chat.handleInputChange}
                  onShortcut={chat.handleShortcut}
                  shortcuts={shortcutButtons}
                />
              </motion.div>
            )}
            
            {activeTab === 'course' && (
              <motion.div
                key="course"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <CourseModule
                  courses={course.courses}
                  scheduleView={course.scheduleView}
                  selectedDay={course.selectedDay}
                  isAddingCourse={course.isAddingCourse}
                  newCourse={course.newCourse}
                  onScheduleViewChange={course.setScheduleView}
                  onSelectedDayChange={course.setSelectedDay}
                  onIsAddingCourseChange={course.setIsAddingCourse}
                  onNewCourseChange={course.setNewCourse}
                  onAddCourse={course.addCourse}
                  onRemoveCourse={course.removeCourse}
                />
              </motion.div>
            )}
            
            {activeTab === 'homework' && (
              <motion.div
                key="homework"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full p-4"
              >
                <div className="glass-panel rounded-2xl p-6 h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Pencil className="w-16 h-16 text-white/40 mx-auto" />
                    <h2 className="text-2xl font-serif text-white/60">作业模块</h2>
                    <p className="text-white/40">待集成 HomeworkModule 组件</p>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'achievements' && (
              <motion.div
                key="achievements"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full p-4"
              >
                <div className="glass-panel rounded-2xl p-6 h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Trophy className="w-16 h-16 text-white/40 mx-auto" />
                    <h2 className="text-2xl font-serif text-white/60">成就模块</h2>
                    <p className="text-white/40">待集成 AchievementModule 组件</p>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'focus' && (
              <motion.div
                key="focus"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="h-full p-4"
              >
                <div className="glass-panel rounded-2xl p-6 h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Hourglass className="w-16 h-16 text-white/40 mx-auto" />
                    <h2 className="text-2xl font-serif text-white/60">专注模块</h2>
                    <p className="text-white/40">待集成 FocusModule 组件</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        
        {/* 右侧边栏 */}
        <RightSidebar
          isOpen={isRightSidebarOpen}
          onClose={() => onRightSidebarChange(false)}
          contentType={sidebarContentType}
        >
          {/* 右侧边栏内容待实现 */}
          <div className="p-4 text-white/40 text-center">
            右侧边栏内容待开发
          </div>
        </RightSidebar>
      </div>
      
      {/* 右侧边栏切换按钮 */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onRightSidebarChange(!isRightSidebarOpen)}
        className="absolute right-4 top-20 p-2 glass-panel rounded-xl hover:bg-white/10 transition-colors"
      >
        {isRightSidebarOpen ? (
          <PanelRightClose className="w-5 h-5 text-white/60" />
        ) : (
          <PanelRightOpen className="w-5 h-5 text-white/60" />
        )}
      </motion.button>
    </div>
  );
}

// 辅助函数：根据 spell id 获取图标组件
function getSpellIcon(id: string): React.ElementType {
  const icons: Record<string, React.ElementType> = {
    schedule: Calendar,
    homework: Pencil,
    words: MessageSquare,
    math: Hourglass,
    focus: Hourglass,
    achievements: Trophy,
  };
  return icons[id] || MessageSquare;
}
