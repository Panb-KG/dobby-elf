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
      logError('Tool calls received:', chunk.functionCalls);
      
      for (const call of chunk.functionCalls) {
        if (call.name === 'addCourse') {
          streamingTextRef.current += `\n✨ 正在添加课程：${call.args.subject || ''} - ${call.args.day || ''} ${call.args.time || ''}`;
          scheduleBatchUpdate();
          
          // 实际调用API添加课程
          try {
            let token: string | null = null;
            if (typeof window !== 'undefined') {
              token = localStorage.getItem('dobi_auth_token');
            }
            
            if (token) {
              // 如果用户说"更新课表"，先删除旧课程
              const userMessageText = messages.find(m => m.role === 'user')?.text || '';
              if (userMessageText.includes('更新') || userMessageText.includes('清除') || userMessageText.includes('替换')) {
                // 获取并删除现有课程
                const getCoursesResp = await fetch('/api/courses', {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                });
                if (getCoursesResp.ok) {
                  const courses = await getCoursesResp.json();
                  for (const course of courses) {
                    await fetch(`/api/courses?id=${encodeURIComponent(course.id)}`, {
                      method: 'DELETE',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                      },
                    });
                  }
                }
              }
              
              // 添加新课程
              const courseData = {
                day: call.args.day,
                subject: call.args.subject,
                time: call.args.time,
                type: call.args.type || '校内',
              };
              await fetch('/api/courses', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ course: courseData }),
              });
              
              // 更新本地存储并触发刷新
              if (typeof window !== 'undefined') {
                const existingCourses = JSON.parse(localStorage.getItem('dobi_courses') || '{"value":[]}').value || [];
                const newCourse = {
                  ...courseData,
                  color: 'bg-blue-500/20 border-blue-500/30',
                };
                localStorage.setItem('dobi_courses', JSON.stringify({
                  value: [...existingCourses, newCourse],
                  timestamp: Date.now(),
                }));
                // 触发自定义事件通知UI刷新
                window.dispatchEvent(new CustomEvent('courses-updated'));
                window.dispatchEvent(new CustomEvent('data-updated', { detail: { type: 'courses' } }));
              }
            }
          } catch (err) {
            logError('Add course error:', err);
          }
        } else if (call.name === 'addHomework') {
          streamingTextRef.current += `\n✨ 正在添加作业：${call.args.title || ''} (${call.args.subject || ''})`;
          scheduleBatchUpdate();
          
          try {
            let token: string | null = null;
            if (typeof window !== 'undefined') {
              token = localStorage.getItem('dobi_auth_token');
            }
            
            if (token) {
              const homeworkData = {
                title: call.args.title,
                subject: call.args.subject,
                description: call.args.description,
                status: 'pending',
              };
              const resp = await fetch('/api/homework', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ task: homeworkData }),
              });
              
              if (resp.ok) {
                streamingTextRef.current += '\n✅ 作业添加成功！';
                scheduleBatchUpdate();
                
                // 更新本地存储并触发刷新
                if (typeof window !== 'undefined') {
                  const existingHomework = JSON.parse(localStorage.getItem('dobi_homework') || '{"value":[]}').value || [];
                  const newHomework = {
                    ...homeworkData,
                    id: `hw_${Date.now()}`,
                    due_date: call.args.dueDate || null,
                    created_at: new Date().toISOString(),
                  };
                  localStorage.setItem('dobi_homework', JSON.stringify({
                    value: [...existingHomework, newHomework],
                    timestamp: Date.now(),
                  }));
                  // 触发自定义事件通知UI刷新
                  window.dispatchEvent(new CustomEvent('homework-updated'));
                  window.dispatchEvent(new CustomEvent('data-updated', { detail: { type: 'homework' } }));
                }
              } else {
                streamingTextRef.current += '\n❌ 添加作业失败，请稍后再试。';
                scheduleBatchUpdate();
              }
            }
          } catch (err) {
            logError('Add homework error:', err);
            streamingTextRef.current += '\n❌ 添加作业失败，请稍后再试。';
            scheduleBatchUpdate();
          }
        } else if (call.name === 'completeHomework') {
          streamingTextRef.current += `\n✨ 正在标记作业完成：${call.args.title || ''}`;
          scheduleBatchUpdate();
          
          try {
            let token: string | null = null;
            if (typeof window !== 'undefined') {
              token = localStorage.getItem('dobi_auth_token');
            }
            
            if (token) {
              // 先获取作业列表找到对应的作业ID
              const resp = await fetch('/api/homework?status=pending', {
                headers: { 'Authorization': `Bearer ${token}` },
              });
              if (resp.ok) {
                const homeworkList = await resp.json();
                const target = homeworkList.find((h: any) => 
                  h.title.includes(call.args.title) || call.args.title.includes(h.title)
                );
                if (target) {
                  await fetch('/api/homework', {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ id: target.id, status: 'completed' }),
                  });
                  streamingTextRef.current += '\n✅ 作业已完成！太棒啦～';
                  scheduleBatchUpdate();
                  
                  // 更新本地存储并触发刷新
                  if (typeof window !== 'undefined') {
                    const existingHomework = JSON.parse(localStorage.getItem('dobi_homework') || '{"value":[]}').value || [];
                    const updatedHomework = existingHomework.map((h: any) => 
                      h.title.includes(call.args.title) || call.args.title.includes(h.title)
                        ? { ...h, status: 'completed' }
                        : h
                    );
                    localStorage.setItem('dobi_homework', JSON.stringify({
                      value: updatedHomework,
                      timestamp: Date.now(),
                    }));
                    window.dispatchEvent(new CustomEvent('homework-updated'));
                    window.dispatchEvent(new CustomEvent('data-updated', { detail: { type: 'homework' } }));
                  }
                } else {
                  streamingTextRef.current += '\n❌ 找不到对应的作业呢';
                  scheduleBatchUpdate();
                }
              }
            }
          } catch (err) {
            logError('Complete homework error:', err);
            streamingTextRef.current += '\n❌ 更新作业状态失败';
            scheduleBatchUpdate();
          }
        } else if (call.name === 'deleteHomework') {
          streamingTextRef.current += `\n✨ 正在删除作业：${call.args.title || ''}`;
          scheduleBatchUpdate();
          
          try {
            let token: string | null = null;
            if (typeof window !== 'undefined') {
              token = localStorage.getItem('dobi_auth_token');
            }
            
            if (token) {
              // 先获取作业列表找到对应的作业ID
              const resp = await fetch('/api/homework', {
                headers: { 'Authorization': `Bearer ${token}` },
              });
              if (resp.ok) {
                const homeworkList = await resp.json();
                const target = homeworkList.find((h: any) => 
                  h.title.includes(call.args.title) || call.args.title.includes(h.title)
                );
                if (target) {
                  await fetch(`/api/homework?id=${encodeURIComponent(target.id)}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` },
                  });
                  streamingTextRef.current += '\n✅ 作业已删除';
                  scheduleBatchUpdate();
                  
                  // 更新本地存储并触发刷新
                  if (typeof window !== 'undefined') {
                    const existingHomework = JSON.parse(localStorage.getItem('dobi_homework') || '{"value":[]}').value || [];
                    const filteredHomework = existingHomework.filter((h: any) => 
                      !(h.title.includes(call.args.title) || call.args.title.includes(h.title))
                    );
                    localStorage.setItem('dobi_homework', JSON.stringify({
                      value: filteredHomework,
                      timestamp: Date.now(),
                    }));
                    window.dispatchEvent(new CustomEvent('homework-updated'));
                    window.dispatchEvent(new CustomEvent('data-updated', { detail: { type: 'homework' } }));
                  }
                } else {
                  streamingTextRef.current += '\n❌ 找不到对应的作业';
                  scheduleBatchUpdate();
                }
              }
            }
          } catch (err) {
            logError('Delete homework error:', err);
            streamingTextRef.current += '\n❌ 删除作业失败';
            scheduleBatchUpdate();
          }
        } else if (call.name === 'listHomework') {
          streamingTextRef.current += '\n✨ 正在查看作业列表...';
          scheduleBatchUpdate();
          
          try {
            let token: string | null = null;
            if (typeof window !== 'undefined') {
              token = localStorage.getItem('dobi_auth_token');
            }
            
            if (token) {
              const status = call.args.status || 'all';
              const resp = await fetch(`/api/homework?status=${status}`, {
                headers: { 'Authorization': `Bearer ${token}` },
              });
              if (resp.ok) {
                const homeworkList = await resp.json();
                if (homeworkList.length === 0) {
                  streamingTextRef.current += '\n📝 目前没有作业哦，太轻松啦！';
                } else {
                  streamingTextRef.current += '\n📋 作业列表：\n';
                  homeworkList.forEach((h: any, i: number) => {
                    const statusIcon = h.status === 'completed' ? '✅' : '⏳';
                    const dueInfo = h.due_date ? ` (截止：${h.due_date})` : '';
                    streamingTextRef.current += `${i + 1}. ${statusIcon} ${h.subject} - ${h.title}${dueInfo}\n`;
                  });
                }
                scheduleBatchUpdate();
              }
            }
          } catch (err) {
            logError('List homework error:', err);
            streamingTextRef.current += '\n❌ 获取作业列表失败';
            scheduleBatchUpdate();
          }
        }
      }
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
