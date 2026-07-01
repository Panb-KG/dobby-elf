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
import LoadingScreen from '@/components/ui/LoadingScreen';
import { PWAProvider } from '@/components/PWAProvider';
import { LeftSidebar } from '@/components/v2/LeftSidebar';
import { ChatArea } from '@/components/v2/ChatArea';
import { RightPanel } from '@/components/v2/RightPanel';
import type { LeftTab, PanelType } from '@/components/v2/v2-constants';
import { requiresAuth, actionRequiresAuth, getAuthPrompt } from '@/lib/auth-guard';

const LoginPage = dynamic(() => import('@/components/auth/LoginPage'), {
  loading: () => <LoadingScreen />,
  ssr: false,
});

export default function PageV2() {
  const { user, isGuest, isAuthReady, showLoginModal, showRegisterModal, authError, login, childLogin, register, autoRegister, logout, setShowLoginModal, setShowRegisterModal } = useAuth();
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

  const recognitionRef = useRef<any>(null);

  // ===== Agent 驱动右栏 =====
  useEffect(() => {
    if (agentChat.panelAction) {
      const action = agentChat.panelAction;
      
      // 检查是否需要登录
      if (isGuest && requiresAuth(action.type)) {
        // 访客尝试访问需要登录的功能，显示提示并打开登录弹窗
        alert(getAuthPrompt(action.type));
        setShowLoginModal(true);
        return;
      }
      
      setRightPanelType(action.type);
      setRightPanelTitle(action.title || '');
      setRightPanelData(action.data);
      if (action.open) setIsRightOpen(true);
    }
  }, [agentChat.panelAction, isGuest]);

  // ===== 加载成长之树 =====
  useEffect(() => {
    if (user && !isGuest) {
      getGrowthTree().then(res => setGrowthTree(res.tree)).catch(() => {});
    }
  }, [user, isGuest]);

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
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsVoiceActive(false);
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('你的浏览器不支持语音输入，请使用 Chrome 浏览器'); return; }

    const recognition = new SR();
    recognition.lang = 'zh-CN';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript).join('');
      agentChat.handleInputChange(transcript);
    };
    recognition.onerror = () => setIsVoiceActive(false);
    recognition.onend = () => setIsVoiceActive(false);

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

  // ===== 左栏操作点击 =====
  const handleActionClick = useCallback((actionId: string) => {
    // 检查是否需要登录
    if (isGuest && actionRequiresAuth(actionId)) {
      alert(getAuthPrompt(actionId));
      setShowLoginModal(true);
      return;
    }
    
    setLeftTab(actionId as LeftTab);
    const panelMap: Record<string, { type: PanelType; title: string }> = {
      tree: { type: 'growth_tree', title: '成长之树' },
      score: { type: 'parent_score', title: '亲子打分' },
      diary: { type: 'diary', title: '魔法日记' },
      schedule: { type: 'schedule', title: '今日课表' },
      homework: { type: 'homework', title: '作业本' },
      exercise: { type: 'exercise', title: '练习题' },
      focus: { type: 'focus', title: '专注沙漏' },
      achievements: { type: 'achievements', title: '我的宝藏' },
    };
    const panel = panelMap[actionId];
    if (panel) {
      setRightPanelType(panel.type);
      setRightPanelTitle(panel.title);
      setIsRightOpen(true);
    } else {
      setIsRightOpen(false);
    }
  }, [isGuest]);

  // ===== 加载状态 =====
  if (!isAuthReady) {
    console.log('[Page] Waiting for auth to be ready...');
    return <LoadingScreen />;
  }

  console.log('[Page] Auth ready, rendering main UI, user:', !!user, 'isGuest:', isGuest);

  // ===== 主界面（始终显示，包括访客）=====
  // 注意：移除了强制登录检查，访客也可以使用公共功能
  return (
    <PWAProvider>
      <div className="h-screen w-screen flex bg-[#0a0502] text-white overflow-hidden">
        <LeftSidebar
          isLeftCollapsed={isLeftCollapsed}
          onToggleCollapse={() => setIsLeftCollapsed(!isLeftCollapsed)}
          user={user}
          isGuest={isGuest}
          growthTree={growthTree}
          leftTab={leftTab}
          onActionClick={handleActionClick}
          onWater={handleWater}
          waterMessage={waterMessage}
          onLogout={logout}
          onLogin={() => setShowLoginModal(true)}
        />

        <ChatArea
          agentChat={agentChat}
          isVoiceActive={isVoiceActive}
          onToggleVoice={toggleVoice}
          onSend={handleSend}
        />

        <RightPanel
          isRightOpen={isRightOpen}
          panelType={rightPanelType}
          panelTitle={rightPanelTitle}
          panelData={rightPanelData}
          growthTree={growthTree}
          userId={user?.id || 'guest'}
          knowledgeRefs={agentChat.knowledgeRefs}
          onWater={handleWater}
          waterMessage={waterMessage}
          onClose={() => { setIsRightOpen(false); setRightPanelType('none'); }}
        />
      </div>
    </PWAProvider>
  );
}
