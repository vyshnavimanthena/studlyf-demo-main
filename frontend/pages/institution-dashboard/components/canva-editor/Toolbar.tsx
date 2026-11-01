import React from 'react';
import { Undo, Redo, Copy, Group, Ungroup } from 'lucide-react';
import * as fabric from 'fabric';

interface ToolbarProps {
  undo: () => void;
  redo: () => void;
  duplicateSelection: () => void;
  groupSelection: () => void;
  ungroupSelection: () => void;
  activeObjects: fabric.Object[];
}

export const Toolbar: React.FC<ToolbarProps> = ({ undo, redo, duplicateSelection, groupSelection, ungroupSelection, activeObjects }) => {
  const isMultipleSelected = activeObjects.length > 1 || (activeObjects.length === 1 && activeObjects[0].type === 'activeSelection');
  const isGroupSelected = activeObjects.length === 1 && activeObjects[0].type === 'group';
  
  return (
    <div className="h-12 bg-white border-b border-slate-200 flex items-center px-4 gap-2 shadow-sm relative z-10 shrink-0">
      <div className="flex bg-slate-100 rounded-lg p-1">
        <button onClick={undo} className="p-1.5 hover:bg-white rounded text-slate-600 hover:text-slate-900 shadow-sm" title="Undo (Ctrl+Z)">
          <Undo size={16} />
        </button>
        <button onClick={redo} className="p-1.5 hover:bg-white rounded text-slate-600 hover:text-slate-900 shadow-sm" title="Redo (Ctrl+Y)">
          <Redo size={16} />
        </button>
      </div>

      <div className="w-px h-6 bg-slate-200 mx-2" />

      <button onClick={duplicateSelection} disabled={activeObjects.length === 0}
        className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900 disabled:opacity-30 flex items-center gap-1.5 text-xs font-bold" title="Duplicate (Ctrl+D)">
        <Copy size={16} /> Duplicate
      </button>

      <div className="w-px h-6 bg-slate-200 mx-2" />

      <button onClick={groupSelection} disabled={!isMultipleSelected}
        className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900 disabled:opacity-30 flex items-center gap-1.5 text-xs font-bold" title="Group (Ctrl+G)">
        <Group size={16} /> Group
      </button>

      <button onClick={ungroupSelection} disabled={!isGroupSelected}
        className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900 disabled:opacity-30 flex items-center gap-1.5 text-xs font-bold" title="Ungroup (Ctrl+U)">
        <Ungroup size={16} /> Ungroup
      </button>
    </div>
  );
};
