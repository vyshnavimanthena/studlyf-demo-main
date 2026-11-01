export interface QueueElement {
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
