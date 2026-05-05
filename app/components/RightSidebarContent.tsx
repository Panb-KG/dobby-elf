"use client";

/**
 * RightSidebarContent - 右侧魔法展示窗内容
 * 从 MagicLayout 抽离，减少主组件行数
 */

import { motion } from 'motion/react';
import { Sparkles, Layout, BrainCircuit, TrendingUp, Leaf, Droplets, Award, Trophy, Star, Medal, CheckCircle2, Circle, VolumeX, Library, Flame, CloudRain, RotateCcw, Hourglass } from 'lucide-react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { cn } from '../lib/utils';
import type { KnowledgePoint, DailyTask, Achievement, Course } from '../types';
import type { UseFocusReturn } from '../hooks/useFocus';

// ===== 右侧边栏内容 =====

interface RightSidebarContentProps {
  sidebarContentType: 'schedule' | 'exercise' | 'image' | 'achievements' | 'focus' | 'content' | 'none';
  selectedContent: string | null;
  contentTitle: string;
  generatedImage: string | null;
  onClose: () => void;
  onContentTypeChange: (type: 'schedule' | 'exercise' | 'image' | 'achievements' | 'focus' | 'content') => void;
  // 课程表
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
  // 练习
  knowledgeGraph: KnowledgePoint[];
  dynamicExercises: { subject: string; grade: string; questions: Array<{ id: string; question: string; options: string[]; answer: string; explanation: string }> } | null;
  onDynamicExercisesChange: (ex: { subject: string; grade: string; questions: Array<{ id: string; question: string; options: string[]; answer: string; explanation: string }> } | null) => void;
  currentExerciseIndex: number;
  onCurrentExerciseIndexChange: (idx: number) => void;
  exerciseAnswers: Record<string, string>;
  onExerciseAnswersChange: (answers: Record<string, string>) => void;
  showExerciseResult: boolean;
  onShowExerciseResultChange: (show: boolean) => void;
  // 成就
  points: number;
  level: string;
  treeGrowth: number;
  dailyTasks: DailyTask[];
  achievements: Achievement[];
  onCompleteTask: (id: string) => void;
  onWaterTree: () => void;
  // 专注
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
          <XIcon />
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

// ===== 内联子组件 =====

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
  );
}

function ImageContent({ generatedImage }: { generatedImage: string | null }) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/20 min-h-[200px] flex items-center justify-center">
        {generatedImage ? (
          <img src={generatedImage} alt="魔法生成图片" className="w-full h-auto object-cover" referrerPolicy="no-referrer" />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Sparkles className="w-8 h-8 text-magic-accent animate-pulse" />
            <p className="text-xs text-white/40 italic">正在绘制魔法图像...</p>
          </div>
        )}
      </div>
      {generatedImage && (
        <button
          onClick={() => { const link = document.createElement('a'); link.href = generatedImage; link.download = 'magic-image.png'; link.click(); }}
          className="w-full py-2 rounded-xl bg-white/5 text-magic-accent text-xs font-bold hover:bg-white/10 transition-all"
        >
          保存魔法图片
        </button>
      )}
    </div>
  );
}

// ===== 课程表侧边栏 =====

interface CourseSidebarProps {
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
}

