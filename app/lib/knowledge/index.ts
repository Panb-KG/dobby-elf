/**
 * 知识库模块 - 统一导出
 * v2.0 新增
 */

export * from './types';
export * from './embedder';
export * from './search';

/**
 * 文本分块工具
 * 将长文本按段落/标题切分为小块
 */
export function chunkText(
  text: string,
  options: {
    maxChunkSize?: number;
    overlapSize?: number;
    splitBy?: 'paragraph' | 'heading' | 'sentence';
  } = {}
): string[] {
  const maxChunkSize = options.maxChunkSize || 800;
  const overlapSize = options.overlapSize || 100;
  const splitBy = options.splitBy || 'paragraph';

  if (!text.trim()) return [];

  // 按不同方式切分
  let segments: string[];

  switch (splitBy) {
    case 'heading':
      // 按标题分割（Markdown 格式）
      segments = text.split(/^#{1,6}\s+/m).filter(Boolean);
      break;
    case 'sentence':
      // 按句号/问号/感叹号分割
      segments = text.split(/(?<=[。！？.!?])\s*/).filter(Boolean);
      break;
    case 'paragraph':
    default:
      // 按段落分割（双换行）
      segments = text.split(/\n\s*\n/).filter(Boolean);
      break;
  }

  // 合并小段，切分大段
  const chunks: string[] = [];
  let current = '';

  for (const segment of segments) {
    const trimmed = segment.trim();
    if (!trimmed) continue;

    if ((current + trimmed).length > maxChunkSize && current) {
      chunks.push(current);
      // 重叠部分
      const overlap = current.slice(-overlapSize);
      current = overlap + trimmed;
    } else {
      current = current ? current + '\n\n' + trimmed : trimmed;
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}
