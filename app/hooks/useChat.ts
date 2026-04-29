"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { StorageKeys, setStorage } from '../lib/storage';
import type { Message } from '../types';
import { dobi } from '../services/magicElf';

export interface UseChatReturn {
  messages: Message[];
  input: string;
  isLoading: boolean;
  sendMessage: (text: string, image?: string | null) => Promise<void>;
  handleInputChange: (value: string) => void;
  handleShortcut: (prompt: string) => Promise<void>;
}

export interface UseChatOptions {
  initialMessage?: string;
}

const DEFAULT_INITIAL_MESSAGE = '呼啦啦！你好呀，小主人！我是你的学习小魔灵多比。今天有什么想探索的知识魔法吗？✨';
const MAX_CHAT_HISTORY = 50; // 最多保留 50 条消息

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { initialMessage = DEFAULT_INITIAL_MESSAGE } = options;
  
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

  // 自动保存聊天记录
  useEffect(() => {
    const toSave = messages.slice(-MAX_CHAT_HISTORY);
    setStorage(StorageKeys.CHAT_HISTORY, toSave);
  }, [messages]);

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
      
      const response = await dobi.chat({
        messages: [...currentMessages].map(m => ({ role: m.role, content: m.text })),
        signal: abortControllerRef.current.signal,
      });

      const modelMessage: Message = {
        role: 'model',
        text: response.text,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Chat error:', error);
        const errorMessage: Message = {
          role: 'system',
          text: '多比的魔法出错了，请稍后再试。',
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

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
  };
}
