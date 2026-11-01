import { useState, useCallback } from 'react';
import { QueueElement, LogEntry } from './types';

let idCounter = 0;
const newId = () => `queue-${++idCounter}`;
const logId = () => `qlog-${++idCounter}`;

export function useQueueOperations() {
  const [elements, setElements] = useState<QueueElement[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((message: string) => {
    setLogs((prev) => [{ id: logId(), message, timestamp: new Date() }, ...prev]);
  }, []);

  const createQueue = useCallback((values: number[]) => {
    setElements(values.map((value, index) => ({ id: newId(), value, index, highlighted: false })));
    addLog(`Queue created with [${values.join(', ')}]`);
  }, [addLog]);

  const enqueue = useCallback((value: number) => {
    setElements((prev) => [...prev, { id: newId(), value, index: prev.length, highlighted: false }]);
    addLog(`Enqueued ${value}`);
  }, [addLog]);

  const dequeue = useCallback(() => {
    setElements((prev) => {
      if (!prev.length) return prev;
      addLog(`Dequeued ${prev[0].value}`);
      return prev.slice(1).map((el, i) => ({ ...el, index: i }));
    });
  }, [addLog]);

  const peekFront = useCallback(() => {
    setElements((prev) => {
      if (!prev.length) return prev;
      addLog(`Front is ${prev[0].value}`);
      return prev.map((el, i) => ({ ...el, highlighted: i === 0 }));
    });
  }, [addLog]);

  const peekRear = useCallback(() => {
    setElements((prev) => {
      if (!prev.length) return prev;
      addLog(`Rear is ${prev[prev.length - 1].value}`);
      return prev.map((el, i) => ({ ...el, highlighted: i === prev.length - 1 }));
    });
  }, [addLog]);

  const clear = useCallback(() => {
    setElements([]);
    addLog('Queue cleared');
  }, [addLog]);

  return { elements, logs, createQueue, enqueue, dequeue, peekFront, peekRear, clear };
}
