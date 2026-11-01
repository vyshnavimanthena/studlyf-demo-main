import { useState, useCallback } from 'react';
import { ArrayElement, LogEntry } from './types';

let idCounter = 0;
const newId = () => `arr-${++idCounter}`;
const logId = () => `arrlog-${++idCounter}`;

export function useArrayOperations() {
  const [elements, setElements] = useState<ArrayElement[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((message: string) => {
    setLogs((prev) => [{ id: logId(), message, timestamp: new Date() }, ...prev]);
  }, []);

  const createArray = useCallback((values: number[]) => {
    setElements(values.map((value, index) => ({ id: newId(), value, index, highlighted: false })));
    addLog(`Array created with [${values.join(', ')}]`);
  }, [addLog]);

  const insertAt = useCallback((index: number, value: number) => {
    setElements((prev) => {
      if (index < 0 || index > prev.length) return prev;
      const next = [...prev];
      next.splice(index, 0, { id: newId(), value, index, highlighted: false });
      return next.map((el, i) => ({ ...el, index: i }));
    });
    addLog(`Inserted ${value} at ${index}`);
  }, [addLog]);

  const deleteAt = useCallback((index: number) => {
    setElements((prev) => prev.filter((_, i) => i !== index).map((el, i) => ({ ...el, index: i })));
    addLog(`Deleted element at ${index}`);
  }, [addLog]);

  const updateAt = useCallback((index: number, value: number) => {
    setElements((prev) => prev.map((el, i) => (i === index ? { ...el, value } : el)));
    addLog(`Updated index ${index} to ${value}`);
  }, [addLog]);

  const swapIndices = useCallback((i: number, j: number) => {
    setElements((prev) => {
      if (i < 0 || j < 0 || i >= prev.length || j >= prev.length) return prev;
      const next = [...prev];
      const temp = { ...next[i] };
      next[i] = { ...next[j], index: i };
      next[j] = { ...temp, index: j };
      return next;
    });
    addLog(`Swapped ${i} and ${j}`);
  }, [addLog]);

  const highlightAt = useCallback((index: number) => {
    setElements((prev) => prev.map((el, i) => ({ ...el, highlighted: i === index ? !el.highlighted : el.highlighted })));
    addLog(`Toggled highlight at ${index}`);
  }, [addLog]);

  return { elements, logs, createArray, insertAt, deleteAt, updateAt, swapIndices, highlightAt };
}
