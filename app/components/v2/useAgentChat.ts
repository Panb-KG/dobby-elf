/**
 * useAgentChat Hook
 * 
 * 对接 Agent API 的聊天 Hook（支持会话管理）
 * v2.0 新增
 */

"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  agentChat,
  getConversationMessages,
  saveConversationMessages,
  createConversation,
  type ChatMessage,
  type AgentChatResponse,
} from '@/lib/agent/client';
import type { PanelAction, IntentType } from '@/lib/agent/types';
import type { Message } from '@/types';
import { StorageKeys, setStorage } from '@/lib/storage';

const MAX_HISTORY = 50;
const DOBI_GREETING = '呼啦啦！你好呀，小主人！我是你的学习小精灵多比  今天有什么想探索的知识魔法吗？✨';

export interface UseAgentChatReturn {
  messages: Message[];
  input: string;
  isLoading: boolean;
  sendMessage: (text: string) => Promise<void>;
  handleInputChange: (value: string) => void;
  abortChat: () => void;
  panelAction: PanelAction | null;
  lastIntent: IntentType | null;
  knowledgeRefs: string[];
  toolsUsed: string[];
  /** 当前会话 ID */
  currentConvId: string | null;
  /** 切换会话 */
  switchConversation: (convId: string) => Promise<void>;
  /** 新建会话 */
  newConversation: () => Promise<string>;
  /** 是否正在加载历史消息 */
  isLoadingHistory: boolean;
}

export function useAgentChat(): UseAgentChatReturn {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: DOBI_GREETING },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [panelAction, setPanelAction] = useState<PanelAction | null>(null);
  const [lastIntent, setLastIntent] = useState<IntentType | null>(null);
  const [knowledgeRefs, setKnowledgeRefs] = useState<string[]>([]);
  const [toolsUsed, setToolsUsed] = useState<string[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // 已保存的消息索引（避免重复保存）
  const savedCountRef = useRef(0);

  // 初始化：创建或恢复会话
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      // 尝试从 localStorage 恢复当前会话 ID
      const savedConvId = typeof window !== 'undefined'
        ? localStorage.getItem('dobi_current_conv_id')
        : null;

      if (savedConvId) {
        // 尝试加载历史消息
        setIsLoadingHistory(true);
        try {
          const data = await getConversationMessages(savedConvId);
          if (!cancelled && data.messages.length > 0) {
            const loaded: Message[] = data.messages.map(m => ({
              role: m.role === 'assistant' ? 'model' : m.role,
              text: m.content,
            }));
            setMessages(loaded);
            savedCountRef.current = loaded.length;
          } else if (!cancelled) {
            // 会话存在但没有消息，保留默认问候
            savedCountRef.current = 0;
          }
        } catch {
          // 加载失败，创建新会话
          if (!cancelled) {
            const data = await createConversation();
            setCurrentConvId(data.conversation.id);
            localStorage.setItem('dobi_current_conv_id', data.conversation.id);
            savedCountRef.current = 0;
          }
        } finally {
          if (!cancelled) setIsLoadingHistory(false);
        }
        setCurrentConvId(savedConvId);
      } else {
        // 没有历史会话，创建新会话
        try {
          const data = await createConversation();
          if (!cancelled) {
            setCurrentConvId(data.conversation.id);
            localStorage.setItem('dobi_current_conv_id', data.conversation.id);
            savedCountRef.current = 0;
          }
        } catch {
          // API 不可用时降级为 localStorage 模式
          if (!cancelled) savedCountRef.current = 0;
        }
      }
    };

    init();
    return () => { cancelled = true; };
  }, []);

  // 自动保存聊天记录到 localStorage（降级备份）
  useEffect(() => {
    const timer = setTimeout(() => {
      setStorage(StorageKeys.CHAT_HISTORY, messages.slice(-MAX_HISTORY));
    }, 500);
    return () => clearTimeout(timer);
  }, [messages]);

  // 异步保存新消息到 Supabase
  const persistMessages = useCallback(async (convId: string, msgs: Message[]) => {
    const newMessages = msgs.slice(savedCountRef.current).map(m => ({
      role: m.role === 'model' ? 'assistant' : m.role,
      content: m.text || '',
    }));

    if (newMessages.length === 0) return;

    try {
      await saveConversationMessages(convId, newMessages);
      savedCountRef.current = msgs.length;
    } catch (err) {
      console.error('[useAgentChat] Persist error:', err);
    }
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const apiMessages: ChatMessage[] = messagesRef.current.map(m => ({
        role: m.role === 'model' ? 'assistant' : m.role,
        content: m.text || '',
      }));
      apiMessages.push({ role: 'user', content: text.trim() });

      const response = await agentChat(apiMessages);

      if (response.blocked) {
        const blockedMsg: Message = {
          role: 'model',
          text: response.text || '这个话题我们换个聊聊吧～',
        };
        setMessages(prev => {
          const next = [...prev, blockedMsg];
          // 异步保存
          if (currentConvId) persistMessages(currentConvId, next);
          return next;
        });
        return;
      }

      const aiMessage: Message = {
        role: 'model',
        text: response.text,
      };
      setMessages(prev => {
        const next = [...prev, aiMessage];
        // 异步保存
        if (currentConvId) persistMessages(currentConvId, next);
        return next;
      });
      setPanelAction(response.panelAction || null);
      setLastIntent(response.intent);
      setKnowledgeRefs(response.knowledgeRefs || []);
      setToolsUsed(response.toolsUsed || []);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;

      const errorMsg: Message = {
        role: 'model',
        text: `魔法出了点小问题⚡ 请稍后再试试。`,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [isLoading, currentConvId, persistMessages]);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
  }, []);

  const abortChat = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      setIsLoading(false);
    }
  }, []);

  // 切换会话
  const switchConversation = useCallback(async (convId: string) => {
    if (convId === currentConvId) return;

    setIsLoadingHistory(true);
    setCurrentConvId(convId);
    localStorage.setItem('dobi_current_conv_id', convId);
    savedCountRef.current = 0;

    try {
      const data = await getConversationMessages(convId);
      if (data.messages.length > 0) {
        const loaded: Message[] = data.messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : m.role,
          text: m.content,
        }));
        setMessages(loaded);
        savedCountRef.current = loaded.length;
      } else {
        setMessages([{ role: 'model', text: DOBI_GREETING }]);
        savedCountRef.current = 0;
      }
    } catch {
      setMessages([{ role: 'model', text: DOBI_GREETING }]);
      savedCountRef.current = 0;
    } finally {
      setIsLoadingHistory(false);
    }
  }, [currentConvId]);

  // 新建会话
  const newConversation = useCallback(async (): Promise<string> => {
    const data = await createConversation();
    const convId = data.conversation.id;
    setCurrentConvId(convId);
    localStorage.setItem('dobi_current_conv_id', convId);
    setMessages([{ role: 'model', text: DOBI_GREETING }]);
    savedCountRef.current = 0;
    setPanelAction(null);
    setLastIntent(null);
    setKnowledgeRefs([]);
    setToolsUsed([]);
    return convId;
  }, []);

  return {
    messages,
    input,
    isLoading,
    sendMessage,
    handleInputChange,
    abortChat,
    panelAction,
    lastIntent,
    knowledgeRefs,
    toolsUsed,
    currentConvId,
    switchConversation,
    newConversation,
    isLoadingHistory,
  };
}
