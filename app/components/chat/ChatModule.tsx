"use client";

import { memo } from 'react';
import type { Message } from '../../types';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import type { VoiceChatProps, ShortcutItem } from './types';

export interface ChatModuleProps {
  messages: Message[];
  input: string;
  isLoading: boolean;
  onSend: (text: string, files?: Array<{ mimeType: string; data: string }>) => void;
  onInputChange: (value: string) => void;
  onShortcut: (prompt: string) => void;
  shortcuts: ShortcutItem[];
  isComplexContent?: (text: string) => boolean;
  onComplexContentClick?: (text: string) => void;
  showDailyAdventure?: boolean;
  onToggleDailyAdventure?: () => void;
  voiceChat?: VoiceChatProps;
}

export const ChatModule = memo(function ChatModule({
  messages, input, isLoading, onSend, onInputChange, onShortcut, shortcuts,
  isComplexContent, onComplexContentClick, showDailyAdventure, onToggleDailyAdventure, voiceChat,
}: ChatModuleProps) {
  return (
    <div className="flex flex-col h-full">
      <ChatMessages
        messages={messages}
        isComplexContent={isComplexContent}
        onComplexContentClick={onComplexContentClick}
        voiceChat={voiceChat}
      />
      <ChatInput
        input={input}
        isLoading={isLoading}
        onSend={onSend}
        onInputChange={onInputChange}
        onShortcut={onShortcut}
        shortcuts={shortcuts}
        voiceChat={voiceChat}
        showDailyAdventure={showDailyAdventure}
        onToggleDailyAdventure={onToggleDailyAdventure}
      />
    </div>
  );
});
