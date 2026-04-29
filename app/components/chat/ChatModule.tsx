"use client";

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Send, Paperclip, Mic, X, ImageIcon, Video, File, Sparkles, ChevronRight, FileText, Home } from 'lucide-react';
import type { Message } from '../../types';
import { DobiAvatar } from '../DobiAvatar';
import { cn } from '@/lib/utils';

interface ChatModuleProps {
  messages: Message[];
  input: string;
  isLoading: boolean;
  onSend: (text: string, image?: string | null) => void;
  onInputChange: (value: string) => void;
  onShortcut: (prompt: string) => void;
  shortcuts: Array<{
    id: string;
    name: string;
    prompt: string;
  }>;
  isComplexContent?: (text: string) => boolean;
  onComplexContentClick?: (text: string) => void;
  showDailyAdventure?: boolean;
  onToggleDailyAdventure?: () => void;
}

export function ChatModule({
  messages,
  input,
  isLoading,
  onSend,
  onInputChange,
  onShortcut,
  shortcuts,
  isComplexContent,
  onComplexContentClick,
  showDailyAdventure,
  onToggleDailyAdventure,
}: ChatModuleProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<File[]>([]);

  // 自动滚动
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 自动调整 textarea 高度
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + 'px';
    }
  }, [input]);

  const handleSend = () => {
    if ((input.trim() || attachments.length > 0) && !isLoading) {
      onSend(input.trim());
      onInputChange('');
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-full">
      {/* 消息列表 */}
      <div
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth"
        style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)' }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex flex-col max-w-[85%] md:max-w-[75%]",
                msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div className={cn(
                "px-5 py-3 rounded-3xl text-sm md:text-base leading-relaxed",
                msg.role === 'user'
                  ? "bg-magic-accent/20 border border-magic-accent/30 text-white rounded-tr-none"
                  : "bg-white/5 border border-white/10 text-stone-200 rounded-tl-none"
              )}>
                {msg.image && (
                  <div className="mb-3 rounded-xl overflow-hidden">
                    <img src={msg.image} alt="附件图片" className="max-w-full h-auto" />
                  </div>
                )}
                {/* 复杂内容显示 */}
                {msg.role === 'model' && isComplexContent?.(msg.text) && onComplexContentClick && (
                  <div
                    className="flex items-center gap-2 mb-3 p-2 rounded-xl bg-black/20 border border-white/5 cursor-pointer hover:bg-black/30 transition-colors"
                    onClick={() => onComplexContentClick(msg.text)}
                  >
                    <FileText className="w-4 h-4 text-magic-accent" />
                    <span className="text-sm text-white/70">查看详细内容 →</span>
                  </div>
                )}
                <div className="markdown-body">
                  <Markdown rehypePlugins={[rehypeRaw]}>{msg.text}</Markdown>
                </div>
              </div>
              <div className={cn(
                "flex items-center gap-2 mt-2",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}>
                {msg.role === 'model' && <DobiAvatar size="sm" />}
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                  {msg.role === 'user' ? 'Seeker' : 'Dobi'}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 text-magic-accent/60"
          >
            <DobiAvatar size="sm" />
            <span className="text-xs italic font-serif">正在施展魔法...</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区 */}
      <div className="p-4 md:p-6 border-t border-white/5 bg-black/20">
        {/* 附件预览 */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex flex-wrap gap-2 mb-4"
            >
              {attachments.map((file, idx) => (
                <div key={idx} className="relative group p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                  {file.type.startsWith('image/') ? (
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                  ) : file.type.startsWith('video/') ? (
                    <Video className="w-4 h-4 text-blue-400" />
                  ) : (
                    <File className="w-4 h-4 text-amber-400" />
                  )}
                  <span className="text-[10px] text-white/60 max-w-[80px] truncate">{file.name}</span>
                  <button
                    onClick={() => removeAttachment(idx)}
                    className="p-1 rounded-full bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 快捷指令 (移动端) */}
        <div className="flex md:hidden gap-2 overflow-x-auto pb-4 no-scrollbar">
          {shortcuts.map((spell) => (
            <button
              key={spell.id}
              onClick={() => onShortcut(spell.prompt)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/70"
            >
              <Sparkles className="w-3 h-3" />
              {spell.name}
            </button>
          ))}
        </div>

        <div className="relative group flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的问题，让魔法发生..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl px-6 py-4 pr-32 text-sm md:text-base focus:outline-none focus:border-magic-accent/50 focus:bg-white/10 transition-all resize-none min-h-[56px] max-h-32"
              rows={1}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {onToggleDailyAdventure && (
                <button
                  onClick={onToggleDailyAdventure}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                  title={showDailyAdventure ? '收起今日冒险' : '查看今日冒险'}
                >
                  <Home className="w-5 h-5" />
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                title="上传附件"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <button
                className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                title="语音输入"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-magic-accent flex items-center justify-center text-white shadow-lg shadow-magic-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
