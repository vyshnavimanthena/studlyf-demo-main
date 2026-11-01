import { useState, useCallback } from 'react';
import { StackElement, LogEntry } from './types';

let idCounter = 0;
const newId = () => `stack-${++idCounter}`;
const logId = () => `slog-${++idCounter}`;

export function useStackOperations() {
  const [elements, setElements] = useState<StackElement[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((message: string) => {
    setLogs((prev) => [{ id: logId(), message, timestamp: new Date() }, ...prev]);
  }, []);

  const createStack = useCallback((values: number[]) => {
    setElements(values.map((value, index) => ({ id: newId(), value, index, highlighted: false })));
    addLog(`Stack created with [${values.join(', ')}]`);
  }, [addLog]);

  const push = useCallback((value: number) => {
    setElements((prev) => [...prev, { id: newId(), value, index: prev.length, highlighted: false }]);
    addLog(`Pushed ${value}`);
  }, [addLog]);

  const pop = useCallback(() => {
    setElements((prev) => {
      if (!prev.length) return prev;
      addLog(`Popped ${prev[prev.length - 1].value}`);
      return prev.slice(0, -1);
    });
  }, [addLog]);

  const peek = useCallback(() => {
    setElements((prev) => {
      if (!prev.length) return prev;
      addLog(`Peek ${prev[prev.length - 1].value}`);
      return prev.map((el, i) => ({ ...el, highlighted: i === prev.length - 1 }));
    });
  }, [addLog]);

  const clear = useCallback(() => {
    setElements([]);
    addLog('Stack cleared');
  }, [addLog]);

  return { elements, logs, createStack, push, pop, peek, clear };
}
