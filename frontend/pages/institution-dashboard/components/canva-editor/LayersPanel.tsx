import React from 'react';
import * as fabric from 'fabric';
import { Eye, EyeOff, Lock, Unlock, Trash2, ArrowUp, ArrowDown, Type, Image as ImageIcon, Box } from 'lucide-react';

interface LayersPanelProps {
  canvas: fabric.Canvas | null;
  objectsList: fabric.Object[];
  activeObjects: fabric.Object[];
  toggleVisibility: (obj: fabric.Object) => void;
  toggleLock: (obj: fabric.Object) => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({ canvas, objectsList, activeObjects, toggleVisibility, toggleLock }) => {
  if (!canvas) return null;

  const handleSelect = (obj: fabric.Object) => {
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
  };

  const bringForward = (e: React.MouseEvent, obj: fabric.Object) => {
    e.stopPropagation();
    canvas.bringObjectForward(obj);
    canvas.requestRenderAll();
    canvas.fire('object:modified', { target: obj }); // force update list
  };

  const sendBackwards = (e: React.MouseEvent, obj: fabric.Object) => {
    e.stopPropagation();
    canvas.sendObjectBackwards(obj);
    canvas.requestRenderAll();
    canvas.fire('object:modified', { target: obj }); // force update list
  };

  const deleteObj = (e: React.MouseEvent, obj: fabric.Object) => {
    e.stopPropagation();
    canvas.remove(obj);
    canvas.requestRenderAll();
  };

  const getIcon = (obj: fabric.Object) => {
    if (obj.type === 'textbox' || obj.type === 'text' || obj.type === 'i-text') return <Type size={14} className="text-blue-500" />;
    if (obj.type === 'image') return <ImageIcon size={14} className="text-green-500" />;
    return <Box size={14} className="text-purple-500" />;
  };

  const getName = (obj: fabric.Object) => {
    if ((obj as any).name) return (obj as any).name;
    if ((obj as any).placeholder) return `Field: ${(obj as any).placeholder}`;
    if (obj.type === 'textbox' || obj.type === 'i-text') {
      const text = (obj as any).text || '';
      return text.length > 15 ? text.substring(0, 15) + '...' : text || 'Text';
    }
    return obj.type || 'Object';
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 border-t border-slate-200">
      <div className="sticky top-0 bg-slate-50 p-3 border-b border-slate-200 flex items-center justify-between z-10">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Layers</span>
        <span className="text-[10px] font-bold text-slate-400">{objectsList.length} Objects</span>
      </div>
      
      {objectsList.length === 0 ? (
        <div className="p-4 text-center text-slate-400 text-xs font-bold mt-4">Canvas is empty</div>
      ) : (
        <div className="flex flex-col">
          {objectsList.map((obj, i) => {
            const isActive = activeObjects.includes(obj);
            return (
              <div 
                key={i} 
                onClick={() => handleSelect(obj)}
                className={`flex items-center gap-2 p-2 px-3 border-b border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors ${isActive ? 'bg-[#6C3BFF]/10 border-l-4 border-l-[#6C3BFF]' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="flex-1 flex items-center gap-2 overflow-hidden">
                  {getIcon(obj)}
                  <span className="text-xs font-bold text-slate-700 truncate">{getName(obj)}</span>
                </div>
                
                <div className="flex items-center gap-1 opacity-40 hover:opacity-100">
                  <button onClick={(e) => { e.stopPropagation(); toggleVisibility(obj); }} className="p-1 hover:text-[#6C3BFF]" title="Toggle Visibility">
                    {obj.visible === false ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); toggleLock(obj); }} className="p-1 hover:text-[#6C3BFF]" title="Toggle Lock">
                    {(obj as any).locked ? <Lock size={14} /> : <Unlock size={14} />}
                  </button>
                  <button onClick={(e) => deleteObj(e, obj)} className="p-1 hover:text-red-500" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
