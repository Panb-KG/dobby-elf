"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { StorageKeys, setStorage } from '../lib/storage';
import type { Message } from '../types';
import { error as logError } from '../lib/console';
import { dobi } from '../services/magicElf';
import { processToolCalls } from './chat/tool-calls';

export interface UseChatReturn {
  messages: Message[];
  input: string;
  isLoading: boolean;
  sendMessage: (text: string, files?: Array<{ mimeType: string; data: string }>) => Promise<void>;
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
const MAX_CHAT_HISTORY = 50;
const STREAM_BATCH_MS = 80;

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

  const streamingTextRef = useRef<string>('');
  const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesRef = useRef<Message[]>(messages);
  messagesRef.current = messages;

  useEffect(() => {
    const timer = setTimeout(() => {
      const toSave = messages.slice(-MAX_CHAT_HISTORY);
      setStorage(StorageKeys.CHAT_HISTORY, toSave);
    }, 500);
    return () => clearTimeout(timer);
  }, [messages]);

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

  const sendMessage = useCallback(async (text: string, files?: Array<{ mimeType: string; data: string }>) => {
    if (!text.trim() && (!files || files.length === 0)) return;

    const image = files?.find(f => f.mimeType.startsWith('image/'));
    const userMessage: Message = {
      role: 'user',
      text,
      image: image ? `data:${image.mimeType};base64,${image.data}` : undefined,
      files,
      timestamp: new Date().toISOString()
    };

    setIsLoading(true);

    try {
      abortControllerRef.current = new AbortController();

      let currentMessages: Message[] = [];
      setMessages(prev => {
        currentMessages = [...prev, userMessage];
        return currentMessages;
      });

      await new Promise(resolve => setTimeout(resolve, 0));

      const streamingMessage: Message = {
        role: 'model',
        text: '',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, streamingMessage]);

      streamingTextRef.current = '';

      for await (const chunk of dobi.chatStream(
        [...currentMessages].filter(m => m.role === 'user' || m.role === 'model').map(m => ({
          role: m.role as 'user' | 'model',
          text: m.text,
          files: m.files
        }))
      )) {
        if (typeof chunk === 'string') {
          streamingTextRef.current += chunk;
          scheduleBatchUpdate();
        } else if (typeof chunk === 'object' && chunk.functionCalls) {
          await processToolCalls(chunk.functionCalls, {
            streamingTextRef,
            scheduleBatchUpdate,
            messages: messagesRef.current,
          });
        }
      }

      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current);
        batchTimerRef.current = null;
      }
      flushStreamingText();

      if (onAutoSpeak && streamingTextRef.current) {
        onAutoSpeak(streamingTextRef.current);
      }
    } catch (error: unknown) {
      const err = error as Error;
      if (err.name !== 'AbortError') {
        logError('Chat error:', err);
        let errorText = '多比的魔法出错了，请稍后再试。';

        const errorStr = err.message || '';
        if (errorStr.includes('Model not exist') && files && files.length > 0) {
          errorText = '多比暂时无法识别图片呢！请尝试发送文字消息，或者稍后再试。';
        } else if (errorStr.includes('图片') || errorStr.includes('image') || errorStr.includes('vision')) {
          errorText = '图片识别功能暂时不可用，请先发送文字消息吧！';
        }

        const errorMessage: Message = {
          role: 'model',
          text: errorText,
        };
        setMessages(prev => [...prev.slice(0, -1), errorMessage]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
      streamingTextRef.current = '';
    }
  }, [scheduleBatchUpdate, flushStreamingText, onAutoSpeak]);

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
