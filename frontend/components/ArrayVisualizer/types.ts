export interface ArrayElement {
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
