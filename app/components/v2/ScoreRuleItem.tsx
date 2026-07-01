"use client";

import { useState } from 'react';
import { recordDailyScore as apiRecordDailyScore } from '@/lib/agent/client';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface ScoreRuleItemProps {
  rule: any;
  isScored: boolean;
  existingScore: any;
  onScored: () => void;
}

export function ScoreRuleItem({ rule, isScored, existingScore, onScored }: ScoreRuleItemProps) {
  const [scoring, setScoring] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  
  // 对话框状态
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean;
    message: string;
    type: 'error' | 'success' | 'warning' | 'info';
  }>({ isOpen: false, message: '', type: 'info' });

  const handleSubmitScore = async (ruleId: string) => {
    const score = scoring[ruleId];
    if (score === undefined || score === null) return;
    try {
      await apiRecordDailyScore({
        ruleId, score, comment: comments[ruleId] || '',
        scoredBy: 'child', date: new Date().toISOString().split('T')[0],
      });
      setScoring(prev => { const next = { ...prev }; delete next[ruleId]; return next; });
      onScored();
    } catch (e: any) {
      setDialogConfig({ isOpen: true, message: e.message || '打分失败', type: 'error' });
    }
  };

  return (
    <div className={`p-3 rounded-xl border transition-all ${isScored ? 'bg-green-900/20 border-green-700/30' : 'bg-white/5 border-white/10'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{rule.icon}</span>
        <div className="flex-1">
          <div className="text-sm font-medium">{rule.title}</div>
          {rule.description && <div className="text-xs text-gray-400">{rule.description}</div>}
        </div>
        <span className="text-xs text-gray-500">满分 {rule.maxPoints}</span>
      </div>

      {isScored ? (
        <div className="flex items-center justify-between">
          <span className="text-sm text-green-400">✅ 已打分：{existingScore?.score}/{rule.maxPoints}</span>
          {existingScore?.comment && (
            <span className="text-xs text-gray-500 truncate max-w-[150px]">"{existingScore.comment}"</span>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {[...Array(rule.maxPoints)].map((_, i) => (
              <button key={i} onClick={() => setScoring(prev => ({ ...prev, [rule.id]: i + 1 }))}
                className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                  (scoring[rule.id] || 0) > i
                    ? 'bg-amber-500/40 text-amber-300 ring-1 ring-amber-500/50'
                    : 'bg-white/10 text-gray-500 hover:bg-white/20'
                }`}>
                {i + 1}
              </button>
            ))}
          </div>
          <input type="text" value={comments[rule.id] || ''} onChange={e => setComments(prev => ({ ...prev, [rule.id]: e.target.value }))}
            placeholder="爸妈评语（可选）"
            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50" />
          <button onClick={() => handleSubmitScore(rule.id)} disabled={scoring[rule.id] === undefined}
            className="w-full py-1.5 rounded-lg bg-gradient-to-br from-amber-500/30 to-yellow-500/30 hover:from-amber-500/50 hover:to-yellow-500/50 disabled:opacity-30 disabled:cursor-not-allowed text-amber-300 text-xs transition-all">
            提交打分
          </button>
        </div>
      )}
      
      {/* 错误提示对话框 */}
      <ConfirmDialog
        isOpen={dialogConfig.isOpen}
        message={dialogConfig.message}
        type={dialogConfig.type}
        showCancel={false}
        onConfirm={() => setDialogConfig({ isOpen: false, message: '', type: 'info' })}
      />
    </div>
  );
}
