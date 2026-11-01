export interface HashEntry {
  id: string;
  key: number;
  value: number;
  highlighted: boolean;
}

export interface HashBucket {
  index: number;
  entries: HashEntry[];
}

export interface LogEntry {
  id: string;
  message: string;
  timestamp: Date;
}
