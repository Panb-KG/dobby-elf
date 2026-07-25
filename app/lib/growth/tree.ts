// Stub: SQLite growth tree module

export interface GrowthTreeNode {
  id: string; userId: string; totalPoints: number; treeLevel: number;
  treeStage: string; waterCount: number; lastWateredAt?: string;
  achievements: string[]; createdAt: string; updatedAt: string;
}
export interface GrowthPointRecord {
  id: string; userId: string; points: number; reason: string; source: string; createdAt: string;
}

export function getGrowthTree(_userId?: string): GrowthTreeNode | null { return null; }
export function createGrowthTree(_userId?: string): GrowthTreeNode { return {} as GrowthTreeNode; }
export function addGrowthPoints(_userId?: string, _points?: number, _reason?: string, _source?: string) { return { tree: {} as GrowthTreeNode, record: {} as GrowthPointRecord }; }
export function waterTree(_userId?: string) { return { tree: {} as GrowthTreeNode, watered: false }; }
export function getPointRecords(_userId?: string, _limit?: number): GrowthPointRecord[] { return []; }
