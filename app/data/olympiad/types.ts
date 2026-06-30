/**
 * 奥数知识库类型定义
 */

export type ProblemType = 'choice' | 'fill' | 'word';

export interface OlympiadProblem {
  /** 唯一ID */
  id: string;
  /** 年级 1-6 */
  grade: number;
  /** 知识点，如"鸡兔同笼"、"行程问题" */
  topic: string;
  /** 难度 1-5 */
  difficulty: number;
  /** 题型 */
  type: ProblemType;
  /** 题目 */
  question: string;
  /** 答案 */
  answer: string;
  /** 详细解析 */
  explanation: string;
}

export interface OlympiadTopic {
  /** 知识点名称 */
  name: string;
  /** 适用年级 */
  grades: number[];
  /** 题目数量 */
  problemCount: number;
  /** 知识点简介 */
  description: string;
}
