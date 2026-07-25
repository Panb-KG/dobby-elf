// Stub: SQLite knowledge search module

import type { KnowledgeItem, KnowledgeSearchResult } from './types';

export async function searchKnowledge(_request?: { query?: string; topK?: number; category?: string; grade?: number; userId?: string }): Promise<KnowledgeSearchResult[]> { return []; }
export async function batchInsertKnowledge(): Promise<void> { }

export function chunkText(
  text: string,
  options: { maxChunkSize?: number; overlapSize?: number; splitBy?: 'paragraph' | 'heading' | 'sentence' } = {}
): string[] {
  if (!text.trim()) return [];
  return [text];
}
