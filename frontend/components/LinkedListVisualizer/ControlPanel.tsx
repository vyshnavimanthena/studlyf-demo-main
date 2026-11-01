import React, { useState } from 'react';

interface ControlPanelProps {
  onCreateList: (values: number[]) => void;
  onInsertHead: (value: number) => void;
  onInsertTail: (value: number) => void;
  onInsertAt: (index: number, value: number) => void;
  onDeleteHead: () => void;
  onDeleteTail: () => void;
  onSearch: (value: number) => void;
  onClear: () => void;
}

export default function ControlPanel({ onCreateList, onInsertHead, onInsertTail, onInsertAt, onDeleteHead, onDeleteTail, onSearch, onClear }: ControlPanelProps) {
  const [initialValues, setInitialValues] = useState('1,2,3,4,5');
  const [valueInput, setValueInput] = useState('10');
  const [indexInput, setIndexInput] = useState('0');

  const value = () => parseInt(valueInput, 10) || 0;
  const index = () => parseInt(indexInput, 10) || 0;

  return (
    <div className="glass-panel p-5 w-72 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
      <h2 className="text-lg font-bold text-white tracking-tight">Linked List</h2>
      <p className="text-xs text-white/70 -mt-2">Singly linked with head/tail pointers</p>
      <input className="neon-input" value={initialValues} onChange={(e) => setInitialValues(e.target.value)} placeholder="1,2,3,4,5" />
      <div className="grid grid-cols-2 gap-2">
        <input className="neon-input" type="number" value={indexInput} onChange={(e) => setIndexInput(e.target.value)} placeholder="Index" />
        <input className="neon-input" type="number" value={valueInput} onChange={(e) => setValueInput(e.target.value)} placeholder="Value" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button className="neon-button" onClick={() => {
          const vals = initialValues.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
          if (vals.length) onCreateList(vals);
        }}>Create</button>
        <button className="neon-button" onClick={() => onInsertHead(value())}>Insert Head</button>
        <button className="neon-button" onClick={() => onInsertTail(value())}>Insert Tail</button>
        <button className="neon-button" onClick={() => onInsertAt(index(), value())}>Insert At</button>
        <button className="neon-button" onClick={onDeleteHead}>Delete Head</button>
        <button className="neon-button" onClick={onDeleteTail}>Delete Tail</button>
        <button className="neon-button" onClick={() => onSearch(value())}>Search</button>
        <button className="neon-button" onClick={onClear}>Clear</button>
      </div>
    </div>
  );
}