function CourseSidebarContent({
  courses, scheduleView, selectedDay, isAddingCourse, newCourse,
  onScheduleViewChange, onSelectedDayChange, onIsAddingCourseChange,
  onNewCourseChange, onAddCourse,
}: CourseSidebarProps) {
  const courseColors = [
    'bg-blue-500/20 border-blue-500/30', 'bg-purple-500/20 border-purple-500/30',
    'bg-amber-500/20 border-amber-500/30', 'bg-emerald-500/20 border-emerald-500/30',
    'bg-rose-500/20 border-rose-500/30', 'bg-sky-500/20 border-sky-500/30',
    'bg-indigo-500/20 border-indigo-500/30',
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative">
      <div className="sticky top-0 z-20 pt-1 pb-4 space-y-4">
        <div className="p-4 rounded-2xl bg-magic-accent/10 border border-magic-accent/20 flex items-center justify-between backdrop-blur-xl shadow-lg shadow-black/5">
          <div>
            <h3 className="text-lg font-serif font-bold text-white mb-1">我的魔法课程表</h3>
            <p className="text-xs text-white/40">2026年3月 · 第一周</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onIsAddingCourseChange(!isAddingCourse)} className={cn(
              "p-2 rounded-xl transition-all border",
              isAddingCourse ? "bg-red-500/20 border-red-500/30 text-red-400" : "bg-magic-accent/20 border-magic-accent/30 text-magic-accent hover:bg-magic-accent/30"
            )}>
              {isAddingCourse ? <XIcon /> : <PlusIcon />}
            </button>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              {(['week', 'day'] as const).map(view => (
                <button key={view} onClick={() => onScheduleViewChange(view)} className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                  scheduleView === view ? "bg-magic-accent text-white shadow-lg" : "text-white/40 hover:text-white/60"
                )}>{view === 'week' ? '周' : '日'}</button>
              ))}
            </div>
          </div>
        </div>
        {isAddingCourse && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 overflow-hidden">
            <div className="grid grid-cols-2 gap-2">
              <select value={newCourse.day} onChange={(e) => onNewCourseChange({ ...newCourse, day: e.target.value })} className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-magic-accent/50">
                {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={newCourse.type} onChange={(e) => onNewCourseChange({ ...newCourse, type: e.target.value as '校内' | '课外' })} className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-magic-accent/50">
                <option value="校内">校内</option><option value="课外">课外</option>
              </select>
            </div>
            <input type="text" placeholder="课程名称" value={newCourse.subject} onChange={(e) => onNewCourseChange({ ...newCourse, subject: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-magic-accent/50" />
            <input type="text" placeholder="时间 (如: 09:00 - 10:30)" value={newCourse.time} onChange={(e) => onNewCourseChange({ ...newCourse, time: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-magic-accent/50" />
            <button onClick={onAddCourse} className="w-full py-2 bg-magic-accent text-white rounded-lg text-xs font-bold shadow-lg shadow-magic-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all">添加魔法课程</button>
          </motion.div>
        )}
        {scheduleView === 'day' && (
          <div className="flex gap-2 overflow-x-auto pb-2 px-1 custom-scrollbar">
            {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(day => (
              <button key={day} onClick={() => onSelectedDayChange(day)} className={cn(
                "flex-shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all border",
                selectedDay === day ? "bg-white/10 border-magic-accent text-magic-accent" : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
              )}>{day}</button>
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 mt-4">
        {courses.filter(item => scheduleView === 'week' || item.day === selectedDay).map((item, idx) => (
          <motion.div layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={`${item.day}-${item.subject}-${idx}`} className={cn("p-4 rounded-2xl border flex items-center justify-between group hover:scale-[1.02] transition-transform cursor-default", item.color || courseColors[idx % courseColors.length])}>
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">{item.day}</span>
                <h4 className="font-medium text-white">{item.subject}</h4>
              </div>
              <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-bold uppercase", item.type === '校内' ? "bg-white/10 text-white/60" : "bg-magic-accent/20 text-magic-accent")}>{item.type}</span>
            </div>
            <span className="text-xs text-white/40 font-mono">{item.time}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ===== 练习侧边栏 =====

interface ExerciseSidebarProps {
  knowledgeGraph: KnowledgePoint[];
  dynamicExercises: { subject: string; grade: string; questions: Array<{ id: string; question: string; options: string[]; answer: string; explanation: string }> } | null;
  currentExerciseIndex: number;
  exerciseAnswers: Record<string, string>;
  showExerciseResult: boolean;
  onCurrentExerciseIndexChange: (idx: number) => void;
  onExerciseAnswersChange: (answers: Record<string, string>) => void;
  onShowExerciseResultChange: (show: boolean) => void;
  onDynamicExercisesChange: (ex: { subject: string; grade: string; questions: Array<{ id: string; question: string; options: string[]; answer: string; explanation: string }> } | null) => void;
}

function ExerciseSidebarContent({
  knowledgeGraph, dynamicExercises, currentExerciseIndex, exerciseAnswers,
  showExerciseResult, onCurrentExerciseIndexChange, onExerciseAnswersChange,
  onShowExerciseResultChange, onDynamicExercisesChange,
}: ExerciseSidebarProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 px-2 flex items-center gap-2">
          <BrainCircuit className="w-3 h-3" />魔法知识图谱
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {knowledgeGraph.map((point, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-white/40 uppercase tracking-wider">{point.subject}</span>
                <span className="text-sm text-white font-medium">{point.name}</span>
              </div>
              <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase", point.status === 'mastered' ? "bg-emerald-500/20 text-emerald-400" : "bg-magic-accent/20 text-magic-accent animate-pulse")}>
                {point.status === 'mastered' ? '已掌握' : '修炼中'}
              </span>
            </div>
          ))}
        </div>
      </div>
      {dynamicExercises ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">互动练习：{dynamicExercises.subject}</h3>
            <span className="text-[10px] text-magic-accent font-bold">{currentExerciseIndex + 1} / {dynamicExercises.questions.length}</span>
          </div>
          <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-4">
            {!showExerciseResult ? (
              <>
                <p className="text-sm text-white leading-relaxed">{dynamicExercises.questions[currentExerciseIndex].question}</p>
                <div className="space-y-2">
                  {dynamicExercises.questions[currentExerciseIndex].options.map((opt: string, idx: number) => (
                    <button key={idx} onClick={() => onExerciseAnswersChange({ ...exerciseAnswers, [dynamicExercises.questions[currentExerciseIndex].id]: opt })} className={cn(
                      "w-full p-3 rounded-xl border text-left text-xs transition-all",
                      exerciseAnswers[dynamicExercises.questions[currentExerciseIndex].id] === opt ? "bg-magic-accent/10 border-magic-accent text-magic-accent" : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10"
                    )}>{opt}</button>
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  {currentExerciseIndex > 0 && (
                    <button onClick={() => onCurrentExerciseIndexChange(currentExerciseIndex - 1)} className="flex-1 py-2 rounded-xl bg-white/5 text-white/40 text-[10px] font-bold uppercase">上一题</button>
                  )}
                  {currentExerciseIndex < dynamicExercises.questions.length - 1 ? (
                    <button onClick={() => onCurrentExerciseIndexChange(currentExerciseIndex + 1)} disabled={!exerciseAnswers[dynamicExercises.questions[currentExerciseIndex].id]} className="flex-1 py-2 rounded-xl bg-magic-accent text-white text-[10px] font-bold uppercase disabled:opacity-50">下一题</button>
                  ) : (
                    <button onClick={() => onShowExerciseResultChange(true)} disabled={!exerciseAnswers[dynamicExercises.questions[currentExerciseIndex].id]} className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-[10px] font-bold uppercase disabled:opacity-50">提交魔法</button>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-4 text-center py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                  <Trophy className="w-8 h-8 text-emerald-400" />
                </div>
                <h4 className="text-lg font-serif italic text-white">练习完成！</h4>
                <p className="text-xs text-white/60">你真棒！多比为你准备了详细的魔法解析。</p>
                <div className="space-y-4 text-left mt-6">
                  {dynamicExercises.questions.map((q, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-white/40">第 {idx + 1} 题</span>
                        {exerciseAnswers[q.id] === q.answer ? (
                          <span className="text-[10px] font-bold text-emerald-400 uppercase">正确</span>
                        ) : (
                          <span className="text-[10px] font-bold text-magic-accent uppercase">错误</span>
                        )}
                      </div>
                      <p className="text-xs text-white/80">{q.question}</p>
                      <p className="text-[10px] text-emerald-400/80 leading-relaxed italic"><span className="font-bold">魔法解析：</span>{q.explanation}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => onDynamicExercisesChange(null)} className="w-full py-3 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-all">返回图谱</button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-white/5 border border-dashed border-white/10 flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-magic-accent/10 flex items-center justify-center"><Sparkles className="w-6 h-6 text-magic-accent" /></div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-white">暂无动态练习</h4>
            <p className="text-[10px] text-white/40 leading-relaxed">你可以对多比说"我想练习一下分数乘法"，多比会立刻为你生成专属题目！</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== 成就侧边栏 =====

function AchievementsSidebarContent({
  points, level, treeGrowth, dailyTasks, achievements, onCompleteTask, onWaterTree,
}: Pick<RightSidebarContentProps, 'points' | 'level' | 'treeGrowth' | 'dailyTasks' | 'achievements' | 'onCompleteTask' | 'onWaterTree'>) {
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = { Award, Trophy, Star, Medal };
    return icons[iconName] || Award;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 rounded-3xl bg-gradient-to-br from-magic-accent to-orange-600 shadow-lg shadow-magic-accent/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">当前等级</span>
            <span className="text-white font-serif font-bold text-lg">{level}</span>
          </div>
          <TrendingUp className="w-4 h-4 text-white/60" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-serif font-bold text-white">{points}</span>
          <span className="text-sm text-white/60 font-medium">pts</span>
        </div>
        <div className="mt-4 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000" style={{ width: `${Math.min(100, (points % 1000) / 10)}%` }} />
        </div>
        <p className="text-[10px] mt-2 text-white/60">距离下一等级还差 {1000 - (points % 1000)} 积分</p>
      </div>
      <div className="p-5 rounded-3xl bg-emerald-900/40 border border-emerald-500/20 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><Leaf className="w-4 h-4 text-emerald-400" /><h3 className="text-sm font-serif italic text-emerald-100">知识之树</h3></div>
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">等级 {Math.floor(treeGrowth / 5) + 1}</span>
        </div>
        <div className="relative h-32 flex items-end justify-center mb-4">
          <svg viewBox="0 0 100 100" className="w-24 h-24">
            <motion.path d="M50 90 L50 60" stroke="#5d4037" strokeWidth="4" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
            {treeGrowth > 0 && <motion.circle cx="50" cy="50" r={Math.min(30, 10 + treeGrowth * 2)} fill="#2e7d32" fillOpacity="0.6" initial={{ scale: 0 }} animate={{ scale: 1 }} />}
            {treeGrowth > 10 && <motion.circle cx="35" cy="40" r="15" fill="#43a047" fillOpacity="0.5" initial={{ scale: 0 }} animate={{ scale: 1 }} />}
            {treeGrowth > 20 && <motion.circle cx="65" cy="40" r="15" fill="#43a047" fillOpacity="0.5" initial={{ scale: 0 }} animate={{ scale: 1 }} />}
          </svg>
        </div>
        <button onClick={onWaterTree} disabled={points < 50} className="w-full py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20">
          <Droplets className="w-4 h-4" /> 灌溉知识之树 (50 pts)
        </button>
      </div>
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 px-2">每日魔法任务</h3>
        <div className="space-y-2">
          {dailyTasks.map(task => (
            <button key={task.id} onClick={() => onCompleteTask(task.id)} disabled={task.completed} className={cn(
              "w-full p-4 rounded-2xl border flex items-center gap-4 transition-all text-left",
              task.completed ? "bg-white/5 border-white/5 opacity-60" : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-magic-accent/30"
            )}>
              {task.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Circle className="w-5 h-5 text-white/20" />}
              <div className="flex-1">
                <p className={cn("text-sm font-medium", task.completed ? "text-white/40 line-through" : "text-white")}>{task.text}</p>
                <span className="text-[10px] text-magic-accent font-bold">+{task.reward} pts</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 px-2">荣誉记录</h3>
        <div className="grid grid-cols-1 gap-3">
          {achievements.map((ach) => {
            const IconComponent = getIconComponent(ach.iconName);
            return (
              <div key={ach.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 group hover:bg-white/10 transition-all">
                <div className={cn("p-3 rounded-xl bg-white/5", ach.color)}><IconComponent className="w-5 h-5" /></div>
                <div className="flex-1"><h4 className="text-sm font-medium text-white">{ach.title}</h4><p className="text-[10px] text-white/40 uppercase tracking-wider">{ach.date}</p></div>
                <Medal className="w-4 h-4 text-white/10 group-hover:text-magic-accent transition-colors" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ===== 专注侧边栏 =====

function FocusSidebarContent({ focus, audioRef }: Pick<RightSidebarContentProps, 'focus' | 'audioRef'>) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  const whiteNoiseOptions = [
    { id: 'none' as const, name: '静音', icon: VolumeX },
    { id: 'library' as const, name: '魔法图书馆', icon: Library },
    { id: 'rain' as const, name: '禁林细雨', icon: CloudRain },
    { id: 'fire' as const, name: '休息室壁炉', icon: Flame },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-8 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-magic-accent to-transparent" />
        </div>
        <div className="relative mb-6">
          <motion.div animate={focus.isFocusing ? { rotate: 180 } : { rotate: 0 }} transition={{ duration: 2, repeat: focus.isFocusing ? Infinity : 0, ease: "easeInOut" }} className="w-24 h-24 flex items-center justify-center">
            <Hourglass className={cn("w-16 h-16 transition-colors", focus.isFocusing ? "text-magic-accent" : "text-white/20")} />
          </motion.div>
        </div>
        <div className="space-y-1 mb-8">
          <h3 className="text-3xl font-mono font-bold text-white tracking-widest">{formatTime(focus.elapsedTime)}</h3>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{focus.isFocusing ? '专注魔法生效中...' : '准备好开始专注了吗？'}</p>
        </div>
        <div className="flex gap-3 w-full">
          {!focus.isFocusing ? (
            <button onClick={() => focus.startFocus(25)} className="flex-1 py-3 rounded-xl bg-magic-accent text-white text-xs font-bold shadow-lg shadow-magic-accent/20 hover:scale-105 transition-all">开启沙漏</button>
          ) : (
            <button onClick={focus.pauseFocus} className="flex-1 py-3 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-all">暂停魔法</button>
          )}
          {(focus.elapsedTime < focus.duration && !focus.isFocusing) && (
            <button onClick={focus.stopFocus} className="p-3 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all"><RotateCcw className="w-4 h-4" /></button>
          )}
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 px-2">背景魔法音</h3>
        <div className="grid grid-cols-2 gap-2">
          {whiteNoiseOptions.map(sound => (
            <button key={sound.id} onClick={() => { focus.setWhiteNoise(sound.id); if (sound.id !== 'none' && audioRef.current) audioRef.current.play().catch(() => {}); }} className={cn(
              "p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all",
              focus.whiteNoise === sound.id ? "bg-magic-accent/10 border-magic-accent text-magic-accent" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
            )}>
              <sound.icon className="w-5 h-5" /><span className="text-[10px] font-bold">{sound.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
        <p className="text-[10px] text-white/60 leading-relaxed"><span className="text-white font-bold">魔法提示：</span>在沙漏开启期间，请不要离开这个页面。如果你切换标签页，魔法沙漏就会碎掉哦！</p>
      </div>
    </div>
  );
}
