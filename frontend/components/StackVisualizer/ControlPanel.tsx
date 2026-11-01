import React, { useState } from 'react';

interface ControlPanelProps {
  onCreateStack: (values: number[]) => void;
  onPush: (value: number) => void;
  onPop: () => void;
  onPeek: () => void;
  onClear: () => void;
}

export default function ControlPanel({ onCreateStack, onPush, onPop, onPeek, onClear }: ControlPanelProps) {
  const [initialValues, setInitialValues] = useState('1,2,3,4,5');
  const [valueInput, setValueInput] = useState('10');

  return (
    <div className="glass-panel p-5 w-72 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
      <h2 className="text-lg font-bold text-white tracking-tight">Stack</h2>
      <p className="text-xs text-white/70 -mt-2">LIFO - Last In, First Out</p>
      <input className="neon-input" value={initialValues} onChange={(e) => setInitialValues(e.target.value)} placeholder="1,2,3,4,5" />
      <input className="neon-input" type="number" value={valueInput} onChange={(e) => setValueInput(e.target.value)} />
      <div className="grid grid-cols-2 gap-2">
        <button className="neon-button" onClick={() => {
          const vals = initialValues.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
          if (vals.length) onCreateStack(vals);
        }}>Create</button>
        <button className="neon-button" onClick={() => onPush(parseInt(valueInput, 10) || 0)}>Push</button>
        <button className="neon-button" onClick={onPop}>Pop</button>
        <button className="neon-button" onClick={onPeek}>Peek</button>
        <button className="neon-button col-span-2" onClick={onClear}>Clear</button>
      </div>
    </div>
  );
}

