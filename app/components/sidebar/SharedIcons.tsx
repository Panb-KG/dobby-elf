/**
 * 右栏共享图标和图片内容组件
 */

"use client";

import { Sparkles } from 'lucide-react';

export function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
  );
}

export function ImageContent({ generatedImage }: { generatedImage: string | null }) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/20 min-h-[200px] flex items-center justify-center">
        {generatedImage ? (
          <img src={generatedImage} alt="魔法生成图片" className="w-full h-auto object-cover" referrerPolicy="no-referrer" />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Sparkles className="w-8 h-8 text-magic-accent animate-pulse" />
            <p className="text-xs text-white/40 italic">正在绘制魔法图像...</p>
          </div>
        )}
      </div>
      {generatedImage && (
        <button
          onClick={() => { const link = document.createElement('a'); link.href = generatedImage; link.download = 'magic-image.png'; link.click(); }}
          className="w-full py-2 rounded-xl bg-white/5 text-magic-accent text-xs font-bold hover:bg-white/10 transition-all"
        >
          保存魔法图片
        </button>
      )}
    </div>
  );
}
