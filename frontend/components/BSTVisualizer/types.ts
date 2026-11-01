export interface BSTNode {
  id: string;
  value: number;
  left: BSTNode | null;
  right: BSTNode | null;
  highlighted: boolean;
}

export interface FlatBSTNode {
  id: string;
  value: number;
  x: number;
  y: number;
  highlighted: boolean;
  parentId: string | null;
  parentX: number;
  parentY: number;
}

export interface LogEntry {
  id: string;
  message: string;
  timestamp: Date;
}
