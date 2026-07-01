"use client";

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { PRESET_RULES } from '@/lib/growth';
import { addScoreRule as apiAddScoreRule } from '@/lib/agent/client';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface ScoreRuleFormProps {
  rules: any[];
  onAdded: () => void;
  onCancel: () => void;
}

const ICON_OPTIONS = ['⭐', '📚', '💪', '📖', '🏃', '😴', '🧹', '🤝', '📵', '❤️', '🎯', '🌟'];

export function ScoreRuleForm({ rules, onAdded, onCancel }: ScoreRuleFormProps) {
  const [newRule, setNewRule] = useState({
    title: '', description: '', maxPoints: 5, icon: '⭐', category: 'study',
  });

  // 对话框状态
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean;
    message: string;
    type: 'error' | 'success' | 'warning' | 'info';
  }>({ isOpen: false, message: '', type: 'info' });

  const handleAddRule = async () => {
    if (!newRule.title.trim()) return;
    try {
      await apiAddScoreRule({
        title: newRule.title.trim(), description: newRule.description.trim(),
        maxPoints: newRule.maxPoints, icon: newRule.icon, category: newRule.category,
      });
      setNewRule({ title: '', description: '', maxPoints: 5, icon: '⭐', category: 'study' });
      onAdded();
    } catch (e) {
      setDialogConfig({ isOpen: true, message: '添加规则失败', type: 'error' });
    }
  };

  const handleAddPreset = async (preset: any) => {
    try { await apiAddScoreRule(preset); onAdded(); }
    catch (e) { setDialogConfig({ isOpen: true, message: '添加失败', type: 'error' }); }
  };

  return (
    <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
      <div className="text-sm font-medium text-orange-400 mb-2">新规则</div>
      <div className="flex gap-1 flex-wrap">
        {ICON_OPTIONS.map(icon => (
          <button key={icon} onClick={() => setNewRule(prev => ({ ...prev, icon }))}
            className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all ${newRule.icon === icon ? 'bg-orange-500/30 ring-1 ring-orange-500' : 'hover:bg-white/10'}`}>
            {icon}
          </button>
        ))}
      </div>
      <input type="text" value={newRule.title} onChange={e => setNewRule(prev => ({ ...prev, title: e.target.value }))}
        placeholder="规则名称，如：按时完成作业"
        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50" />
      <input type="text" value={newRule.description} onChange={e => setNewRule(prev => ({ ...prev, description: e.target.value }))}
        placeholder="描述（可选）"
        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50" />
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">最高分</span>
        <input type="number" value={newRule.maxPoints} onChange={e => setNewRule(prev => ({ ...prev, maxPoints: parseInt(e.target.value) || 1 }))}
          min={1} max={10} className="w-16 bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white text-center focus:outline-none focus:border-orange-500/50" />
        <span className="text-xs text-gray-400">分</span>
        <select value={newRule.category} onChange={e => setNewRule(prev => ({ ...prev, category: e.target.value }))}
          className="ml-auto bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-gray-300 focus:outline-none">
          <option value="study">学习</option><option value="life">生活</option>
          <option value="behavior">行为</option><option value="exercise">运动</option>
          <option value="other">其他</option>
        </select>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={handleAddRule} className="flex-1 py-2 rounded-lg bg-orange-500/30 hover:bg-orange-500/50 text-orange-300 text-sm transition-colors">添加</button>
        <button onClick={onCancel} className="py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 text-sm transition-colors">取消</button>
      </div>
      <div className="pt-2 border-t border-white/10">
        <div className="text-xs text-gray-500 mb-2">或快速添加预设规则：</div>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_RULES.filter(p => !rules.some(r => r.title === p.title)).slice(0, 4).map(preset => (
            <button key={preset.title} onClick={() => handleAddPreset(preset)}
              className="px-2 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors">
              {preset.icon} {preset.title}
            </button>
          ))}
        </div>
      </div>
      
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

export function ScoreRuleAddButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full py-2.5 rounded-xl border border-dashed border-white/20 hover:border-white/40 text-gray-400 hover:text-gray-200 transition-all flex items-center justify-center gap-2 text-sm">
      <Plus size={16} /> 添加打分规则
    </button>
  );
}
