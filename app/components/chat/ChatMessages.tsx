"use client";

import React, { useRef, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { FileText } from 'lucide-react';
import type { Message } from '../../types';
import { DobiAvatar } from '../DobiAvatar';
import { cn } from '@/lib/utils';
import type { VoiceChatProps } from './types';

interface ChatMessagesProps {
  messages: Message[];
  isComplexContent?: (text: string) => boolean;
  onComplexContentClick?: (text: string) => void;
  voiceChat?: VoiceChatProps;
}

export const ChatMessages = memo(function ChatMessages({ messages, isComplexContent, onComplexContentClick, voiceChat }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
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
              "flex max-w-[85%] md:max-w-[75%] items-start gap-2",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : msg.role === 'model' ? "mr-auto flex-row" : "mr-auto flex-row"
            )}
          >
            {msg.role === 'model' && <DobiAvatar size="sm" className="mt-0.5 flex-shrink-0" />}
            <div className="flex flex-col">
              <div className={cn(
                "px-5 py-3 rounded-3xl text-sm md:text-base leading-relaxed",
                msg.role === 'user'
                  ? "bg-magic-accent/20 border border-magic-accent/30 text-white rounded-tr-none"
                  : msg.role === 'system'
                  ? "bg-amber-500/20 border border-amber-500/30 text-amber-200 rounded-tl-none"
                  : "bg-white/5 border border-white/10 text-stone-200 rounded-tl-none"
              )}>
                {msg.image && (
                  <div className="mb-3 rounded-xl overflow-hidden">
                    <img src={msg.image} alt="附件图片" className="max-w-full h-auto" />
                  </div>
                )}
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
                  {msg.text ? (
                    <Markdown rehypePlugins={[rehypeRaw]}>{msg.text}</Markdown>
                  ) : (
                    <span className="text-magic-accent/60 text-xs italic font-serif">正在施展魔法...</span>
                  )}
                </div>
              </div>
              <div className={cn(
                "flex items-center gap-2 mt-2",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}>
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                  {msg.role === 'user' ? 'Seeker' : msg.role === 'system' ? 'System' : 'Dobi'}
                </span>
                {msg.role === 'model' && voiceChat?.isSpeechSynthesisSupported && (
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      if (voiceChat.isSpeaking) voiceChat.onStopSpeaking();
                      else voiceChat.onSpeak(msg.text);
                    }}
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                      voiceChat.isSpeaking
                        ? "bg-magic-accent/60 text-white"
                        : "bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/50"
                    )}
                    title={voiceChat.isSpeaking ? '停止朗读' : '朗读回复'}
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      {voiceChat.isSpeaking ? (
                        <>
                          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                        </>
                      ) : (
                        <line x1="23" y1="9" x2="17" y2="15" />
                      )}
                    </svg>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
});
