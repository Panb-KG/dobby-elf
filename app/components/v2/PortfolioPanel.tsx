/**
 * 星光档案面板组件
 * 
 * 功能：
 * - 时间轴展示成长记录
 * - 上传奖状/证书/成绩单/照片
 * - AI 简历生成
 */

"use client";

import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { Upload, Sparkles, Star, Trash2, Calendar, Tag, FileText } from 'lucide-react';
import { authFetch } from '@/lib/api-client';
import type { PortfolioItem, PortfolioCategory } from '@/types';
import { PORTFOLIO_CATEGORY_LABELS } from '@/types';

interface PortfolioPanelProps {
  userId: string;
}

type ViewMode = 'timeline' | 'upload' | 'resume';

export default memo(function PortfolioPanel({ userId }: PortfolioPanelProps) {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [generating, setGenerating] = useState(false);
  const [resumeContent, setResumeContent] = useState<string | null>(null);

  // 上传表单
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<PortfolioCategory>('award');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadDate, setUploadDate] = useState('');
  const [uploadSource, setUploadSource] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 简历生成表单
  const [resumePurpose, setResumePurpose] = useState('');
  const [resumeStyle, setResumeStyle] = useState('');
  const [resumeExtra, setResumeExtra] = useState('');

  // 加载档案列表
  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const url = selectedCategory === 'all'
        ? '/api/portfolio'
        : `/api/portfolio?category=${selectedCategory}`;
      const res = await authFetch(url);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error('[Portfolio] Load error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // 上传文件
  const handleUpload = async () => {
    if (!uploadFile && !uploadTitle) {
      alert('请至少填写标题或上传文件');
      return;
    }

    setUploading(true);
    try {
      if (uploadFile) {
        // 文件上传（同时创建记录）
        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('category', uploadCategory);
        formData.append('title', uploadTitle || uploadFile.name);

        const res = await authFetch('/api/portfolio/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          alert('上传失败: ' + (err.error || '未知错误'));
          return;
        }
      } else {
        // 仅创建记录（无文件）
        const res = await authFetch('/api/portfolio', {
          method: 'POST',
          body: JSON.stringify({
            title: uploadTitle,
            category: uploadCategory,
            description: uploadDesc || undefined,
            event_date: uploadDate || undefined,
            source: uploadSource || undefined,
            tags: uploadTags ? uploadTags.split(',').map(t => t.trim()).filter(Boolean) : [],
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          alert('创建失败: ' + (err.error || '未知错误'));
          return;
        }
      }

      // 重置表单
      setUploadTitle('');
      setUploadDesc('');
      setUploadDate('');
      setUploadSource('');
      setUploadTags('');
      setUploadFile(null);
      setViewMode('timeline');
      loadItems();
    } catch (err) {
      console.error('[Portfolio] Upload error:', err);
      alert('上传失败');
    } finally {
      setUploading(false);
    }
  };

  // 删除记录
  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这条记录吗？')) return;

    try {
      const res = await authFetch(`/api/portfolio?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== id));
      }
    } catch (err) {
      console.error('[Portfolio] Delete error:', err);
    }
  };

  // 切换星标
  const handleToggleFavorite = async (item: PortfolioItem) => {
    try {
      const res = await authFetch('/api/portfolio', {
        method: 'PUT',
        body: JSON.stringify({ id: item.id, is_favorite: !item.is_favorite }),
      });
      if (res.ok) {
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_favorite: !i.is_favorite } : i));
      }
    } catch (err) {
      console.error('[Portfolio] Toggle favorite error:', err);
    }
  };

  // 生成简历
  const handleGenerateResume = async () => {
    setGenerating(true);
    setResumeContent(null);
    try {
      const res = await authFetch('/api/portfolio/resume', {
        method: 'POST',
        body: JSON.stringify({
          purpose: resumePurpose || undefined,
          style: resumeStyle || undefined,
          extra_prompt: resumeExtra || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResumeContent(data.resume?.content || '');
      } else {
        const err = await res.json();
        alert(err.error || '生成失败');
      }
    } catch (err) {
      console.error('[Portfolio] Resume error:', err);
      alert('生成失败');
    } finally {
      setGenerating(false);
    }
  };

  // 按日期分组
  const groupedItems = items.reduce<Record<string, PortfolioItem[]>>((acc, item) => {
    const date = item.event_date || item.created_at?.split('T')[0] || '未知日期';
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedItems).sort((a, b) => b.localeCompare(a));

  return (
    <div className="flex flex-col h-full">
      {/* 顶部标签栏 */}
      <div className="flex gap-1 p-2 border-b border-orange-900/20">
        <button
          onClick={() => setViewMode('timeline')}
          className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
            viewMode === 'timeline' ? 'bg-orange-500/20 text-orange-400' : 'hover:bg-white/5 text-gray-400'
          }`}
        >
          📅 时间轴
        </button>
        <button
          onClick={() => setViewMode('upload')}
          className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
            viewMode === 'upload' ? 'bg-orange-500/20 text-orange-400' : 'hover:bg-white/5 text-gray-400'
          }`}
        >
          📤 上传
        </button>
        <button
          onClick={() => setViewMode('resume')}
          className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
            viewMode === 'resume' ? 'bg-orange-500/20 text-orange-400' : 'hover:bg-white/5 text-gray-400'
          }`}
        >
          📄 简历
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {/* ===== 时间轴视图 ===== */}
        {viewMode === 'timeline' && (
          <>
            {/* 分类筛选 */}
            <div className="flex gap-1 mb-3 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2 py-1 text-[10px] rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === 'all' ? 'bg-orange-500/30 text-orange-400' : 'bg-white/5 text-gray-400'
                }`}
              >
                全部
              </button>
              {Object.entries(PORTFOLIO_CATEGORY_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-2 py-1 text-[10px] rounded-full whitespace-nowrap transition-colors ${
                    selectedCategory === key ? 'bg-orange-500/30 text-orange-400' : 'bg-white/5 text-gray-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500 text-sm">加载中...</div>
            ) : items.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">✨</div>
                <div className="text-sm text-gray-500">还没有成长记录</div>
                <button
                  onClick={() => setViewMode('upload')}
                  className="mt-3 px-4 py-2 text-xs rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors"
                >
                  上传第一条记录
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedDates.map(date => (
                  <div key={date}>
                    {/* 日期标题 */}
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar size={12} className="text-orange-400" />
                      <span className="text-xs text-orange-400 font-medium">{date}</span>
                    </div>

                    {/* 记录列表 */}
                    <div className="space-y-2 ml-4 border-l border-orange-900/30 pl-3">
                      {groupedItems[date].map(item => (
                        <div key={item.id} className="relative group">
                          {/* 时间轴圆点 */}
                          <div className="absolute -left-[17px] top-2 w-2 h-2 rounded-full bg-orange-500/50" />

                          <div className="bg-white/5 rounded-xl p-3 hover:bg-white/10 transition-colors">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs">{PORTFOLIO_CATEGORY_LABELS[item.category]?.split(' ')[0] || '📁'}</span>
                                  <span className="text-sm text-white font-medium truncate">{item.title}</span>
                                  {item.is_favorite && <Star size={12} className="text-yellow-400 fill-yellow-400" />}
                                </div>
                                {item.description && (
                                  <div className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</div>
                                )}
                                {item.source && (
                                  <div className="text-[10px] text-gray-500 mt-1">来源: {item.source}</div>
                                )}
                                {item.tags && item.tags.length > 0 && (
                                  <div className="flex gap-1 mt-1.5 flex-wrap">
                                    {item.tags.map(tag => (
                                      <span key={tag} className="px-1.5 py-0.5 text-[9px] rounded bg-white/5 text-gray-400">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* 操作按钮 */}
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleToggleFavorite(item)}
                                  className="p-1 rounded hover:bg-white/10"
                                  title={item.is_favorite ? '取消星标' : '星标'}
                                >
                                  <Star size={12} className={item.is_favorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'} />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="p-1 rounded hover:bg-red-500/20"
                                  title="删除"
                                >
                                  <Trash2 size={12} className="text-gray-400 hover:text-red-400" />
                                </button>
                              </div>
                            </div>

                            {/* 图片预览 */}
                            {item.fileUrl && (
                              <div className="mt-2">
                                <img
                                  src={item.fileUrl}
                                  alt={item.title}
                                  className="max-w-full h-auto max-h-32 rounded-lg object-cover"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ===== 上传视图 ===== */}
        {viewMode === 'upload' && (
          <div className="space-y-3">
            <div className="text-sm text-white font-medium mb-2">📤 添加成长记录</div>

            {/* 文件选择 */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-orange-900/30 rounded-xl p-4 text-center cursor-pointer hover:border-orange-500/50 transition-colors"
            >
              <Upload size={24} className="mx-auto text-gray-500 mb-2" />
              {uploadFile ? (
                <div className="text-xs text-orange-400">{uploadFile.name}</div>
              ) : (
                <div className="text-xs text-gray-500">点击选择文件（图片/PDF，最大 10MB）</div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={e => setUploadFile(e.target.files?.[0] || null)}
              />
            </div>

            {/* 标题 */}
            <input
              type="text"
              value={uploadTitle}
              onChange={e => setUploadTitle(e.target.value)}
              placeholder="标题 *（如：三年级数学竞赛一等奖）"
              className="w-full bg-white/5 border border-orange-900/30 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
            />

            {/* 分类 */}
            <select
              value={uploadCategory}
              onChange={e => setUploadCategory(e.target.value as PortfolioCategory)}
              className="w-full bg-white/5 border border-orange-900/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50"
            >
              {Object.entries(PORTFOLIO_CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key} className="bg-gray-900">{label}</option>
              ))}
            </select>

            {/* 描述 */}
            <textarea
              value={uploadDesc}
              onChange={e => setUploadDesc(e.target.value)}
              placeholder="描述（可选）"
              rows={2}
              className="w-full bg-white/5 border border-orange-900/30 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 resize-none"
            />

            {/* 日期和来源 */}
            <div className="flex gap-2">
              <input
                type="date"
                value={uploadDate}
                onChange={e => setUploadDate(e.target.value)}
                className="flex-1 bg-white/5 border border-orange-900/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50"
              />
              <input
                type="text"
                value={uploadSource}
                onChange={e => setUploadSource(e.target.value)}
                placeholder="来源（如：XX学校）"
                className="flex-1 bg-white/5 border border-orange-900/30 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
              />
            </div>

            {/* 标签 */}
            <div className="relative">
              <Tag size={14} className="absolute left-3 top-2.5 text-gray-500" />
              <input
                type="text"
                value={uploadTags}
                onChange={e => setUploadTags(e.target.value)}
                placeholder="标签（逗号分隔，如：数学,竞赛,校级）"
                className="w-full bg-white/5 border border-orange-900/30 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
              />
            </div>

            {/* 提交按钮 */}
            <button
              onClick={handleUpload}
              disabled={uploading || (!uploadFile && !uploadTitle)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-medium hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {uploading ? '上传中...' : '✨ 添加记录'}
            </button>
          </div>
        )}

        {/* ===== 简历生成视图 ===== */}
        {viewMode === 'resume' && (
          <div className="space-y-3">
            <div className="text-sm text-white font-medium mb-2">📄 AI 简历生成</div>

            {!resumeContent ? (
              <>
                <div className="text-xs text-gray-400 mb-2">
                  基于 {items.length} 条成长记录生成简历
                </div>

                <input
                  type="text"
                  value={resumePurpose}
                  onChange={e => setResumePurpose(e.target.value)}
                  placeholder="用途（如：小升初择校、竞选班干部）"
                  className="w-full bg-white/5 border border-orange-900/30 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
                />

                <select
                  value={resumeStyle}
                  onChange={e => setResumeStyle(e.target.value)}
                  className="w-full bg-white/5 border border-orange-900/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50"
                >
                  <option value="" className="bg-gray-900">选择风格</option>
                  <option value="简洁正式" className="bg-gray-900">简洁正式</option>
                  <option value="活泼可爱" className="bg-gray-900">活泼可爱</option>
                  <option value="突出特长" className="bg-gray-900">突出特长</option>
                  <option value="全面发展" className="bg-gray-900">全面发展</option>
                </select>

                <textarea
                  value={resumeExtra}
                  onChange={e => setResumeExtra(e.target.value)}
                  placeholder="其他要求（可选，如：重点突出数学方面的成绩）"
                  rows={3}
                  className="w-full bg-white/5 border border-orange-900/30 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 resize-none"
                />

                <button
                  onClick={handleGenerateResume}
                  disabled={generating || items.length === 0}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <Sparkles size={14} className="animate-spin" />
                      AI 正在生成...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      ✨ 生成简历
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                {/* 简历内容展示 */}
                <div className="bg-white/5 rounded-xl p-4 border border-orange-900/20">
                  <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-sm text-gray-200 leading-relaxed">
                    {resumeContent}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(resumeContent);
                      alert('已复制到剪贴板');
                    }}
                    className="flex-1 py-2 rounded-xl bg-white/10 text-white text-xs hover:bg-white/20 transition-colors"
                  >
                    📋 复制
                  </button>
                  <button
                    onClick={() => setResumeContent(null)}
                    className="flex-1 py-2 rounded-xl bg-white/10 text-white text-xs hover:bg-white/20 transition-colors"
                  >
                    🔄 重新生成
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
