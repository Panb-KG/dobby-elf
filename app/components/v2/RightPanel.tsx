/**
 * 右栏面板 - 展示知识卡片、练习、图片等
 * v2.0 新增
 */

"use client";

import { BookOpen, Dumbbell, Calendar, FileText, Image, User, X } from 'lucide-react';
import type { PanelAction } from '@/lib/agent/types';

interface RightPanelProps {
  panelAction: PanelAction | null;
  onClose: () => void;
  knowledgeData?: any;
}

const PANEL_ICONS: Record<string, any> = {
  knowledge_card: BookOpen,
  exercise: Dumbbell,
  schedule: Calendar,
  homework: FileText,
  image: Image,
  growth_tree: BookOpen,
  parent_score: BookOpen,
  profile: User,
};

export default function RightPanel({ panelAction, onClose, knowledgeData }: RightPanelProps) {
  if (!panelAction) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
        <SparklesIcon />
        <p className="text-sm text-center mt-3">
          多比会根据对话内容<br />自动在这里展示相关信息
        </p>
      </div>
    );
  }

  const Icon = PANEL_ICONS[panelAction.type] || BookOpen;

  return (
    <div className="p-4 space-y-3">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={18} className="text-orange-400" />
          <h3 className="text-sm font-bold text-orange-400">
            {panelAction.title || getPanelTitle(panelAction.type)}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* 内容 */}
      <div className="space-y-3">
        {panelAction.type === 'knowledge_card' && (
          <KnowledgeCard data={knowledgeData || panelAction.data} />
        )}
        {panelAction.type === 'exercise' && (
          <ExerciseCard data={panelAction.data} />
        )}
        {panelAction.type === 'schedule' && (
          <div className="text-sm text-gray-400 text-center py-4">
            📅 今日课程表
          </div>
        )}
        {panelAction.type === 'homework' && (
          <div className="text-sm text-gray-400 text-center py-4">
            📝 今日作业
          </div>
        )}
        {panelAction.type === 'image' && (
          <ImageCard data={panelAction.data} />
        )}
        {panelAction.type === 'profile' && (
          <div className="text-sm text-gray-400 text-center py-4">
            👤 个人展示（v2.1 开发中）
          </div>
        )}
      </div>
    </div>
  );
}

function getPanelTitle(type: string): string {
  const titles: Record<string, string> = {
    knowledge_card: '知识卡片',
    exercise: '练习题',
    schedule: '课程表',
    homework: '作业',
    image: '图片',
    growth_tree: '成长之树',
    parent_score: '亲子打分',
    profile: '个人展示',
    none: '',
  };
  return titles[type] || '展示窗';
}

function KnowledgeCard({ data }: { data?: any }) {
  if (!data) {
    return (
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <p className="text-sm text-gray-400">多比找到了一些相关知识</p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      {data.title && <h4 className="text-sm font-medium text-orange-300 mb-2">{data.title}</h4>}
      {data.content && (
        <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{data.content}</p>
      )}
      {data.source && (
        <div className="mt-2 text-xs text-gray-500">📖 {data.source}</div>
      )}
    </div>
  );
}

function ExerciseCard({ data }: { data?: any }) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      <h4 className="text-sm font-medium text-blue-300 mb-2">🧮 练习题</h4>
      {data?.question ? (
        <div>
          <p className="text-sm text-gray-200">{data.question}</p>
          {data.options && (
            <div className="mt-3 space-y-1.5">
              {data.options.map((opt: string, i: number) => (
                <div
                  key={i}
                  className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs cursor-pointer transition-colors"
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
          {data.answer && (
            <details className="mt-3">
              <summary className="text-xs text-orange-400 cursor-pointer">查看解答</summary>
              <p className="mt-2 text-xs text-gray-300">{data.answer}</p>
              {data.explanation && (
                <p className="mt-1 text-xs text-gray-400">{data.explanation}</p>
              )}
            </details>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-400">多比正在准备练习题...</p>
      )}
    </div>
  );
}

function ImageCard({ data }: { data?: any }) {
  if (data?.imageUrl) {
    return (
      <div className="rounded-xl overflow-hidden">
        <img src={data.imageUrl} alt={data.title || '插图'} className="w-full h-auto" />
        {data.title && <p className="text-xs text-gray-400 mt-2 text-center">{data.title}</p>}
      </div>
    );
  }
  return (
    <div className="text-sm text-gray-400 text-center py-4">
      🎨 图片加载中...
    </div>
  );
}

function SparklesIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 4L28 18L42 14L32 24L42 34L28 30L24 44L20 30L6 34L16 24L6 14L20 18L24 4Z" fill="url(#grad)" opacity="0.3"/>
      <defs>
        <linearGradient id="grad" x1="6" y1="4" x2="42" y2="44">
          <stop stopColor="#F97316"/>
          <stop offset="1" stopColor="#F59E0B"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
