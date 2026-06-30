/**
 * Dobi-elf v2.0 - Agent 驱动的新主页
 * 
 * 三栏布局：左栏导航 + 中栏对话 + 右栏按需展示
 * Agent 编排层驱动右栏内容
 */

"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import { useAgentChat } from '@/components/v2/useAgentChat';
import { getGrowthTree, waterTree } from '@/lib/agent/client';
import type { GrowthTreeNode } from '@/lib/growth/tree';
import { AnimatePresence, motion } from 'motion/react';
import {
  MessageSquare, Calendar, BookOpen, Star, TreePine,
  ChevronLeft, ChevronRight, Mic, Send, Square,
  Loader2, Sparkles, X, PenLine,
  Pencil, BrainCircuit, Hourglass, Trophy
} from 'lucide-react';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { PWAProvider } from '@/components/PWAProvider';

// 懒加载
const LoginPage = dynamic(() => import('@/components/auth/LoginPage'), {
  loading: () => <LoadingScreen />,
  ssr: false,
});
const GrowthTreePanel = dynamic(() => import('@/components/v2/GrowthTreePanel'), {
  loading: () => null,
  ssr: false,
});
const ParentScorePanel = dynamic(() => import('@/components/v2/ParentScorePanel'), {
  loading: () => null,
  ssr: false,
});
const KnowledgeCardPanel = dynamic(() => import('@/components/v2/KnowledgeCardPanel'), {
  loading: () => null,
  ssr: false,
});
const DiaryPanel = dynamic(() => import('@/components/v2/DiaryPanel'), {
  loading: () => null,
  ssr: false,
});
const ClassicPanels = dynamic(() => import('@/components/v2/ClassicPanels'), {
  loading: () => null,
  ssr: false,
});

// ===== 快捷操作 =====
const QUICK_ACTIONS = [
  { id: 'chat', label: '聊天', icon: MessageSquare, color: 'from-blue-500 to-blue-600' },
  { id: 'knowledge', label: '知识库', icon: BookOpen, color: 'from-purple-500 to-purple-600' },
  { id: 'diary', label: '魔法日记', icon: PenLine, color: 'from-pink-500 to-pink-600' },
  { id: 'tree', label: '成长之树', icon: TreePine, color: 'from-green-500 to-green-600' },
  { id: 'score', label: '亲子打分', icon: Star, color: 'from-amber-500 to-amber-600' },
  // v1 经典功能
  { id: 'schedule', label: '今日课表', icon: Calendar, color: 'from-cyan-500 to-cyan-600' },
  { id: 'homework', label: '作业本', icon: Pencil, color: 'from-rose-500 to-rose-600' },
  { id: 'exercise', label: '练习题', icon: BrainCircuit, color: 'from-violet-500 to-violet-600' },
  { id: 'focus', label: '专注沙漏', icon: Hourglass, color: 'from-teal-500 to-teal-600' },
  { id: 'achievements', label: '我的宝藏', icon: Trophy, color: 'from-yellow-500 to-yellow-600' },
];

// ===== 类型 =====
type LeftTab = 'chat' | 'knowledge' | 'diary' | 'tree' | 'score' | 'schedule' | 'homework' | 'exercise' | 'focus' | 'achievements';
type PanelType = 'none' | 'knowledge_card' | 'exercise' | 'schedule' | 'homework' | 'image' | 'growth_tree' | 'parent_score' | 'profile' | 'diary' | 'focus' | 'achievements';

