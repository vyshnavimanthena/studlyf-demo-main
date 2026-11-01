import React, { useState } from 'react';

interface ControlPanelProps {
  onCreateBST: (values: number[]) => void;
  onInsert: (value: number) => void;
  onDelete: (value: number) => void;
  onSearch: (value: number) => void;
  onClear: () => void;
}

export default function ControlPanel({ onCreateBST, onInsert, onDelete, onSearch, onClear }: ControlPanelProps) {
  const [initialValues, setInitialValues] = useState('8,4,12,2,6,10,14');
  const [valueInput, setValueInput] = useState('5');
  const val = () => parseInt(valueInput, 10) || 0;

  return (
    <div className="glass-panel p-5 w-72 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
      <h2 className="text-lg font-bold text-white tracking-tight">Binary Search Tree</h2>
      <p className="text-xs text-white/70 -mt-2">Ordered tree with left &lt; root &lt; right</p>
      <input className="neon-input" value={initialValues} onChange={(e) => setInitialValues(e.target.value)} />
      <input className="neon-input" type="number" value={valueInput} onChange={(e) => setValueInput(e.target.value)} />
      <div className="grid grid-cols-2 gap-2">
        <button className="neon-button" onClick={() => {
          const vals = initialValues.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
          if (vals.length) onCreateBST(vals);
        }}>Create</button>
        <button className="neon-button" onClick={() => onInsert(val())}>Insert</button>
        <button className="neon-button" onClick={() => onDelete(val())}>Delete</button>
        <button className="neon-button" onClick={() => onSearch(val())}>Search</button>
        <button className="neon-button col-span-2" onClick={onClear}>Clear</button>
      </div>
    </div>
  );
}

