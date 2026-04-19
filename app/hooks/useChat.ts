"use client";

import { useState, useCallback, useRef } from 'react';
import { Message } from '../services/types';
import { dobby } from '../services/magicElf';

interface UseChatReturn {
  messages: Message[];
  input: string;
  isLoading: boolean;
  sendMessage: (text: string, image?: string | null) => Promise<void>;
  handleInputChange: (value: string) => void;
  handleShortcut: (prompt: string) => Promise<void>;
}

const INITIAL_MESSAGE: Message = {
  role: 'model',
  text: '呼啦啦！你好呀，小主人！我是你的学习小魔灵多比。今天有什么想探索的知识魔法吗？✨'
};

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (text: string, image: string | null = null) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: 'user', text, image, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      abortControllerRef.current = new AbortController();
      
      const response = await dobby.chat({
        messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.text })),
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
  }, [messages]);

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
