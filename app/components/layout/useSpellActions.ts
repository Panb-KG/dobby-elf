"use client";

import { useCallback, useMemo } from 'react';
import type { Spell } from '../../types';
import type { UseChatReturn } from '../../hooks/useChat';

type SidebarContentType = 'schedule' | 'exercise' | 'image' | 'achievements' | 'focus' | 'content';

/**
 * useSpellActions - 咒语/快捷方式操作 & 内容处理
 */
export function useSpellActions(
  chat: UseChatReturn,
  shortcuts: Spell[],
  onRightSidebarChange: (open: boolean) => void,
  onSidebarContentTypeChange: (type: SidebarContentType) => void,
) {
  // 咒语使用
  const useSpell = useCallback((spell: Spell) => {
    chat.handleShortcut(spell.prompt);
    if (spell.id === 'schedule') {
      onRightSidebarChange(true);
      onSidebarContentTypeChange('schedule');
    } else if (spell.id === 'homework' || spell.id === 'math') {
      onRightSidebarChange(true);
      onSidebarContentTypeChange('exercise');
    } else if (spell.id === 'achievements') {
      onRightSidebarChange(true);
      onSidebarContentTypeChange('achievements');
    } else if (spell.id === 'focus') {
      onRightSidebarChange(true);
      onSidebarContentTypeChange('focus');
    }
  }, [chat, onRightSidebarChange, onSidebarContentTypeChange]);

  // 复杂内容判断
  const isComplexContent = useCallback((text: string) => {
    return (
      text.includes('<table') ||
      text.includes('<div') ||
      text.includes('<h1') ||
      text.includes('<h2') ||
      text.length > 500
    );
  }, []);

  // 复杂内容点击处理
  const handleComplexContentClick = useCallback(
    (text: string) => {
      const titleMatch = text.match(/<h1[^>]*>(.*?)<\/h1>/);
      const title = titleMatch ? titleMatch[1] : '详细内容';
      onSidebarContentTypeChange('content');
      onRightSidebarChange(true);
      return { selectedContent: text, contentTitle: title };
    },
    [onRightSidebarChange, onSidebarContentTypeChange],
  );

  const shortcutButtons = useMemo(
    () => shortcuts.map(spell => ({ id: spell.id, name: spell.name, prompt: spell.prompt })),
    [shortcuts],
  );

  return { useSpell, isComplexContent, handleComplexContentClick, shortcutButtons };
}
