export interface StackElement {
  id: string;
  value: number;
  index: number;
  highlighted: boolean;
}

export interface LogEntry {
  id: string;
  message: string;
  timestamp: Date;
}
