import React, { useState } from 'react';

interface ControlPanelProps {
  onCreateArray: (values: number[]) => void;
  onInsert: (index: number, value: number) => void;
  onDelete: (index: number) => void;
  onUpdate: (index: number, value: number) => void;
  onSwap: (i: number, j: number) => void;
  onHighlight: (index: number) => void;
}

export default function ControlPanel({ onCreateArray, onInsert, onDelete, onUpdate, onSwap, onHighlight }: ControlPanelProps) {
  const [initialValues, setInitialValues] = useState('1,2,3,4,5');
  const [indexA, setIndexA] = useState('0');
  const [valueInput, setValueInput] = useState('10');

  const parseIndex = () => parseInt(indexA, 10) || 0;
  const parseValue = () => parseInt(valueInput, 10) || 0;

  return (
    <div className="glass-panel p-5 w-72 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
      <h2 className="text-lg font-bold text-white tracking-tight">Array</h2>
      <p className="text-xs text-white/70 -mt-2">Linear collection with index access</p>
      <input className="neon-input" value={initialValues} onChange={(e) => setInitialValues(e.target.value)} placeholder="1,2,3,4,5" />
      <div className="grid grid-cols-2 gap-2">
        <input className="neon-input" type="number" value={indexA} onChange={(e) => setIndexA(e.target.value)} placeholder="Index" />
        <input className="neon-input" type="number" value={valueInput} onChange={(e) => setValueInput(e.target.value)} placeholder="Value" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button className="neon-button" onClick={() => {
          const vals = initialValues.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
          if (vals.length) onCreateArray(vals);
        }}>Create</button>
        <button className="neon-button" onClick={() => onInsert(parseIndex(), parseValue())}>Insert</button>
        <button className="neon-button" onClick={() => onDelete(parseIndex())}>Delete</button>
        <button className="neon-button" onClick={() => onUpdate(parseIndex(), parseValue())}>Update</button>
        <button className="neon-button" onClick={() => onSwap(parseIndex(), parseValue())}>Swap</button>
        <button className="neon-button" onClick={() => onHighlight(parseIndex())}>Highlight</button>
      </div>
    </div>
  );
}

