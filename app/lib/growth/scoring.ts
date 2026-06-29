// Stub: SQLite scoring module

export interface ScoreRule {
  id: string; userId: string; title: string; description: string;
  maxPoints: number; icon: string; category: string; createdAt: string;
}
export interface DailyScoreRecord {
  id: string; userId: string; ruleId: string; ruleTitle: string; ruleIcon: string;
  score: number; comment: string; scoredBy: string; date: string; createdAt: string;
}

export const PRESET_RULES = [
  { title: '作业完成', maxPoints: 10, icon: '📚', category: '学习' },
  { title: '阅读打卡', maxPoints: 5, icon: '📖', category: '学习' },
  { title: '运动锻炼', maxPoints: 5, icon: '️', category: '健康' },
  { title: '做家务', maxPoints: 5, icon: '', category: '生活' },
];

export function getScoreRules(): ScoreRule[] { return []; }
export function addScoreRule(): ScoreRule { return {} as ScoreRule; }
export function deleteScoreRule(): boolean { return false; }
export function getTodayScores(): DailyScoreRecord[] { return []; }
export function recordDailyScore() { return {} as DailyScoreRecord; }
export function getDailyTotal(): number { return 0; }
