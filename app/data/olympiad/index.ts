/**
 * 小学奥数知识库 - 合并导出
 */

export type { OlympiadProblem, OlympiadTopic, ProblemType } from './types';
export { grades12 } from './grades-1-2';
export { grades34 } from './grades-3-4';
export { grades56 } from './grades-5-6';

import { grades12 } from './grades-1-2';
import { grades34 } from './grades-3-4';
import { grades56 } from './grades-5-6';
import type { OlympiadProblem, OlympiadTopic } from './types';

/** 全部题目 */
export const allProblems: OlympiadProblem[] = [...grades12, ...grades34, ...grades56];

/** 知识点目录 */
export const olympiadTopics: OlympiadTopic[] = [
  { name: '图形计数', grades: [1, 2], problemCount: 2, description: '数图形中的基本形状数量' },
  { name: '规律找数', grades: [1, 2], problemCount: 2, description: '发现数列中的规律并填数' },
  { name: '趣味数学', grades: [1, 2], problemCount: 1, description: '生活中的简单数学问题' },
  { name: '鸡兔同笼', grades: [2, 4], problemCount: 3, description: '经典的假设法解题' },
  { name: '植树问题', grades: [2], problemCount: 2, description: '直线/环形植树中的间隔与棵数关系' },
  { name: '周期问题', grades: [2], problemCount: 2, description: '利用余数解决循环排列问题' },
  { name: '简单逻辑推理', grades: [2], problemCount: 1, description: '根据条件推理比较关系' },
  { name: '和差问题', grades: [3], problemCount: 2, description: '已知两数和与差求两数' },
  { name: '和倍问题', grades: [3], problemCount: 1, description: '已知两数和与倍数求两数' },
  { name: '差倍问题', grades: [3], problemCount: 1, description: '已知两数差与倍数求两数' },
  { name: '年龄问题', grades: [3], problemCount: 2, description: '利用年龄差不变解题' },
  { name: '行程问题', grades: [4, 5], problemCount: 4, description: '速度、时间、路程的关系' },
  { name: '盈亏问题', grades: [4], problemCount: 1, description: '分配中的多余和不足问题' },
  { name: '数论', grades: [5], problemCount: 3, description: '数字特征与整除问题' },
  { name: '工程问题', grades: [5], problemCount: 2, description: '工作效率与时间问题' },
  { name: '分数百分数', grades: [6], problemCount: 2, description: '分数和百分数的应用' },
  { name: '比例问题', grades: [6], problemCount: 2, description: '正反比例的应用' },
  { name: '组合数学', grades: [6], problemCount: 2, description: '排列与组合初步' },
];
