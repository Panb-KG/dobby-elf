"use client";

/**
 * RightSidebarContent - 右侧魔法展示窗内容
 * 从 MagicLayout 抽离，减少主组件行数
 * 子组件已拆分至 sidebar/ 目录
 */

import { Sparkles, Layout } from 'lucide-react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { cn } from '../lib/utils';
import type { KnowledgePoint, DailyTask, Achievement, Course } from '../types';
import type { UseFocusReturn } from '../hooks/useFocus';

// Re-export sub-components for backward compatibility
export { ImageContent } from './sidebar/SharedIcons';
export { CourseSidebarContent } from './sidebar/CourseSidebar';
export type { CourseSidebarProps } from './sidebar/CourseSidebar';
export { ExerciseSidebarContent } from './sidebar/ExerciseSidebar';
export type { ExerciseSidebarProps } from './sidebar/ExerciseSidebar';
export { AchievementsSidebarContent } from './sidebar/AchievementsSidebar';
export type { AchievementsSidebarProps } from './sidebar/AchievementsSidebar';
export { FocusSidebarContent } from './sidebar/FocusSidebar';
export type { FocusSidebarProps } from './sidebar/FocusSidebar';

// Import for internal use
import { ImageContent } from './sidebar/SharedIcons';
import { CourseSidebarContent } from './sidebar/CourseSidebar';
import { ExerciseSidebarContent } from './sidebar/ExerciseSidebar';
import { AchievementsSidebarContent } from './sidebar/AchievementsSidebar';
import { FocusSidebarContent } from './sidebar/FocusSidebar';

// ===== 右侧边栏内容 =====

interface RightSidebarContentProps {
  sidebarContentType: 'schedule' | 'exercise' | 'image' | 'achievements' | 'focus' | 'content' | 'none';
  selectedContent: string | null;
  contentTitle: string;
  generatedImage: string | null;
  onClose: () => void;
  onContentTypeChange: (type: 'schedule' | 'exercise' | 'image' | 'achievements' | 'focus' | 'content') => void;
  courses: Course[];
  scheduleView: 'week' | 'day';
  selectedDay: string;
  isAddingCourse: boolean;
  newCourse: { day: string; subject: string; time: string; type: '校内' | '课外' };
  onScheduleViewChange: (view: 'week' | 'day') => void;
  onSelectedDayChange: (day: string) => void;
  onIsAddingCourseChange: (adding: boolean) => void;
  onNewCourseChange: (course: { day: string; subject: string; time: string; type: '校内' | '课外' }) => void;
  onAddCourse: () => void;
  knowledgeGraph: KnowledgePoint[];
  dynamicExercises: { subject: string; grade: string; questions: Array<{ id: string; question: string; options: string[]; answer: string; explanation: string }> } | null;
  onDynamicExercisesChange: (ex: { subject: string; grade: string; questions: Array<{ id: string; question: string; options: string[]; answer: string; explanation: string }> } | null) => void;
  currentExerciseIndex: number;
  onCurrentExerciseIndexChange: (idx: number) => void;
  exerciseAnswers: Record<string, string>;
  onExerciseAnswersChange: (answers: Record<string, string>) => void;
  showExerciseResult: boolean;
  onShowExerciseResultChange: (show: boolean) => void;
  points: number;
  level: string;
  treeGrowth: number;
  dailyTasks: DailyTask[];
  achievements: Achievement[];
  onCompleteTask: (id: string) => void;
  onWaterTree: () => void;
  focus: UseFocusReturn;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export function RightSidebarContent({
  sidebarContentType, selectedContent, contentTitle, generatedImage,
  onClose, onContentTypeChange,
  courses, scheduleView, selectedDay, isAddingCourse, newCourse,
  onScheduleViewChange, onSelectedDayChange, onIsAddingCourseChange,
  onNewCourseChange, onAddCourse,
  knowledgeGraph, dynamicExercises, currentExerciseIndex,
  onCurrentExerciseIndexChange, exerciseAnswers, onExerciseAnswersChange,
  showExerciseResult, onShowExerciseResultChange, onDynamicExercisesChange,
  points, level, treeGrowth, dailyTasks, achievements,
  onCompleteTask, onWaterTree,
  focus, audioRef,
}: RightSidebarContentProps) {
  return (
    <div className="p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Layout className="w-4 h-4 text-magic-accent" />
          <h2 className="text-sm font-serif italic text-white/80">魔法展示窗</h2>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
          <span className="sr-only">关闭</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {sidebarContentType === 'schedule' && (
          <CourseSidebarContent
            courses={courses} scheduleView={scheduleView} selectedDay={selectedDay}
            isAddingCourse={isAddingCourse} newCourse={newCourse}
            onScheduleViewChange={onScheduleViewChange} onSelectedDayChange={onSelectedDayChange}
            onIsAddingCourseChange={onIsAddingCourseChange} onNewCourseChange={onNewCourseChange}
            onAddCourse={onAddCourse}
          />
        )}
        {sidebarContentType === 'exercise' && (
          <ExerciseSidebarContent
            knowledgeGraph={knowledgeGraph} dynamicExercises={dynamicExercises}
            currentExerciseIndex={currentExerciseIndex} exerciseAnswers={exerciseAnswers}
            showExerciseResult={showExerciseResult}
            onCurrentExerciseIndexChange={onCurrentExerciseIndexChange}
            onExerciseAnswersChange={onExerciseAnswersChange}
            onShowExerciseResultChange={onShowExerciseResultChange}
            onDynamicExercisesChange={onDynamicExercisesChange}
          />
        )}
        {sidebarContentType === 'image' && <ImageContent generatedImage={generatedImage} />}
        {sidebarContentType === 'achievements' && (
          <AchievementsSidebarContent
            points={points} level={level} treeGrowth={treeGrowth} dailyTasks={dailyTasks}
            achievements={achievements} onCompleteTask={onCompleteTask} onWaterTree={onWaterTree}
          />
        )}
        {sidebarContentType === 'focus' && <FocusSidebarContent focus={focus} audioRef={audioRef} />}
        {sidebarContentType === 'content' && selectedContent && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="sticky top-0 z-20 pt-1 pb-4 space-y-4">
              <div className="p-4 rounded-2xl bg-magic-accent/10 border border-magic-accent/20 flex items-center justify-between backdrop-blur-xl shadow-lg shadow-black/5">
                <div>
                  <h3 className="text-lg font-serif font-bold text-white mb-1">{contentTitle}</h3>
                  <p className="text-xs text-white/40">多比的魔法内容</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="markdown-body">
                <Markdown rehypePlugins={[rehypeRaw]}>{selectedContent}</Markdown>
              </div>
            </div>
          </div>
        )}
        {sidebarContentType === 'none' && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <p className="text-sm font-serif italic">
              等待多比为你展示魔法内容...<br />
              你可以试着点击左侧的"课程表"或"作业"。
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-white/5 flex gap-2">
        {(['schedule', 'exercise', 'achievements', 'focus'] as const).map(type => (
          <button
            key={type}
            onClick={() => onContentTypeChange(type)}
            className={cn(
              "flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
              sidebarContentType === type ? "bg-magic-accent text-white" : "bg-white/5 text-white/40 hover:bg-white/10"
            )}
          >
            {type === 'schedule' && '课程表'}
            {type === 'exercise' && '练习题'}
            {type === 'achievements' && '成就墙'}
            {type === 'focus' && '专注'}
          </button>
        ))}
      </div>
    </div>
  );
}
