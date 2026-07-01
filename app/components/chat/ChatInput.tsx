"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Paperclip, X, ImageIcon, Video, File, Sparkles, FileText, Home, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VoiceChatProps, ShortcutItem } from './types';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  onSend: (text: string, files?: Array<{ mimeType: string; data: string }>) => void;
  onInputChange: (value: string) => void;
  onShortcut: (prompt: string) => void;
  shortcuts: ShortcutItem[];
  voiceChat?: VoiceChatProps;
  showDailyAdventure?: boolean;
  onToggleDailyAdventure?: () => void;
}

export function ChatInput({
  input, isLoading, onSend, onInputChange, onShortcut, shortcuts,
  voiceChat, showDailyAdventure, onToggleDailyAdventure,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  
  // 对话框状态
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean;
    message: string;
    type: 'error' | 'success' | 'warning' | 'info';
  }>({ isOpen: false, message: '', type: 'info' });

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + 'px';
    }
  }, [input]);

  const handleSend = async () => {
    if ((input.trim() || attachments.length > 0) && !isLoading && !isSending) {
      setIsSending(true);
      const files = await Promise.all(
        attachments.map(file => new Promise<{ mimeType: string; data: string }>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            resolve({ mimeType: file.type, data: result.split(',')[1] });
          };
          reader.readAsDataURL(file);
        }))
      );
      onSend(input.trim(), files.length > 0 ? files : undefined);
      onInputChange('');
      setAttachments([]);
      setIsSending(false);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(file => {
        if (attachments.length >= 5) {
          setDialogConfig({ isOpen: true, message: '最多只能上传 5 个文件', type: 'warning' });
          return false;
        }
        if (file.size > 10 * 1024 * 1024) {
          setDialogConfig({ isOpen: true, message: '文件大小不能超过 10MB', type: 'warning' });
          return false;
        }
        return true;
      });
      setAttachments(prev => [...prev, ...validFiles]);
    }
  };

  const removeAttachment = (index: number) => setAttachments(prev => prev.filter((_, i) => i !== index));

  return (
    <div className="p-4 md:p-6 border-t border-white/5 bg-black/20">
      {/* 附件预览 */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex flex-wrap gap-2 mb-4">
            {attachments.map((file, idx) => (
              <div key={idx} className="relative group p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                {file.type.startsWith('image/') ? <ImageIcon className="w-4 h-4 text-emerald-400" />
                : file.type.startsWith('video/') ? <Video className="w-4 h-4 text-blue-400" />
                : file.type.startsWith('application/pdf') ? <FileText className="w-4 h-4 text-red-400" />
                : <File className="w-4 h-4 text-amber-400" />}
                <span className="text-[10px] text-white/60 max-w-[80px] truncate">{file.name}</span>
                <span className="text-[9px] text-white/30">
                  {file.size < 1024 ? `${file.size}B` : file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)}KB` : `${(file.size / (1024 * 1024)).toFixed(1)}MB`}
                </span>
                <button onClick={() => removeAttachment(idx)} className="p-1 rounded-full bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
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
          <button key={spell.id} onClick={() => onShortcut(spell.prompt)} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
            <Sparkles className="w-3 h-3" />{spell.name}
          </button>
        ))}
      </div>

      <div className="relative group flex items-end gap-2">
        {/* 语音按钮 */}
        {voiceChat && voiceChat.isSpeechRecognitionSupported && (
          <div className="relative">
            {(voiceChat.isRecording || voiceChat.interimText || voiceChat.finalText) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-full mb-2 left-0 bg-black/80 backdrop-blur-sm rounded-xl p-2 border border-white/10 max-w-[240px] z-10">
                {voiceChat.isRecording && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[9px] text-red-400 font-medium">录音中</span>
                  </div>
                )}
                {voiceChat.interimText && <p className="text-xs text-white/50 italic">{voiceChat.interimText}</p>}
                {voiceChat.finalText && <p className="text-xs text-white/80">{voiceChat.finalText}</p>}
              </motion.div>
            )}
            <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={voiceChat.isRecording ? voiceChat.onStopRecording : voiceChat.onStartRecording}
              className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all ${voiceChat.isRecording ? 'bg-red-500 text-white shadow-lg shadow-red-500/40' : 'bg-white/10 text-white/60 hover:bg-white/15 hover:text-white/80'}`}
              title={voiceChat.isRecording ? '停止录音' : '语音输入'}>
              <Mic className="w-5 h-5 md:w-6 md:h-6" />
            </motion.button>
          </div>
        )}

        <div className="flex-1 relative">
          <textarea ref={textareaRef} value={input} onChange={(e) => onInputChange(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="输入你的问题，让魔法发生...支持图片、文档等附件"
            className="w-full bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl px-6 py-4 pr-32 text-sm md:text-base focus:outline-none focus:border-magic-accent/50 focus:bg-white/10 transition-all resize-none min-h-[56px] max-h-32" rows={1} />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {onToggleDailyAdventure && (
              <button onClick={onToggleDailyAdventure} className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors" title={showDailyAdventure ? '收起今日冒险' : '查看今日冒险'}>
                <Home className="w-5 h-5" />
              </button>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*,video/*,.pdf,.doc,.docx,.txt" />
            <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors" title="上传附件">
              <Paperclip className="w-5 h-5" />
            </button>
          </div>
        </div>

        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSend}
          disabled={!input.trim() && attachments.length === 0 || isLoading || isSending}
          className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-magic-accent flex items-center justify-center text-white shadow-lg shadow-magic-accent/20 disabled:opacity-50 disabled:cursor-not-allowed">
          <Send className="w-5 h-5" />
        </motion.button>
      </div>

      {/* 错误提示对话框 */}
      <ConfirmDialog
        isOpen={dialogConfig.isOpen}
        message={dialogConfig.message}
        type={dialogConfig.type}
        showCancel={false}
        onConfirm={() => setDialogConfig({ isOpen: false, message: '', type: 'info' })}
      />
    </div>
  );
}
