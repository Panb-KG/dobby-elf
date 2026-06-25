/**
 * 知识卡片面板 - 右栏展示检索到的知识
 * v2.0 新增
 */

"use client";

import { useState, useEffect } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { searchKnowledge } from '@/lib/agent/client';
import type { KnowledgeSearchResult } from '@/lib/knowledge';

interface KnowledgeCardPanelProps {
  refs?: string[];
  data?: Record<string, unknown>;
  title?: string;
}

export default function KnowledgeCardPanel({ refs, data, title }: KnowledgeCardPanelProps) {
  const [results, setResults] = useState<KnowledgeSearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // 根据 ref 搜索
  useEffect(() => {
    if (data?.query) {
      doSearch(String(data.query));
    }
  }, [data]);

  const doSearch = async (query: string) => {
    if (!query.trim()) return;
    try {
      setLoading(true);
      const res = await searchKnowledge(query, { topK: 5 });
      setResults(res.results || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {title && (
        <div className="flex items-center gap-2 text-orange-400">
          <BookOpen size={16} />
          <h4 className="text-sm font-medium">{title}</h4>
        </div>
      )}

      {/* 搜索框 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') doSearch(searchQuery);
          }}
          placeholder="搜索知识库..."
          className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
        />
        <button
          onClick={() => doSearch(searchQuery)}
          className="p-2 rounded-lg bg-orange-500/30 hover:bg-orange-500/50 transition-colors"
        >
          <Search size={16} className="text-orange-400" />
        </button>
      </div>

      {/* 搜索结果 */}
      {loading && (
        <div className="text-center py-4 text-gray-400 text-sm">
          搜索中...
        </div>
      )}

      {!loading && results.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-xs">
          没有找到相关知识
        </div>
      )}

      <div className="space-y-2">
        {results.map(result => (
          <div
            key={result.id}
            className="p-3 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-300">
                {result.category}
              </span>
              <span className="text-xs text-gray-500">{result.source}</span>
            </div>
            <h5 className="text-sm font-medium text-orange-300 mb-1">
              {result.title}
            </h5>
            <p className="text-xs text-gray-300 leading-relaxed line-clamp-4">
              {result.content}
            </p>
            <div className="mt-1 text-xs text-gray-500">
              相关度: {Math.round(result.score * 100)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
