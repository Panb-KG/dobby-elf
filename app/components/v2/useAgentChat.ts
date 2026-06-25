/**
 * useAgentChat Hook
 * 
 * 对接 Agent API 的聊天 Hook
 * v2.0 新增
 */

"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { agentChat } from '@/lib/agent/client';
import type { ChatMessage, AgentChatResponse, PanelAction, IntentType } from '@/lib/agent/types';
import type { Message } from '@/types';
import { StorageKeys, setStorage } from '@/lib/storage';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const MAX_HISTORY = 50;
const DOBI_GREETING = '呼啦啦！你好呀，小主人！我是你的学习小精灵多比 🧦 今天有什么想探索的知识魔法吗？✨';

export interface UseAgentChatReturn {
  messages: Message[];
  input: string;
  isLoading: boolean;
  sendMessage: (text: string) => Promise<void>;
  handleInputChange: (value: string) => void;
  abortChat: () => void;
  /** 最新的面板指令 */
  panelAction: PanelAction | null;
  /** 最新意图 */
  lastIntent: IntentType | null;
  /** 知识库引用 */
  knowledgeRefs: string[];
}

export function useAgentChat(): UseAgentChatReturn {
  const [storedMessages] = useLocalStorage<Message[]>({
    key: StorageKeys.CHAT_HISTORY,
    defaultValue: [],
  });

  const [messages, setMessages] = useState<Message[]>(
    storedMessages.length > 0
      ? storedMessages
      : [{ role: 'model', text: DOBI_GREETING }]
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [panelAction, setPanelAction] = useState<PanelAction | null>(null);
  const [lastIntent, setLastIntent] = useState<IntentType | null>(null);
  const [knowledgeRefs, setKnowledgeRefs] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // 自动保存聊天记录
  useEffect(() => {
    const timer = setTimeout(() => {
      setStorage(StorageKeys.CHAT_HISTORY, messages.slice(-MAX_HISTORY));
    }, 500);
    return () => clearTimeout(timer);
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // 构建 API 消息格式
      const apiMessages: ChatMessage[] = messagesRef.current.map(m => ({
        role: m.role === 'model' ? 'assistant' : m.role,
        content: m.text || m.content || '',
      }));
      apiMessages.push({ role: 'user', content: text.trim() });

      const response = await agentChat(apiMessages);

      if (response.blocked) {
        const blockedMsg: Message = {
          role: 'model',
          text: response.text || '这个话题我们换个聊聊吧～',
        };
        setMessages(prev => [...prev, blockedMsg]);
        return;
      }

      const aiMessage: Message = {
        role: 'model',
        text: response.text,
      };
      setMessages(prev => [...prev, aiMessage]);
      setPanelAction(response.panelAction || null);
      setLastIntent(response.intent);
      setKnowledgeRefs(response.knowledgeRefs || []);
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
  }, [isLoading]);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
  }, []);

  const abortChat = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      setIsLoading(false);
    }
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
  };
}
