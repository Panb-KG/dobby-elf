import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Send, 
  BookOpen, 
  Wand2, 
  History, 
  Settings, 
  User,
  MessageSquare,
  ChevronRight,
  BrainCircuit,
  Languages,
  Calculator,
  Calendar,
  Pencil
} from 'lucide-react';
import Markdown from 'react-markdown';
import { magicElf, type Message } from './services/magicElf';
import { cn } from './lib/utils';

const SPELLS = [
  { id: 'schedule', name: '课程表', icon: Calendar, prompt: '多比，帮我看看我的课程安排，或者帮我制定一个学习计划吧！' },
  { id: 'homework', name: '作业', icon: Pencil, prompt: '多比，我有作业问题想请教你，请帮我看看：' },
  { id: 'words', name: '学单词', icon: Languages, prompt: '多比，我想学习一些新单词，或者帮我翻译一下：' },
  { id: 'math', name: '玩奥数', icon: Calculator, prompt: '多比，来一道有趣的奥数题挑战一下，或者帮我解析这道题：' },
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: '呼啦啦！你好呀，小主人！我是你的学习小魔灵多比。今天有什么想探索的知识魔法吗？✨' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = [...messages, userMsg];
      let fullResponse = '';
      
      // Add a placeholder message for streaming
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      const stream = magicElf.chatStream(history);
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'model', text: fullResponse };
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Magic failed:', error);
      setMessages(prev => [...prev, { role: 'model', text: '哎呀，魔法能量好像有点不稳定...请再试一次吧！🌀' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const useSpell = (spell: typeof SPELLS[0]) => {
    setInput(spell.prompt);
  };

  return (
    <div className="relative h-screen w-full flex flex-col overflow-hidden">
      {/* Background Atmosphere */}
      <div className="atmosphere" />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-magic-accent/30 shadow-[0_0_15px_rgba(255,78,0,0.3)]">
            <img 
              src="https://storage.googleapis.com/static.aistudio.google.com/content/202505/22/01/59/78/logo.png" 
              alt="魔法小课桌 Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold tracking-wide text-white">魔法小课桌</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium">Magic Study Desk</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-white/5 transition-colors">
            <History className="w-5 h-5 text-white/60" />
          </button>
          <button className="p-2 rounded-full hover:bg-white/5 transition-colors">
            <User className="w-5 h-5 text-white/60" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row gap-6 p-4 md:p-6 overflow-hidden z-10">
        {/* Left Sidebar - Spells (Desktop) */}
        <aside className="hidden md:flex flex-col gap-4 w-64">
          <div className="glass-panel p-6 flex-1 flex flex-col gap-6">
            <h2 className="text-sm font-serif italic text-white/60 border-b border-white/10 pb-2">魔法咒语库</h2>
            <div className="space-y-3">
              {SPELLS.map((spell) => (
                <button
                  key={spell.id}
                  onClick={() => useSpell(spell)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group text-left"
                >
                  <div className="p-2 rounded-xl bg-white/5 group-hover:bg-magic-accent/20 transition-colors">
                    <spell.icon className="w-4 h-4 text-white/70 group-hover:text-magic-accent" />
                  </div>
                  <span className="text-sm font-medium text-white/80">{spell.name}</span>
                  <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
            
            <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-magic-accent/10 to-transparent border border-magic-accent/20">
              <p className="text-xs text-white/60 leading-relaxed italic">
                "知识是唯一的魔法，而你是那个伟大的魔法师。"
              </p>
            </div>
          </div>
        </aside>

        {/* Chat Area */}
        <section className="flex-1 flex flex-col glass-panel overflow-hidden relative">
          {/* Messages Viewport */}
          <div 
            ref={scrollRef}
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
                    {msg.role === 'model' ? (
                      <div className="markdown-body">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    ) : (
                      <p>{msg.text}</p>
                    )}
                  </div>
                  <span className="text-[10px] mt-2 text-white/30 uppercase tracking-widest font-bold">
                    {msg.role === 'user' ? 'Seeker' : 'Magic Elf'}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-magic-accent/60"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="text-xs italic font-serif">正在施展魔法...</span>
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-6 border-t border-white/5 bg-black/20">
            {/* Mobile Spells Quick Access */}
            <div className="flex md:hidden gap-2 overflow-x-auto pb-4 no-scrollbar">
              {SPELLS.map((spell) => (
                <button
                  key={spell.id}
                  onClick={() => useSpell(spell)}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/70"
                >
                  <spell.icon className="w-3 h-3" />
                  {spell.name}
                </button>
              ))}
            </div>

            <div className="relative group">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="输入你的问题，让魔法发生..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl px-6 py-4 pr-16 text-sm md:text-base focus:outline-none focus:border-magic-accent/50 focus:bg-white/10 transition-all resize-none h-14 md:h-16 flex items-center"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-magic-accent flex items-center justify-center text-white shadow-lg shadow-magic-accent/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Navigation (Mobile) */}
      <nav className="md:hidden flex items-center justify-around py-4 border-t border-white/5 bg-black/40 backdrop-blur-xl z-10">
        <button 
          onClick={() => setActiveTab('chat')}
          className={cn("flex flex-col items-center gap-1", activeTab === 'chat' ? "text-magic-accent" : "text-white/40")}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">对话</span>
        </button>
        <button 
          onClick={() => setActiveTab('library')}
          className={cn("flex flex-col items-center gap-1", activeTab === 'library' ? "text-magic-accent" : "text-white/40")}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">书库</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={cn("flex flex-col items-center gap-1", activeTab === 'profile' ? "text-magic-accent" : "text-white/40")}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">我的</span>
        </button>
      </nav>
    </div>
  );
}
