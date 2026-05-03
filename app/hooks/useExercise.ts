"use client";

/**
 * useExercise - 互动练习管理 Hook
 * 
 * 管理知识图谱、动态练习题、答题流程、结果展示。
 */

import { useState, useCallback } from 'react';
import type { KnowledgePoint } from '../types';

interface ExerciseQuestion {
  id: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface DynamicExercises {
  subject: string;
  grade: string;
  questions: ExerciseQuestion[];
}

export interface UseExerciseReturn {
  knowledgeGraph: KnowledgePoint[];
  setKnowledgeGraph: (graph: KnowledgePoint[]) => void;
  dynamicExercises: DynamicExercises | null;
  setDynamicExercises: (ex: DynamicExercises | null) => void;
  currentExerciseIndex: number;
  goToNextQuestion: () => void;
  goToPrevQuestion: () => void;
  exerciseAnswers: Record<string, string>;
  selectAnswer: (questionId: string, option: string) => void;
  showExerciseResult: boolean;
  setShowExerciseResult: (show: boolean) => void;
  resetExercise: () => void;
  isLastQuestion: boolean;
  isFirstQuestion: boolean;
  totalQuestions: number;
}

const DEFAULT_KNOWLEDGE_GRAPH: KnowledgePoint[] = [
  { name: '分数乘法', status: 'mastered', subject: '数学' },
  { name: '过去进行时', status: 'learning', subject: '英语' },
  { name: '古诗词鉴赏', status: 'learning', subject: '语文' },
];

export function useExercise(): UseExerciseReturn {
  const [knowledgeGraph, setKnowledgeGraph] = useState<KnowledgePoint[]>(DEFAULT_KNOWLEDGE_GRAPH);
  const [dynamicExercises, setDynamicExercises] = useState<DynamicExercises | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, string>>({});
  const [showExerciseResult, setShowExerciseResult] = useState(false);

  const goToNextQuestion = useCallback(() => {
    setCurrentExerciseIndex(prev => {
      if (dynamicExercises && prev < dynamicExercises.questions.length - 1) {
        return prev + 1;
      }
      return prev;
    });
  }, [dynamicExercises]);

  const goToPrevQuestion = useCallback(() => {
    setCurrentExerciseIndex(prev => Math.max(0, prev - 1));
  }, []);

  const selectAnswer = useCallback((questionId: string, option: string) => {
    setExerciseAnswers(prev => ({ ...prev, [questionId]: option }));
  }, []);

  const resetExercise = useCallback(() => {
    setDynamicExercises(null);
    setCurrentExerciseIndex(0);
    setExerciseAnswers({});
    setShowExerciseResult(false);
  }, []);

  const totalQuestions = dynamicExercises?.questions.length ?? 0;
  const isLastQuestion = currentExerciseIndex >= totalQuestions - 1 && totalQuestions > 0;
  const isFirstQuestion = currentExerciseIndex === 0;

  return {
    knowledgeGraph,
    setKnowledgeGraph,
    dynamicExercises,
    setDynamicExercises,
    currentExerciseIndex,
    goToNextQuestion,
    goToPrevQuestion,
    exerciseAnswers,
    selectAnswer,
    showExerciseResult,
    setShowExerciseResult,
    resetExercise,
    isLastQuestion,
    isFirstQuestion,
    totalQuestions,
  };
}
