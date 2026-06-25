/**
 * 知识库模块 - 类型定义
 * v2.0 新增
 */

export interface KnowledgeItem {
  id: string;
  userId: string;
  source: string;        // 来源：文件名
  category: string;      // 分类：数学/语文/英语/科学/奥数
  title: string;         // 标题/小节名
  content: string;       // 文本内容
  embedding?: number[];  // 向量（1536 维）
  metadata: KnowledgeMetadata;
  createdAt: string;
}

export interface KnowledgeMetadata {
  grade: number;         // 年级 1-6
  chapter: string;       // 章节
  page?: number;         // 页码
  type: 'textbook' | 'question' | 'outline' | 'reference';
  tags?: string[];       // 标签
}

export interface KnowledgeSearchRequest {
  query: string;
  topK?: number;
  category?: string;
  grade?: number;
  type?: 'textbook' | 'question' | 'outline' | 'reference';
  userId?: string;
}

export interface KnowledgeSearchResult {
  id: string;
  source: string;
  category: string;
  title: string;
  content: string;
  score: number;
  metadata: KnowledgeMetadata;
}

export interface KnowledgeUploadResult {
  success: boolean;
  totalChunks: number;
  errors?: string[];
}

/**
 * 文本分块配置
 */
export interface ChunkConfig {
  maxChunkSize: number;   // 最大分块大小（字符数）
  overlapSize: number;    // 块重叠大小
  splitBy: 'paragraph' | 'heading' | 'sentence';
}

export const DEFAULT_CHUNK_CONFIG: ChunkConfig = {
  maxChunkSize: 800,
  overlapSize: 100,
  splitBy: 'paragraph',
};
