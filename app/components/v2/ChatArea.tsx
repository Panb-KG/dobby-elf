/**
 * v2.0 聊天区组件
 */

"use client";

import { Mic, Send, Square, Loader2 } from 'lucide-react';
import type { UseAgentChatReturn } from './useAgentChat';
import { QUICK_PROMPTS } from './v2-constants';

interface ChatAreaProps {
  agentChat: UseAgentChatReturn;
  isVoiceActive: boolean;
  onToggleVoice: () => void;
  onSend: () => void;
}

export function ChatArea({ agentChat, isVoiceActive, onToggleVoice, onSend }: ChatAreaProps) {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* 聊天消息 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {agentChat.messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white'
                : 'bg-white/10 backdrop-blur-sm text-gray-100'
            }`}>
              {msg.role === 'model' && <div className="text-xs text-orange-400 mb-1">🧦 多比</div>}
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</div>
              {msg.role === 'model' && i === agentChat.messages.length - 1 && agentChat.lastIntent && (
                <div className="mt-2 text-xs text-gray-500">
                  {agentChat.toolsUsed.length > 0 && (
                    <span className="mr-2">🔧 {agentChat.toolsUsed.join(', ')}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {agentChat.isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3">
              <div className="text-xs text-orange-400 mb-1">🧦 多比</div>
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-orange-400" />
                <span className="text-sm text-gray-400">正在思考...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 输入区 */}
      <div className="p-4 border-t border-orange-900/20">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <button
            onClick={onToggleVoice}
            className={`flex-shrink-0 p-3 rounded-xl transition-all ${
              isVoiceActive ? 'bg-red-500/30 text-red-400 animate-pulse' : 'bg-white/10 hover:bg-white/20 text-gray-400'
            }`}
            title={isVoiceActive ? '点击停止' : '语音输入'}
          >
            {isVoiceActive ? <Square size={18} /> : <Mic size={18} />}
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={agentChat.input}
              onChange={e => agentChat.handleInputChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder="输入你的问题... 按回车发送"
              className="w-full bg-white/10 backdrop-blur-sm border border-orange-900/30 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30"
              disabled={agentChat.isLoading}
            />
          </div>

          <button
            onClick={onSend}
            disabled={agentChat.isLoading || !agentChat.input.trim()}
            className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {agentChat.isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>

        {/* 快捷按钮 */}
        <div className="flex gap-2 mt-3 max-w-3xl mx-auto overflow-x-auto pb-1">
          {QUICK_PROMPTS.map(q => (
            <button
              key={q.label}
              onClick={() => {
                agentChat.handleInputChange(q.text);
                agentChat.sendMessage(q.text);
              }}
              className="flex-shrink-0 px-3 py-1.5 text-xs rounded-full bg-white/10 hover:bg-white/20 text-gray-300 transition-colors border border-white/10"
              disabled={agentChat.isLoading}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
