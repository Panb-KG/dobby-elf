/**
 * 亲子打分面板 - 右栏展示
 * v2.0 新增
 */

"use client";

import { useState, useEffect } from 'react';
import { getScoreRules, getTodayScores } from '@/lib/agent/client';
import { ScoreRuleForm, ScoreRuleAddButton } from './ScoreRuleForm';
import { ScoreRuleItem } from './ScoreRuleItem';

interface ParentScorePanelProps {
  userId: string;
}

export default function ParentScorePanel({ userId }: ParentScorePanelProps) {
  const [rules, setRules] = useState<any[]>([]);
  const [todayScores, setTodayScores] = useState<any[]>([]);
  const [dailyTotal, setDailyTotal] = useState({ total: 0, max: 0, percentage: 0 });
  const [showAddRule, setShowAddRule] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rulesRes, scoresRes] = await Promise.all([getScoreRules(), getTodayScores()]);
      setRules(rulesRes.rules || []);
      setTodayScores(scoresRes.records || []);
      setDailyTotal(scoresRes.total || { total: 0, max: 0, percentage: 0 });
    } catch (e) { console.error('加载打分数据失败', e); }
    finally { setLoading(false); }
  };

  const scoredRuleIds = new Set(todayScores.map(s => s.ruleId));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <span className="text-4xl mb-3">⭐</span>
        <p className="text-sm">加载中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 今日得分总览 */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-900/30 to-yellow-900/30 border border-amber-700/30 text-center">
        <div className="text-sm text-amber-400 mb-1">今日得分</div>
        <div className="text-4xl font-bold text-amber-300">
          {dailyTotal.total}
          <span className="text-lg text-gray-400"> / {dailyTotal.max}</span>
        </div>
        <div className="mt-2 h-3 bg-black/30 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
            style={{ width: `${dailyTotal.percentage}%` }} />
        </div>
        <div className="text-sm text-gray-400 mt-1">
          {dailyTotal.percentage}% {dailyTotal.percentage >= 80 ? '🎉 太棒了！' : dailyTotal.percentage >= 50 ? '👍 继续加油！' : '💪 明天更好！'}
        </div>
      </div>

      {/* 添加规则 */}
      {!showAddRule ? (
        <ScoreRuleAddButton onClick={() => setShowAddRule(true)} />
      ) : (
        <ScoreRuleForm rules={rules} onAdded={loadData} onCancel={() => setShowAddRule(false)} />
      )}

      {/* 打分规则列表 */}
      {rules.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          还没有打分规则<br />
          <span className="text-xs">点击"添加打分规则"开始吧！</span>
        </div>
      ) : (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">打分规则</h4>
          {rules.map(rule => (
            <ScoreRuleItem
              key={rule.id}
              rule={rule}
              isScored={scoredRuleIds.has(rule.id)}
              existingScore={todayScores.find(s => s.ruleId === rule.id)}
              onScored={loadData}
            />
          ))}
        </div>
      )}
    </div>
  );
}
