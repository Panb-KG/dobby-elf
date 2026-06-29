// Stub: SQLite knowledge types

export interface KnowledgeItem {
  id: string; userId: string; source: string; category: string;
  title: string; content: string; embedding?: number[]; metadata: Record<string, any>; createdAt: string;
}

export interface KnowledgeSearchResult {
  item: KnowledgeItem; score: number;
}
