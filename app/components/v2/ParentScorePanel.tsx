/**
 * 亲子打分面板 - 右栏展示
 * v2.0 新增
 */

"use client";

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit3, Check, X } from 'lucide-react';
import {
  getScoreRules,
  addScoreRule as apiAddScoreRule,
  recordDailyScore as apiRecordDailyScore,
  getTodayScores,
} from '@/lib/agent/client';
import { PRESET_RULES } from '@/lib/growth';

interface ParentScorePanelProps {
  userId: string;
}

export default function ParentScorePanel({ userId }: ParentScorePanelProps) {
  const [rules, setRules] = useState<any[]>([]);
  const [todayScores, setTodayScores] = useState<any[]>([]);
  const [dailyTotal, setDailyTotal] = useState({ total: 0, max: 0, percentage: 0 });
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRule, setNewRule] = useState({
    title: '',
    description: '',
    maxPoints: 5,
    icon: '⭐',
    category: 'study',
  });
  const [scoring, setScoring] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rulesRes, scoresRes] = await Promise.all([
        getScoreRules(),
        getTodayScores(),
      ]);
      setRules(rulesRes.rules || []);
      setTodayScores(scoresRes.records || []);
      setDailyTotal(scoresRes.total || { total: 0, max: 0, percentage: 0 });
    } catch (e) {
      console.error('加载打分数据失败', e);
    } finally {
      setLoading(false);
    }
  };

  // 添加规则
  const handleAddRule = async () => {
    if (!newRule.title.trim()) return;
    try {
      await apiAddScoreRule({
        title: newRule.title.trim(),
        description: newRule.description.trim(),
        maxPoints: newRule.maxPoints,
        icon: newRule.icon,
        category: newRule.category,
      });
      setShowAddRule(false);
      setNewRule({ title: '', description: '', maxPoints: 5, icon: '⭐', category: 'study' });
      loadData();
    } catch (e) {
      alert('添加规则失败');
    }
  };

  // 快速添加预设规则
  const handleAddPreset = async (preset: any) => {
    try {
      await apiAddScoreRule(preset);
      loadData();
    } catch (e) {
      alert('添加失败');
    }
  };

  // 提交打分
  const handleSubmitScore = async (ruleId: string) => {
    const score = scoring[ruleId];
    if (score === undefined || score === null) return;

    try {
      await apiRecordDailyScore({
        ruleId,
        score,
        comment: comments[ruleId] || '',
        scoredBy: 'child',
        date: new Date().toISOString().split('T')[0],
      });
      setScoring(prev => {
        const next = { ...prev };
        delete next[ruleId];
        return next;
      });
      loadData();
    } catch (e: any) {
      alert(e.message || '打分失败');
    }
  };

  // 今日已打分的规则 ID 集合
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
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
            style={{ width: `${dailyTotal.percentage}%` }}
          />
        </div>
        <div className="text-sm text-gray-400 mt-1">
          {dailyTotal.percentage}% {dailyTotal.percentage >= 80 ? '🎉 太棒了！' : dailyTotal.percentage >= 50 ? '👍 继续加油！' : '💪 明天更好！'}
        </div>
      </div>

      {/* 添加规则按钮 */}
      {!showAddRule ? (
        <button
          onClick={() => setShowAddRule(true)}
          className="w-full py-2.5 rounded-xl border border-dashed border-white/20 hover:border-white/40 text-gray-400 hover:text-gray-200 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <Plus size={16} />
          添加打分规则
        </button>
      ) : (
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <div className="text-sm font-medium text-orange-400 mb-2">新规则</div>

          {/* 图标选择 */}
          <div className="flex gap-1 flex-wrap">
            {['⭐', '📚', '💪', '📖', '🏃', '😴', '🧹', '🤝', '📵', '❤️', '🎯', '🌟'].map(icon => (
              <button
                key={icon}
                onClick={() => setNewRule(prev => ({ ...prev, icon }))}
                className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all ${
                  newRule.icon === icon ? 'bg-orange-500/30 ring-1 ring-orange-500' : 'hover:bg-white/10'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>

          {/* 名称 */}
          <input
            type="text"
            value={newRule.title}
            onChange={e => setNewRule(prev => ({ ...prev, title: e.target.value }))}
            placeholder="规则名称，如：按时完成作业"
            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
          />

          {/* 描述 */}
          <input
            type="text"
            value={newRule.description}
            onChange={e => setNewRule(prev => ({ ...prev, description: e.target.value }))}
            placeholder="描述（可选）"
            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
          />

          {/* 最高分 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">最高分</span>
            <input
              type="number"
              value={newRule.maxPoints}
              onChange={e => setNewRule(prev => ({ ...prev, maxPoints: parseInt(e.target.value) || 1 }))}
              min={1}
              max={10}
              className="w-16 bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white text-center focus:outline-none focus:border-orange-500/50"
            />
            <span className="text-xs text-gray-400">分</span>

            <select
              value={newRule.category}
              onChange={e => setNewRule(prev => ({ ...prev, category: e.target.value }))}
              className="ml-auto bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-gray-300 focus:outline-none"
            >
              <option value="study">学习</option>
              <option value="life">生活</option>
              <option value="behavior">行为</option>
              <option value="exercise">运动</option>
              <option value="other">其他</option>
            </select>
          </div>

          {/* 按钮 */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleAddRule}
              className="flex-1 py-2 rounded-lg bg-orange-500/30 hover:bg-orange-500/50 text-orange-300 text-sm transition-colors"
            >
              添加
            </button>
            <button
              onClick={() => setShowAddRule(false)}
              className="py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 text-sm transition-colors"
            >
              取消
            </button>
          </div>

          {/* 预设规则 */}
          <div className="pt-2 border-t border-white/10">
            <div className="text-xs text-gray-500 mb-2">或快速添加预设规则：</div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_RULES.filter(p => !rules.some(r => r.title === p.title)).slice(0, 4).map(preset => (
                <button
                  key={preset.title}
                  onClick={() => handleAddPreset(preset)}
                  className="px-2 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                >
                  {preset.icon} {preset.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 打分规则列表 */}
      {rules.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          还没有打分规则
          <br />
          <span className="text-xs">点击"添加打分规则"开始吧！</span>
        </div>
      ) : (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">打分规则</h4>
          {rules.map(rule => {
            const isScored = scoredRuleIds.has(rule.id);
            const existingScore = todayScores.find(s => s.ruleId === rule.id);

            return (
              <div
                key={rule.id}
                className={`p-3 rounded-xl border transition-all ${
                  isScored
                    ? 'bg-green-900/20 border-green-700/30'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{rule.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{rule.title}</div>
                    {rule.description && (
                      <div className="text-xs text-gray-400">{rule.description}</div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">满分 {rule.maxPoints}</span>
                </div>

                {isScored ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-400">
                      ✅ 已打分：{existingScore?.score}/{rule.maxPoints}
                    </span>
                    {existingScore?.comment && (
                      <span className="text-xs text-gray-500 truncate max-w-[150px]">
                        "{existingScore.comment}"
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* 打分滑块 */}
                    <div className="flex items-center gap-2">
                      {[...Array(rule.maxPoints)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setScoring(prev => ({ ...prev, [rule.id]: i + 1 }))}
                          className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                            (scoring[rule.id] || 0) > i
                              ? 'bg-amber-500/40 text-amber-300 ring-1 ring-amber-500/50'
                              : 'bg-white/10 text-gray-500 hover:bg-white/20'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    {/* 评语 */}
                    <input
                      type="text"
                      value={comments[rule.id] || ''}
                      onChange={e => setComments(prev => ({ ...prev, [rule.id]: e.target.value }))}
                      placeholder="爸妈评语（可选）"
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
                    />

                    {/* 提交按钮 */}
                    <button
                      onClick={() => handleSubmitScore(rule.id)}
                      disabled={scoring[rule.id] === undefined}
                      className="w-full py-1.5 rounded-lg bg-gradient-to-br from-amber-500/30 to-yellow-500/30 hover:from-amber-500/50 hover:to-yellow-500/50 disabled:opacity-30 disabled:cursor-not-allowed text-amber-300 text-xs transition-all"
                    >
                      提交打分
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