// ===== 主页面 =====
export default function PageV2() {
  const { user, isAuthReady, showLoginModal, showRegisterModal, authError, login, childLogin, register, logout, setShowLoginModal, setShowRegisterModal } = useAuth();
  const agentChat = useAgentChat();

  // ===== UI 状态 =====
  const [leftTab, setLeftTab] = useState<LeftTab>('chat');
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightOpen, setIsRightOpen] = useState(false);
  const [rightPanelType, setRightPanelType] = useState<PanelType>('none');
  const [rightPanelData, setRightPanelData] = useState<Record<string, unknown> | undefined>();
  const [rightPanelTitle, setRightPanelTitle] = useState('');
  const [growthTree, setGrowthTree] = useState<GrowthTreeNode | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [waterMessage, setWaterMessage] = useState<string | null>(null);

  // 语音输入 ref
  const recognitionRef = useRef<any>(null);

  // ===== Agent 驱动右栏 =====
  useEffect(() => {
    if (agentChat.panelAction) {
      const action = agentChat.panelAction;
      setRightPanelType(action.type);
      setRightPanelTitle(action.title || '');
      setRightPanelData(action.data);
      if (action.open) {
        setIsRightOpen(true);
      }
    }
  }, [agentChat.panelAction]);

  // ===== 加载成长之树 =====
  useEffect(() => {
    if (user) {
      getGrowthTree().then(res => setGrowthTree(res.tree)).catch(() => {});
    }
  }, [user]);

  // ===== 浇水 =====
  const handleWater = useCallback(async () => {
    try {
      const res = await waterTree();
      setWaterMessage(res.message);
      setGrowthTree(res.tree);
      setTimeout(() => setWaterMessage(null), 3000);
    } catch {
      setWaterMessage('浇水失败了，再试试？');
      setTimeout(() => setWaterMessage(null), 3000);
    }
  }, []);

  // ===== 语音输入 =====
  const toggleVoice = useCallback(() => {
    if (isVoiceActive) {
      // 停止录音
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsVoiceActive(false);
      return;
    }

    // 启动录音
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('你的浏览器不支持语音输入，请使用 Chrome 浏览器');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      agentChat.handleInputChange(transcript);
    };

    recognition.onerror = () => {
      setIsVoiceActive(false);
    };

    recognition.onend = () => {
      setIsVoiceActive(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsVoiceActive(true);
  }, [isVoiceActive, agentChat]);

  // ===== 发送消息 =====
  const handleSend = useCallback(() => {
    if (agentChat.input.trim()) {
      agentChat.sendMessage(agentChat.input.trim());
    }
  }, [agentChat]);

  // ===== 加载状态 =====
  if (!isAuthReady) return <LoadingScreen />;

  // ===== 未登录 =====
  if (!user) {
    return (
      <LoginPage
        showLogin={showLoginModal}
        showRegister={showRegisterModal}
        error={authError}
        onLogin={login}
        onRegister={register}
        onChildLogin={childLogin}
        onCloseLogin={() => setShowLoginModal(false)}
        onCloseRegister={() => setShowRegisterModal(false)}
      />
    );
  }

  // ===== 主界面 =====
  return (
    <PWAProvider>
      <div className="h-screen w-screen flex bg-[#0a0502] text-white overflow-hidden">
        {/* ===== 左栏 ===== */}
        <div
          className={`flex-shrink-0 transition-all duration-300 border-r border-orange-900/30 ${
            isLeftCollapsed ? 'w-14' : 'w-56'
          } bg-black/40 backdrop-blur-sm flex flex-col`}
        >
          {/* 折叠按钮 */}
          <div className="flex items-center justify-between p-3 border-b border-orange-900/20">
            {!isLeftCollapsed && (
              <span className="text-sm font-bold text-orange-400">🧦 多比</span>
            )}
            <button
              onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
              className="p-1.5 rounded-lg hover:bg-orange-900/30 transition-colors"
            >
              {isLeftCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* 用户信息 */}
          {!isLeftCollapsed && (
            <div className="p-3 border-b border-orange-900/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-sm font-bold">
                  {user.displayName?.[0] || user.username?.[0] || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{user.displayName || user.username}</div>
                  <div className="text-xs text-gray-400">
                    {growthTree ? `${growthTree.treeStage}` : '魔法学徒'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 快捷操作 */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {QUICK_ACTIONS.map(action => {
              const Icon = action.icon;
              const isActive = leftTab === action.id;
              return (
                <div key={action.id}>
                {action.id === 'schedule' && (
                  <div className="my-2 border-t border-orange-900/20" />
                )}
                <button
                  onClick={() => {
                    setLeftTab(action.id as LeftTab);
                    if (action.id === 'tree') {
                      setRightPanelType('growth_tree');
                      setRightPanelTitle('成长之树');
                      setIsRightOpen(true);
                    } else if (action.id === 'score') {
                      setRightPanelType('parent_score');
                      setRightPanelTitle('亲子打分');
                      setIsRightOpen(true);
                    } else if (action.id === 'diary') {
                      setRightPanelType('diary');
                      setRightPanelTitle('魔法日记');
                      setIsRightOpen(true);
                    } else if (action.id === 'schedule') {
                      setRightPanelType('schedule');
                      setRightPanelTitle('今日课表');
                      setIsRightOpen(true);
                    } else if (action.id === 'homework') {
                      setRightPanelType('homework');
                      setRightPanelTitle('作业本');
                      setIsRightOpen(true);
                    } else if (action.id === 'exercise') {
                      setRightPanelType('exercise');
                      setRightPanelTitle('练习题');
                      setIsRightOpen(true);
                    } else if (action.id === 'focus') {
                      setRightPanelType('focus');
                      setRightPanelTitle('专注沙漏');
                      setIsRightOpen(true);
                    } else if (action.id === 'achievements') {
                      setRightPanelType('achievements');
                      setRightPanelTitle('我的宝藏');
                      setIsRightOpen(true);
                    } else {
                      setIsRightOpen(false);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-orange-500/20 text-orange-400'
                      : 'hover:bg-white/5 text-gray-300'
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
                <div className="text-xs text-gray-400 mt-1">
                  等级 Lv.{growthTree.treeLevel} · {growthTree.totalPoints} 积分
                </div>
                <button
                  onClick={handleWater}
                  className="mt-2 w-full py-1.5 text-xs rounded-lg bg-green-600/30 hover:bg-green-600/50 transition-colors text-green-300"
                >
                  💧 浇水
                </button>
                {waterMessage && (
                  <div className="mt-1 text-xs text-green-400 text-center">{waterMessage}</div>
                )}
              </div>
            )}
          </div>

          {/* 底部：设置 */}
          {!isLeftCollapsed && (
            <div className="p-2 border-t border-orange-900/20">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-gray-400 text-sm transition-colors"
              >
                <X size={16} />
                <span>退出登录</span>
              </button>
            </div>
          )}
        </div>

        {/* ===== 中栏：聊天区 ===== */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* 聊天消息 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {agentChat.messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white'
                      : 'bg-white/10 backdrop-blur-sm text-gray-100'
                  }`}
                >
                  {msg.role === 'model' && (
                    <div className="text-xs text-orange-400 mb-1">🧦 多比</div>
                  )}
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </div>
                  {/* 意图标签 */}
                  {msg.role === 'model' && i === agentChat.messages.length - 1 && agentChat.lastIntent && (
                    <div className="mt-2 text-xs text-gray-500">
                      {agentChat.toolsUsed.length > 0 && (
                        <span className="mr-2">🔧 {agentChat.toolsUsed.join(', ')}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {agentChat.isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3">
                  <div className="text-xs text-orange-400 mb-1">🧦 多比</div>
                  <div className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-orange-400" />
                    <span className="text-sm text-gray-400">正在思考...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 输入区 */}
          <div className="p-4 border-t border-orange-900/20">
            <div className="flex items-center gap-2 max-w-3xl mx-auto">
              {/* 语音按钮 */}
              <button
                onClick={toggleVoice}
                className={`flex-shrink-0 p-3 rounded-xl transition-all ${
                  isVoiceActive
                    ? 'bg-red-500/30 text-red-400 animate-pulse'
                    : 'bg-white/10 hover:bg-white/20 text-gray-400'
                }`}
                title={isVoiceActive ? '点击停止' : '语音输入'}
              >
                {isVoiceActive ? <Square size={18} /> : <Mic size={18} />}
              </button>

              {/* 输入框 */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={agentChat.input}
                  onChange={e => agentChat.handleInputChange(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="输入你的问题... 按回车发送"
                  className="w-full bg-white/10 backdrop-blur-sm border border-orange-900/30 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30"
                  disabled={agentChat.isLoading}
                />
              </div>

              {/* 发送按钮 */}
              <button
                onClick={handleSend}
                disabled={agentChat.isLoading || !agentChat.input.trim()}
                className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {agentChat.isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>

            {/* 快捷按钮 */}
            <div className="flex gap-2 mt-3 max-w-3xl mx-auto overflow-x-auto pb-1">
              {[
                { label: '📚 查课表', text: '今天有什么课？' },
                { label: '📝 查作业', text: '我的作业完成了吗？' },
                { label: '🧮 出数学题', text: '帮我出几道数学题' },
                { label: '🌱 成长之树', text: '看看我的成长之树' },
                { label: '⭐ 今天打分', text: '今天的亲子打分怎么样？' },
                { label: '📝 写日记', text: '我想写一篇魔法日记' },
              ].map(q => (
                <button
                  key={q.label}
                  onClick={() => {
                    agentChat.handleInputChange(q.text);
                    agentChat.sendMessage(q.text);
                  }}
                  className="flex-shrink-0 px-3 py-1.5 text-xs rounded-full bg-white/10 hover:bg-white/20 text-gray-300 transition-colors border border-white/10"
                  disabled={agentChat.isLoading}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ===== 右栏：按需展示 ===== */}
        <AnimatePresence>
          {isRightOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 360, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 border-l border-orange-900/30 bg-black/40 backdrop-blur-sm flex flex-col overflow-hidden"
            >
              {/* 右栏头部 */}
              <div className="flex items-center justify-between p-3 border-b border-orange-900/20">
                <h3 className="text-sm font-bold text-orange-400">
                  {rightPanelTitle || '展示窗'}
                </h3>
                <button
                  onClick={() => {
                    setIsRightOpen(false);
                    setRightPanelType('none');
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* 右栏内容 */}
              <div className="flex-1 overflow-y-auto p-3">
                {rightPanelType === 'growth_tree' && (
                  <GrowthTreePanel tree={growthTree} onWater={handleWater} waterMessage={waterMessage} />
                )}
                {rightPanelType === 'parent_score' && (
                  <ParentScorePanel userId={user.id} />
                )}
                {rightPanelType === 'diary' && (
                  <DiaryPanel />
                )}
                {rightPanelType === 'knowledge_card' && (
                  <KnowledgeCardPanel
                    refs={agentChat.knowledgeRefs}
                    data={rightPanelData}
                    title={rightPanelTitle}
                  />
                )}
                {rightPanelType === 'schedule' && (
                  <ClassicPanels type="schedule" userId={user.id} />
                )}
                {rightPanelType === 'homework' && (
                  <ClassicPanels type="homework" userId={user.id} />
                )}
                {rightPanelType === 'exercise' && (
                  <ClassicPanels type="exercise" userId={user.id} />
                )}
                {rightPanelType === 'focus' && (
                  <ClassicPanels type="focus" userId={user.id} />
                )}
                {rightPanelType === 'achievements' && (
                  <ClassicPanels type="achievements" userId={user.id} />
                )}
                {rightPanelType === 'image' && (
                  <div className="text-sm text-gray-400 text-center py-8">
                    🎨 图片展示功能开发中...
                  </div>
                )}
                {rightPanelType === 'profile' && (
                  <div className="text-sm text-gray-400 text-center py-8">
                    👤 个人展示功能开发中... (v2.1)
                  </div>
                )}
                {rightPanelType === 'none' && (
                  <div className="text-sm text-gray-500 text-center py-8">
                    ✨ 多比会根据对话内容<br/>自动展示相关信息
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PWAProvider>
  );
}
