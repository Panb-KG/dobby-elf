/**
 * v2.0 左栏导航组件
 */

"use client";

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { User } from '@/types';
import type { GrowthTreeNode } from '@/lib/growth/tree';
import { QUICK_ACTIONS, type LeftTab, type PanelType } from './v2-constants';

interface LeftSidebarProps {
  isLeftCollapsed: boolean;
  onToggleCollapse: () => void;
  user: User;
  isGuest: boolean; // 是否为访客
  growthTree: GrowthTreeNode | null;
  leftTab: LeftTab;
  onActionClick: (actionId: string) => void;
  onWater: () => void;
  waterMessage: string | null;
  onLogout: () => void;
  onLogin?: () => void; // 显示登录弹窗
}

export function LeftSidebar({
  isLeftCollapsed, onToggleCollapse, user, isGuest, growthTree,
  leftTab, onActionClick, onWater, waterMessage, onLogout, onLogin,
}: LeftSidebarProps) {
  return (
    <div className={`flex-shrink-0 transition-all duration-300 border-r border-orange-900/30 ${
      isLeftCollapsed ? 'w-14' : 'w-56'
    } bg-black/40 backdrop-blur-sm flex flex-col`}>
      {/* 折叠按钮 */}
      <div className="flex items-center justify-between p-3 border-b border-orange-900/20">
        {!isLeftCollapsed && <span className="text-sm font-bold text-orange-400">🧦 多比</span>}
        <button onClick={onToggleCollapse} className="p-1.5 rounded-lg hover:bg-orange-900/30 transition-colors">
          {isLeftCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* 用户信息 */}
      {!isLeftCollapsed && user && (
        <div className="p-3 border-b border-orange-900/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-sm font-bold">
              {user.displayName?.[0] || user.username?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user.displayName || user.username}</div>
              <div className="text-xs text-gray-400">
                {isGuest ? '👤 访客模式' : (growthTree ? `${growthTree.treeStage}` : '魔法学徒')}
              </div>
            </div>
          </div>
          
          {/* 访客提示登录 */}
          {isGuest && onLogin && (
            <button
              onClick={() => {
                // TODO: 暂时搁置登录注册流程
                alert('🔐 登录/注册功能开发中，敬请期待！');
              }}
              className="mt-2 w-full py-1.5 text-xs rounded-lg bg-blue-600/30 hover:bg-blue-600/50 transition-colors text-blue-300 font-medium"
            >
              🔐 登录/注册
            </button>
          )}
        </div>
      )}

      {/* 快捷操作 */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {QUICK_ACTIONS.map(action => {
          const Icon = action.icon;
          const isActive = leftTab === action.id;
          return (
            <div key={action.id}>
              {action.id === 'schedule' && <div className="my-2 border-t border-orange-900/20" />}
              <button
                onClick={() => onActionClick(action.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive ? 'bg-orange-500/20 text-orange-400' : 'hover:bg-white/5 text-gray-300'
                }`}
              >
                <Icon size={18} />
                {!isLeftCollapsed && <span className="text-sm">{action.label}</span>}
              </button>
            </div>
          );
        })}

        {/* 成长之树快速展示 */}
        {!isLeftCollapsed && growthTree && (
          <div className="mt-4 mx-2 p-3 rounded-xl bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-800/30">
            <div className="text-xs text-green-400 mb-1">🌱 成长之树</div>
            <div className="text-lg font-bold">{growthTree.treeStage}</div>
            <div className="text-xs text-gray-400 mt-1">等级 Lv.{growthTree.treeLevel} · {growthTree.totalPoints} 积分</div>
            <button onClick={onWater} className="mt-2 w-full py-1.5 text-xs rounded-lg bg-green-600/30 hover:bg-green-600/50 transition-colors text-green-300">
              💧 浇水
            </button>
            {waterMessage && <div className="mt-1 text-xs text-green-400 text-center">{waterMessage}</div>}
          </div>
        )}
      </div>

      {/* 底部：退出或登录 */}
      {!isLeftCollapsed && (
        <div className="p-2 border-t border-orange-900/20">
          {isGuest ? (
            <button
              onClick={() => {
                // TODO: 暂时搁置登录注册流程
                alert('🔐 登录/注册功能开发中，敬请期待！');
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-sm transition-colors font-medium"
            >
              🔐 <span>登录/注册以保存进度</span>
            </button>
          ) : (
            <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-gray-400 text-sm transition-colors">
              <X size={16} /><span>退出登录</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
