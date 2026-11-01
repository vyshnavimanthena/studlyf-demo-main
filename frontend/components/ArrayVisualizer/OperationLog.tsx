import React from 'react';

interface LogEntry {
  id: string;
  message: string;
  timestamp: Date;
}

interface OperationLogProps {
  logs: LogEntry[];
}

export default function OperationLog({ logs }: OperationLogProps) {
  return (
    <div className="glass-panel p-5 w-72 max-h-[60vh] flex flex-col gap-3">
      <h2 className="text-lg font-bold text-white tracking-tight">Operation Log</h2>
      <div className="flex flex-col gap-1.5 overflow-y-auto pr-1">
        {logs.length === 0 && (
          <p className="text-xs text-white/70 italic">No operations yet</p>
        )}
        {logs.map((log) => (
          <div
            key={log.id}
            className="text-xs text-white/80 py-1.5 px-2 rounded bg-white/10 border border-white/20"
          >
            <span className="text-[#C4B5FD] mr-1.5">*</span>
            {log.message}
          </div>
        ))}
      </div>
    </div>
  );
}

