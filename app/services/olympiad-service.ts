/**
 * 奥数知识库查询服务
 */

import { allProblems, olympiadTopics } from '../data/olympiad';
import type { OlympiadProblem, OlympiadTopic } from '../data/olympiad';

export interface OlympiadQuery {
  grade?: number;
  topic?: string;
  difficulty?: number;
  limit?: number;
  random?: boolean;
}

export interface OlympiadResult {
  problems: OlympiadProblem[];
  total: number;
}

/** 按条件查询题目 */
export function queryProblems(query: OlympiadQuery): OlympiadResult {
  let result = [...allProblems];

  if (query.grade) {
    result = result.filter(p => p.grade === query.grade);
  }
  if (query.topic) {
    result = result.filter(p => p.topic === query.topic);
  }
  if (query.difficulty) {
    result = result.filter(p => p.difficulty === query.difficulty);
  }

  const total = result.length;

  if (query.random) {
    // 简单洗牌
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
  }

  const limit = query.limit || 10;
  return { problems: result.slice(0, limit), total };
}

/** 获取随机一题 */
export function getRandomProblem(grade?: number): OlympiadProblem | null {
  const pool = grade ? allProblems.filter(p => p.grade === grade) : allProblems;
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** 获取知识点目录 */
export function getTopics(grade?: number): OlympiadTopic[] {
  if (!grade) return olympiadTopics;
  return olympiadTopics.filter(t => t.grades.includes(grade));
}

/** 按 ID 获取题目 */
export function getProblemById(id: string): OlympiadProblem | null {
  return allProblems.find(p => p.id === id) || null;
}

/** 获取统计信息 */
export function getStats() {
  const byGrade: Record<number, number> = {};
  const byTopic: Record<string, number> = {};

  for (const p of allProblems) {
    byGrade[p.grade] = (byGrade[p.grade] || 0) + 1;
    byTopic[p.topic] = (byTopic[p.topic] || 0) + 1;
  }

  return {
    total: allProblems.length,
    byGrade,
    byTopic,
    topics: olympiadTopics.length,
  };
}
