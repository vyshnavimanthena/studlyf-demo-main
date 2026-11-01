import React, { useState } from 'react';

interface ControlPanelProps {
  onCreateTable: (size: number) => void;
  onInsert: (key: number, value: number) => void;
  onDelete: (key: number) => void;
  onSearch: (key: number) => void;
  onClear: () => void;
}

export default function ControlPanel({ onCreateTable, onInsert, onDelete, onSearch, onClear }: ControlPanelProps) {
  const [sizeInput, setSizeInput] = useState('7');
  const [keyInput, setKeyInput] = useState('5');
  const [valueInput, setValueInput] = useState('42');

  const key = () => parseInt(keyInput, 10) || 0;
  const val = () => parseInt(valueInput, 10) || 0;

  return (
    <div className="glass-panel p-5 w-72 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
      <h2 className="text-lg font-bold text-white tracking-tight">Hash Table</h2>
      <p className="text-xs text-white/70 -mt-2">Key-value store with chaining</p>
      <input className="neon-input" type="number" value={sizeInput} onChange={(e) => setSizeInput(e.target.value)} placeholder="Table Size" />
      <div className="grid grid-cols-2 gap-2">
        <input className="neon-input" type="number" value={keyInput} onChange={(e) => setKeyInput(e.target.value)} placeholder="Key" />
        <input className="neon-input" type="number" value={valueInput} onChange={(e) => setValueInput(e.target.value)} placeholder="Value" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button className="neon-button" onClick={() => onCreateTable(parseInt(sizeInput, 10) || 7)}>Create</button>
        <button className="neon-button" onClick={() => onInsert(key(), val())}>Insert</button>
        <button className="neon-button" onClick={() => onDelete(key())}>Delete</button>
        <button className="neon-button" onClick={() => onSearch(key())}>Search</button>
        <button className="neon-button col-span-2" onClick={onClear}>Clear</button>
      </div>
    </div>
  );
}

