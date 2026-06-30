/**
 * Tool call 处理器 - 从 useChat.ts 提取
 * 处理 AI 返回的 function calls（addCourse, addHomework 等）
 */

import { error as logError } from '../../lib/console';
import type { Message } from '../../types';

export interface ToolCallContext {
  streamingTextRef: React.MutableRefObject<string>;
  scheduleBatchUpdate: () => void;
  messages: Message[];
}

type FunctionCall = {
  name?: string;
  args: Record<string, string>;
};

function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('dobi_auth_token');
  }
  return null;
}

function updateLocalData(key: string, updater: (existing: any[]) => any[], eventName: string) {
  if (typeof window === 'undefined') return;
  const stored = JSON.parse(localStorage.getItem(key) || '{"value":[]}');
  const updated = updater(stored.value || []);
  localStorage.setItem(key, JSON.stringify({ value: updated, timestamp: Date.now() }));
  window.dispatchEvent(new CustomEvent(eventName));
  window.dispatchEvent(new CustomEvent('data-updated', { detail: { type: eventName.replace('-updated', '') } }));
}

async function handleAddCourse(call: FunctionCall, ctx: ToolCallContext) {
  const { streamingTextRef, scheduleBatchUpdate } = ctx;
  streamingTextRef.current += `\n✨ 正在添加课程：${call.args.subject || ''} - ${call.args.day || ''} ${call.args.time || ''}`;
  scheduleBatchUpdate();

  try {
    const token = getToken();
    if (!token) return;

    const userMessageText = ctx.messages.find(m => m.role === 'user')?.text || '';
    if (userMessageText.includes('更新') || userMessageText.includes('清除') || userMessageText.includes('替换')) {
      const getCoursesResp = await fetch('/api/courses', { headers: { 'Authorization': `Bearer ${token}` } });
      if (getCoursesResp.ok) {
        const courses = await getCoursesResp.json();
        for (const course of courses) {
          await fetch(`/api/courses?id=${encodeURIComponent(course.id)}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
          });
        }
      }
    }

    const courseData = {
      day: call.args.day,
      subject: call.args.subject,
      time: call.args.time,
      type: call.args.type || '校内',
    };
    await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ course: courseData }),
    });

    updateLocalData('dobi_courses', (existing) => [...existing, { ...courseData, color: 'bg-blue-500/20 border-blue-500/30' }], 'courses-updated');
  } catch (err) {
    logError('Add course error:', err);
  }
}

async function handleAddHomework(call: FunctionCall, ctx: ToolCallContext) {
  const { streamingTextRef, scheduleBatchUpdate } = ctx;
  streamingTextRef.current += `\n✨ 正在添加作业：${call.args.title || ''} (${call.args.subject || ''})`;
  scheduleBatchUpdate();

  try {
    const token = getToken();
    if (!token) return;

    const homeworkData = {
      title: call.args.title,
      subject: call.args.subject,
      description: call.args.description,
      status: 'pending',
    };
    const resp = await fetch('/api/homework', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ task: homeworkData }),
    });

    if (resp.ok) {
      streamingTextRef.current += '\n✅ 作业添加成功！';
      updateLocalData('dobi_homework', (existing) => [...existing, {
        ...homeworkData, id: `hw_${Date.now()}`, due_date: call.args.dueDate || null, created_at: new Date().toISOString(),
      }], 'homework-updated');
    } else {
      streamingTextRef.current += '\n❌ 添加作业失败，请稍后再试。';
    }
    scheduleBatchUpdate();
  } catch (err) {
    logError('Add homework error:', err);
    streamingTextRef.current += '\n❌ 添加作业失败，请稍后再试。';
    scheduleBatchUpdate();
  }
}

async function handleCompleteHomework(call: FunctionCall, ctx: ToolCallContext) {
  const { streamingTextRef, scheduleBatchUpdate } = ctx;
  streamingTextRef.current += `\n✨ 正在标记作业完成：${call.args.title || ''}`;
  scheduleBatchUpdate();

  try {
    const token = getToken();
    if (!token) return;

    const resp = await fetch('/api/homework?status=pending', { headers: { 'Authorization': `Bearer ${token}` } });
    if (resp.ok) {
      const homeworkList = await resp.json();
      const target = homeworkList.find((h: any) => h.title.includes(call.args.title) || call.args.title.includes(h.title));
      if (target) {
        await fetch('/api/homework', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ id: target.id, status: 'completed' }),
        });
        streamingTextRef.current += '\n✅ 作业已完成！太棒啦～';
        updateLocalData('dobi_homework', (existing) => existing.map((h: any) =>
          h.title.includes(call.args.title) || call.args.title.includes(h.title) ? { ...h, status: 'completed' } : h
        ), 'homework-updated');
      } else {
        streamingTextRef.current += '\n❌ 找不到对应的作业呢';
      }
      scheduleBatchUpdate();
    }
  } catch (err) {
    logError('Complete homework error:', err);
    streamingTextRef.current += '\n❌ 更新作业状态失败';
    scheduleBatchUpdate();
  }
}

async function handleDeleteHomework(call: FunctionCall, ctx: ToolCallContext) {
  const { streamingTextRef, scheduleBatchUpdate } = ctx;
  streamingTextRef.current += `\n✨ 正在删除作业：${call.args.title || ''}`;
  scheduleBatchUpdate();

  try {
    const token = getToken();
    if (!token) return;

    const resp = await fetch('/api/homework', { headers: { 'Authorization': `Bearer ${token}` } });
    if (resp.ok) {
      const homeworkList = await resp.json();
      const target = homeworkList.find((h: any) => h.title.includes(call.args.title) || call.args.title.includes(h.title));
      if (target) {
        await fetch(`/api/homework?id=${encodeURIComponent(target.id)}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        streamingTextRef.current += '\n✅ 作业已删除';
        updateLocalData('dobi_homework', (existing) => existing.filter((h: any) =>
          !(h.title.includes(call.args.title) || call.args.title.includes(h.title))
        ), 'homework-updated');
      } else {
        streamingTextRef.current += '\n❌ 找不到对应的作业';
      }
      scheduleBatchUpdate();
    }
  } catch (err) {
    logError('Delete homework error:', err);
    streamingTextRef.current += '\n❌ 删除作业失败';
    scheduleBatchUpdate();
  }
}

async function handleListHomework(call: FunctionCall, ctx: ToolCallContext) {
  const { streamingTextRef, scheduleBatchUpdate } = ctx;
  streamingTextRef.current += '\n✨ 正在查看作业列表...';
  scheduleBatchUpdate();

  try {
    const token = getToken();
    if (!token) return;

    const status = call.args.status || 'all';
    const resp = await fetch(`/api/homework?status=${status}`, { headers: { 'Authorization': `Bearer ${token}` } });
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
  } catch (err) {
    logError('List homework error:', err);
    streamingTextRef.current += '\n❌ 获取作业列表失败';
    scheduleBatchUpdate();
  }
}

const TOOL_HANDLERS: Record<string, (call: FunctionCall, ctx: ToolCallContext) => Promise<void>> = {
  addCourse: handleAddCourse,
  addHomework: handleAddHomework,
  completeHomework: handleCompleteHomework,
  deleteHomework: handleDeleteHomework,
  listHomework: handleListHomework,
};

export async function processToolCalls(functionCalls: FunctionCall[], ctx: ToolCallContext) {
  logError('Tool calls received:', functionCalls);
  for (const call of functionCalls) {
    const handler = TOOL_HANDLERS[call.name || ''];
    if (handler) {
      await handler(call, ctx);
    }
  }
}
