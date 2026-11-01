import { useState, useCallback } from 'react';
import { HashBucket, HashEntry, LogEntry } from './types';

let idCounter = 0;
const newId = () => `ht-${++idCounter}`;
const logId = () => `htlog-${++idCounter}`;

function hashFn(key: number, size: number) {
  return ((key % size) + size) % size;
}

export function useHashTableOperations() {
  const [buckets, setBuckets] = useState<HashBucket[]>([]);
  const [tableSize, setTableSize] = useState(7);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((message: string) => {
    setLogs((prev) => [{ id: logId(), message, timestamp: new Date() }, ...prev]);
  }, []);

  const createTable = useCallback((size: number) => {
    setBuckets(Array.from({ length: size }, (_, i) => ({ index: i, entries: [] })));
    setTableSize(size);
    addLog(`Hash table created with ${size} buckets`);
  }, [addLog]);

  const insert = useCallback((key: number, value: number) => {
    setBuckets((prev) => {
      if (!prev.length) return prev;
      const idx = hashFn(key, prev.length);
      const entry: HashEntry = { id: newId(), key, value, highlighted: false };
      return prev.map((b, i) => {
        if (i !== idx) return b;
        const existing = b.entries.findIndex((e) => e.key === key);
        if (existing >= 0) {
          const nextEntries = [...b.entries];
          nextEntries[existing] = entry;
          return { ...b, entries: nextEntries };
        }
        return { ...b, entries: [...b.entries, entry] };
      });
    });
    addLog(`Inserted key=${key}, value=${value} -> bucket ${hashFn(key, tableSize)}`);
  }, [addLog, tableSize]);

  const deleteKey = useCallback((key: number) => {
    setBuckets((prev) => {
      const idx = hashFn(key, prev.length);
      return prev.map((b, i) => (i === idx ? { ...b, entries: b.entries.filter((e) => e.key !== key) } : b));
    });
    addLog(`Deleted key=${key}`);
  }, [addLog]);

  const search = useCallback((key: number) => {
    setBuckets((prev) => {
      const idx = hashFn(key, prev.length);
      const found = prev[idx]?.entries.some((e) => e.key === key);
      addLog(found ? `Found key=${key}` : `Key=${key} not found`);
      return prev.map((b, i) => ({
        ...b,
        entries: b.entries.map((e) => ({ ...e, highlighted: i === idx && e.key === key })),
      }));
    });
  }, [addLog]);

  const clear = useCallback(() => {
    setBuckets((prev) => prev.map((b) => ({ ...b, entries: [] })));
    addLog('Hash table cleared');
  }, [addLog]);

  return { buckets, logs, createTable, insert, deleteKey, search, clear };
}
