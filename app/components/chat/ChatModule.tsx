"use client";

import React, { useRef } from 'react';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Send, Paperclip, Mic, Sparkles } from 'lucide-react';
import { Message } from '../../services/types';
import { DobbyAvatar } from '../DobbyAvatar';

interface ChatModuleProps {
  messages: Message[];
  input: string;
  isLoading: boolean;
  onSend: (text: string) => void;
  onInputChange: (value: string) => void;
  onShortcut: (prompt: string) => void;
  shortcuts: Array<{
    id: string;
    name: string;
    icon: React.ElementType;
    prompt: string;
  }>;
}

export function ChatModule({
  messages,
  input,
  isLoading,
  onSend,
  onInputChange,
  onShortcut,
  shortcuts,
}: ChatModuleProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      onInputChange('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 快捷指令 */}
      <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide">
        {shortcuts.map((spell) => (
          <motion.button
            key={spell.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onShortcut(spell.prompt)}
            className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap hover:bg-white/10 transition-colors"
          >
            <spell.icon className="w-4 h-4 text-magic-accent" />
            <span className="text-sm text-white/80">{spell.name}</span>
          </motion.button>
        ))}
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {message.role === 'model' && <DobbyAvatar className="w-8 h-8" />}
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-magic-accent text-white'
                  : 'glass-panel text-white/90'
              }`}
            >
              <Markdown rehypePlugins={[rehypeRaw]}>{message.text}</Markdown>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <DobbyAvatar className="w-8 h-8" />
            <div className="glass-panel px-4 py-3 rounded-2xl">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div className="p-4 glass-panel rounded-t-2xl">
        <div className="flex gap-2 items-end">
          <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <Paperclip className="w-5 h-5 text-white/60" />
          </button>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="和多比聊聊天..."
            className="flex-1 bg-transparent text-white placeholder:text-white/40 resize-none focus:outline-none max-h-32 min-h-[44px]"
            rows={1}
          />
          <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <Mic className="w-5 h-5 text-white/60" />
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-magic-accent rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
