import { useState, useCallback } from 'react';
import { LLNode, LogEntry } from './types';

let idCounter = 0;
const newId = () => `ll-${++idCounter}`;
const logId = () => `lllog-${++idCounter}`;

export function useLinkedListOperations() {
  const [nodes, setNodes] = useState<LLNode[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((message: string) => {
    setLogs((prev) => [{ id: logId(), message, timestamp: new Date() }, ...prev]);
  }, []);

  const createList = useCallback((values: number[]) => {
    setNodes(values.map((value) => ({ id: newId(), value, highlighted: false })));
    addLog(`Linked list created with [${values.join(', ')}]`);
  }, [addLog]);

  const insertHead = useCallback((value: number) => {
    setNodes((prev) => [{ id: newId(), value, highlighted: false }, ...prev]);
    addLog(`Inserted ${value} at head`);
  }, [addLog]);

  const insertTail = useCallback((value: number) => {
    setNodes((prev) => [...prev, { id: newId(), value, highlighted: false }]);
    addLog(`Inserted ${value} at tail`);
  }, [addLog]);

  const insertAt = useCallback((index: number, value: number) => {
    setNodes((prev) => {
      if (index < 0 || index > prev.length) return prev;
      const next = [...prev];
      next.splice(index, 0, { id: newId(), value, highlighted: false });
      return next;
    });
    addLog(`Inserted ${value} at index ${index}`);
  }, [addLog]);

  const deleteHead = useCallback(() => {
    setNodes((prev) => {
      if (!prev.length) return prev;
      addLog(`Deleted head ${prev[0].value}`);
      return prev.slice(1);
    });
  }, [addLog]);

  const deleteTail = useCallback(() => {
    setNodes((prev) => {
      if (!prev.length) return prev;
      addLog(`Deleted tail ${prev[prev.length - 1].value}`);
      return prev.slice(0, -1);
    });
  }, [addLog]);

  const search = useCallback((value: number) => {
    setNodes((prev) => {
      const idx = prev.findIndex((n) => n.value === value);
      addLog(idx >= 0 ? `Found ${value} at ${idx}` : `${value} not found`);
      return prev.map((n, i) => ({ ...n, highlighted: i === idx }));
    });
  }, [addLog]);

  const clear = useCallback(() => {
    setNodes([]);
    addLog('Linked list cleared');
  }, [addLog]);

  return { nodes, logs, createList, insertHead, insertTail, insertAt, deleteHead, deleteTail, search, clear };
}
