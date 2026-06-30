/**
 * v2.0 右栏面板组件
 */

"use client";

import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { GrowthTreeNode } from '@/lib/growth/tree';
import type { PanelType } from './v2-constants';
import type { UseAgentChatReturn } from './useAgentChat';

const GrowthTreePanel = dynamic(() => import('@/components/v2/GrowthTreePanel'), { loading: () => null, ssr: false });
const ParentScorePanel = dynamic(() => import('@/components/v2/ParentScorePanel'), { loading: () => null, ssr: false });
const KnowledgeCardPanel = dynamic(() => import('@/components/v2/KnowledgeCardPanel'), { loading: () => null, ssr: false });
const DiaryPanel = dynamic(() => import('@/components/v2/DiaryPanel'), { loading: () => null, ssr: false });
const ClassicPanels = dynamic(() => import('@/components/v2/ClassicPanels'), { loading: () => null, ssr: false });

interface RightPanelProps {
  isRightOpen: boolean;
  panelType: PanelType;
  panelTitle: string;
  panelData: Record<string, unknown> | undefined;
  growthTree: GrowthTreeNode | null;
  userId: string;
  knowledgeRefs: UseAgentChatReturn['knowledgeRefs'];
  onWater: () => void;
  waterMessage: string | null;
  onClose: () => void;
}

export function RightPanel({
  isRightOpen, panelType, panelTitle, panelData,
  growthTree, userId, knowledgeRefs, onWater, waterMessage, onClose,
}: RightPanelProps) {
  return (
    <AnimatePresence>
      {isRightOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 360, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 border-l border-orange-900/30 bg-black/40 backdrop-blur-sm flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between p-3 border-b border-orange-900/20">
            <h3 className="text-sm font-bold text-orange-400">{panelTitle || '展示窗'}</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {panelType === 'growth_tree' && (
              <GrowthTreePanel tree={growthTree} onWater={onWater} waterMessage={waterMessage} />
            )}
            {panelType === 'parent_score' && <ParentScorePanel userId={userId} />}
            {panelType === 'diary' && <DiaryPanel />}
            {panelType === 'knowledge_card' && (
              <KnowledgeCardPanel refs={knowledgeRefs} data={panelData} title={panelTitle} />
            )}
            {(panelType === 'schedule' || panelType === 'homework' || panelType === 'exercise' ||
              panelType === 'focus' || panelType === 'achievements') && (
              <ClassicPanels type={panelType as any} userId={userId} />
            )}
            {panelType === 'image' && (
              <div className="text-sm text-gray-400 text-center py-8">🎨 图片展示功能开发中...</div>
            )}
            {panelType === 'profile' && (
              <div className="text-sm text-gray-400 text-center py-8">👤 个人展示功能开发中... (v2.1)</div>
            )}
            {panelType === 'none' && (
              <div className="text-sm text-gray-500 text-center py-8">
                ✨ 多比会根据对话内容<br/>自动展示相关信息
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
