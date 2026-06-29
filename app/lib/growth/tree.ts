// Stub: SQLite growth tree module

export interface GrowthTreeNode {
  id: string; userId: string; totalPoints: number; treeLevel: number;
  treeStage: string; waterCount: number; lastWateredAt?: string;
  achievements: string[]; createdAt: string; updatedAt: string;
}
export interface GrowthPointRecord {
  id: string; userId: string; points: number; reason: string; source: string; createdAt: string;
}

export function getGrowthTree(): GrowthTreeNode | null { return null; }
export function createGrowthTree(): GrowthTreeNode { return {} as GrowthTreeNode; }
export function addGrowthPoints() { return { tree: {} as GrowthTreeNode, record: {} as GrowthPointRecord }; }
export function waterTree() { return { tree: {} as GrowthTreeNode, watered: false }; }
export function getPointRecords(): GrowthPointRecord[] { return []; }
