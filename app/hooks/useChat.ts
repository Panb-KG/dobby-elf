"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { StorageKeys, setStorage } from '../lib/storage';
import type { Message } from '../types';
import { error as logError } from '../lib/console';
import { dobi } from '../services/magicElf';

export interface UseChatReturn {
  messages: Message[];
  input: string;
  isLoading: boolean;
  sendMessage: (text: string, image?: string | null) => Promise<void>;
  handleInputChange: (value: string) => void;
  handleShortcut: (prompt: string) => Promise<void>;
  abortChat: () => void;
}

export interface UseChatOptions {
  initialMessage?: string;
  /** 当 AI 回复完成时自动朗读（语音聊天模式） */
  onAutoSpeak?: (text: string) => void;
}

const DEFAULT_INITIAL_MESSAGE = '呼啦啦！你好呀，小主人！我是你的学习小魔灵多比。今天有什么想探索的知识魔法吗？✨';
const MAX_CHAT_HISTORY = 50; // 最多保留 50 条消息
const STREAM_BATCH_MS = 80; // 流式更新批处理间隔（ms）

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { initialMessage = DEFAULT_INITIAL_MESSAGE, onAutoSpeak } = options;
  
  const [storedMessages] = useLocalStorage<Message[]>({
    key: StorageKeys.CHAT_HISTORY,
    defaultValue: [],
  });
  
  const [messages, setMessages] = useState<Message[]>(
    storedMessages.length > 0
      ? storedMessages
      : [{ role: 'model', text: initialMessage }]
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 流式优化：用 ref 累积文本，批量更新 UI
  const streamingTextRef = useRef<string>('');
  const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesRef = useRef<Message[]>(messages);
  messagesRef.current = messages;

  // 自动保存聊天记录（防抖，避免流式更新时频繁写入）
  useEffect(() => {
    const timer = setTimeout(() => {
      const toSave = messages.slice(-MAX_CHAT_HISTORY);
      setStorage(StorageKeys.CHAT_HISTORY, toSave);
    }, 500);
    return () => clearTimeout(timer);
  }, [messages]);

  // 批量更新 UI（每 STREAM_BATCH_MS ms 一次）
  const flushStreamingText = useCallback(() => {
    const text = streamingTextRef.current;
    if (!text) return;
    setMessages(prev => {
      const newMessages = [...prev];
      const lastMsg = newMessages[newMessages.length - 1];
      if (lastMsg && lastMsg.role === 'model' && lastMsg.text !== text) {
        lastMsg.text = text;
      }
      return newMessages;
    });
  }, []);

  const scheduleBatchUpdate = useCallback(() => {
    if (batchTimerRef.current) return;
    batchTimerRef.current = setTimeout(() => {
      batchTimerRef.current = null;
      flushStreamingText();
    }, STREAM_BATCH_MS);
  }, [flushStreamingText]);

  const abortChat = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const sendMessage = useCallback(async (text: string, image: string | null = null) => {
    if (!text.trim()) return;

    const userMessage: Message = { 
      role: 'user', 
      text, 
      image, 
      timestamp: new Date().toISOString() 
    };
    
    setIsLoading(true);

    try {
      abortControllerRef.current = new AbortController();
      
      // 使用函数式更新获取最新的 messages
      let currentMessages: Message[] = [];
      setMessages(prev => {
        currentMessages = [...prev, userMessage];
        return currentMessages;
      });
      
      // 等待 state 更新后发送请求
      await new Promise(resolve => setTimeout(resolve, 0));

      // 创建流式消息占位
      const streamingMessage: Message = {
        role: 'model',
        text: '',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, streamingMessage]);

      // 流式接收，用 ref 累积文本，批量更新 UI
      streamingTextRef.current = '';
      for await (const chunk of dobi.chatStream(
        [...currentMessages].filter(m => m.role === 'user' || m.role === 'model').map(m => ({ role: m.role as 'user' | 'model', text: m.text }))
      )) {
        if (typeof chunk === 'string') {
          streamingTextRef.current += chunk;
          scheduleBatchUpdate();
        }
      }

      // 最终完成：确保最后一次更新
      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current);
        batchTimerRef.current = null;
      }
      flushStreamingText();
      
      // 自动朗读 AI 回复（语音聊天模式）
      if (onAutoSpeak && streamingTextRef.current) {
        onAutoSpeak(streamingTextRef.current);
      }
    } catch (error: unknown) {
      const err = error as Error;
      if (err.name !== 'AbortError') {
        logError('Chat error:', err);
        const errorMessage: Message = {
          role: 'system',
          text: '多比的魔法出错了，请稍后再试。',
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
      streamingTextRef.current = '';
    }
  }, [scheduleBatchUpdate, flushStreamingText]);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
  }, []);

  const handleShortcut = useCallback(async (prompt: string) => {
    await sendMessage(prompt);
    setInput('');
  }, [sendMessage]);

  return {
    messages,
    input,
    isLoading,
    sendMessage,
    handleInputChange,
    handleShortcut,
    abortChat,
  };
}
