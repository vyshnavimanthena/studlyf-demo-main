export interface LLNode {
  id: string;
  value: number;
  highlighted: boolean;
}

export interface LogEntry {
  id: string;
  message: string;
  timestamp: Date;
}
