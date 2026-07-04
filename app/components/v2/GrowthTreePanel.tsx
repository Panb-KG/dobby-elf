/**
 * 成长之树面板 - 右栏展示
 * v2.0 新增
 */

"use client";

import { useState, useCallback, useEffect } from 'react';
import { Droplets, TrendingUp, Award } from 'lucide-react';
import type { GrowthTreeNode } from '@/lib/growth/tree';
import { getPointRecords, waterTree } from '@/lib/agent/client';

interface GrowthTreePanelProps {
  tree: GrowthTreeNode | null;
  onWater: () => void;
  waterMessage: string | null;
}

// 成长阶段定义
const TREE_STAGES = [
  { minLevel: 1, maxLevel: 10, name: '种子', emoji: '🌱', color: 'from-yellow-800/40 to-yellow-900/40' },
  { minLevel: 11, maxLevel: 25, name: '嫩芽', emoji: '🌿', color: 'from-green-800/40 to-green-900/40' },
  { minLevel: 26, maxLevel: 40, name: '小树', emoji: '🌳', color: 'from-emerald-800/40 to-emerald-900/40' },
  { minLevel: 41, maxLevel: 60, name: '大树', emoji: '🌲', color: 'from-teal-800/40 to-teal-900/40' },
  { minLevel: 61, maxLevel: 80, name: '参天树', emoji: '🏔️', color: 'from-blue-800/40 to-blue-900/40' },
  { minLevel: 81, maxLevel: 100, name: '魔法之树', emoji: '✨', color: 'from-purple-800/40 to-purple-900/40' },
];

export default function GrowthTreePanel({ tree, onWater, waterMessage }: GrowthTreePanelProps) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPointRecords(10).then(res => setRecords(res.records || [])).catch(() => {});
  }, [tree]);

  if (!tree) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <span className="text-4xl mb-3">🌱</span>
        <p className="text-sm">成长之树加载中...</p>
      </div>
    );
  }

  const treeLevel = tree.treeLevel ?? 1;
  const totalPoints = tree.totalPoints ?? 0;
  const waterCount = tree.waterCount ?? 0;

  // 当前阶段进度
  const currentStage = TREE_STAGES.find(s => treeLevel >= s.minLevel && treeLevel <= s.maxLevel) || TREE_STAGES[0];
  const nextStage = TREE_STAGES.find(s => s.minLevel > treeLevel);
  const progressToNext = nextStage
    ? ((treeLevel - currentStage.minLevel) / (nextStage.minLevel - currentStage.minLevel)) * 100
    : 100;

  return (
    <div className="space-y-4">
      {/* 树的展示 */}
      <div className={`p-4 rounded-2xl bg-gradient-to-br ${currentStage.color} border border-white/10 text-center`}>
        <div className="text-6xl mb-2">{currentStage.emoji}</div>
        <div className="text-lg font-bold">{currentStage.name}</div>
        <div className="text-sm text-gray-400 mt-1">
          Lv.{treeLevel} · {totalPoints} 积分
        </div>

        {/* 升级进度条 */}
        {nextStage && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{currentStage.name}</span>
              <span>{nextStage.name} Lv.{nextStage.minLevel}</span>
            </div>
            <div className="h-2 bg-black/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {nextStage.minLevel - treeLevel} 级后升级为 {nextStage.emoji} {nextStage.name}
            </div>
          </div>
        )}
      </div>

      {/* 浇水按钮 */}
      <button
        onClick={onWater}
        className="w-full py-3 rounded-xl bg-gradient-to-br from-blue-600/40 to-blue-700/40 hover:from-blue-600/60 hover:to-blue-700/60 border border-blue-500/30 transition-all flex items-center justify-center gap-2 text-blue-300"
      >
        <Droplets size={20} />
        <span>💧 浇水 (+10 积分)</span>
      </button>

      {waterMessage && (
        <div className="text-center text-sm text-green-400 py-1 animate-pulse">
          {waterMessage}
        </div>
      )}

      {/* 统计 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
          <div className="text-2xl font-bold text-orange-400">{totalPoints}</div>
          <div className="text-xs text-gray-400 mt-1">总积分</div>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
          <div className="text-2xl font-bold text-blue-400">{waterCount}</div>
          <div className="text-xs text-gray-400 mt-1">浇水次数</div>
        </div>
      </div>

      {/* 积分记录 */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
          <TrendingUp size={14} />
          最近积分
        </h4>
        {records.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-2">暂无记录</p>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {records.slice(0, 10).map(record => (
              <div
                key={record.id}
                className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-white/5 text-xs"
              >
                <span className="text-gray-300 truncate flex-1">{record.reason}</span>
                <span className={`font-medium ml-2 ${record.points >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {record.points >= 0 ? '+' : ''}{record.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 阶段路线 */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
          <Award size={14} />
          成长路线
        </h4>
        <div className="space-y-1">
          {TREE_STAGES.map(stage => {
            const isUnlocked = treeLevel >= stage.minLevel;
            const isCurrent = treeLevel >= stage.minLevel && treeLevel <= stage.maxLevel;
            return (
              <div
                key={stage.name}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all ${
                  isCurrent
                    ? 'bg-orange-500/20 border border-orange-500/30'
                    : isUnlocked
                    ? 'bg-white/5'
                    : 'bg-white/3'
                }`}
              >
                <span className={`text-lg ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
                  {stage.emoji}
                </span>
                <span className={`flex-1 ${isCurrent ? 'text-orange-400 font-medium' : isUnlocked ? 'text-gray-300' : 'text-gray-600'}`}>
                  {stage.name}
                </span>
                <span className="text-gray-500">
                  Lv.{stage.minLevel}-{stage.maxLevel}
                </span>
                {isCurrent && (
                  <span className="text-xs bg-orange-500/30 text-orange-300 px-1.5 py-0.5 rounded">
                    当前
                  </span>
                )}
                {isUnlocked && !isCurrent && (
                  <span className="text-xs text-green-400">✅</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
