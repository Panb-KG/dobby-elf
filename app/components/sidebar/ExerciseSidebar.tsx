/**
 * 练习题侧边栏组件
 */

"use client";

import { Sparkles, BrainCircuit, Trophy } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { KnowledgePoint } from '../../types';

export interface ExerciseSidebarProps {
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

export function ExerciseSidebarContent({
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
      {dynamicExercises && dynamicExercises.questions && dynamicExercises.questions.length > 0 ? (
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
