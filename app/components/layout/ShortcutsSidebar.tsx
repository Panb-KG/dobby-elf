"use client";

import { Calendar, Pencil, Sparkles, Hourglass, Trophy, ChevronRight } from 'lucide-react';
import type { Spell } from '../../types';

interface ShortcutsSidebarProps {
  shortcuts: Spell[];
  onUseSpell: (spell: Spell) => void;
}

export function ShortcutsSidebar({ shortcuts, onUseSpell }: ShortcutsSidebarProps) {
  return (
    <aside className="hidden md:flex flex-col gap-4 w-64">
      <div className="glass-panel p-6 flex-1 flex flex-col gap-6">
        <h2 className="text-sm font-serif italic text-white/60 border-b border-white/10 pb-2">魔法咒语库</h2>
        <div className="space-y-3">
          {shortcuts.map((spell) => (
            <button
              key={spell.id}
              onClick={() => onUseSpell(spell)}
              className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group text-left"
            >
              <div className="p-2 rounded-xl bg-white/5 group-hover:bg-magic-accent/20 transition-colors">
                {spell.id === 'schedule' && <Calendar className="w-4 h-4 text-white/70 group-hover:text-magic-accent" />}
                {spell.id === 'homework' && <Pencil className="w-4 h-4 text-white/70 group-hover:text-magic-accent" />}
                {spell.id === 'words' && <Sparkles className="w-4 h-4 text-white/70 group-hover:text-magic-accent" />}
                {spell.id === 'math' && <Sparkles className="w-4 h-4 text-white/70 group-hover:text-magic-accent" />}
                {spell.id === 'focus' && <Hourglass className="w-4 h-4 text-white/70 group-hover:text-magic-accent" />}
                {spell.id === 'achievements' && <Trophy className="w-4 h-4 text-white/70 group-hover:text-magic-accent" />}
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
  );
}
