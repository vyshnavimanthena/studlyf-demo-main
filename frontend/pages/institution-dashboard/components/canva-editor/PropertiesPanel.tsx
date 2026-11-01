import React from 'react';
import * as fabric from 'fabric';
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline } from 'lucide-react';

interface PropertiesPanelProps {
  activeObject: fabric.Object | null;
  updateActiveProperty: (key: string, value: any) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ activeObject, updateActiveProperty }) => {
  if (!activeObject) return (
    <div className="p-4 text-center text-slate-400 text-xs font-bold mt-10">Select an object to edit properties</div>
  );

  const isText = activeObject.type === 'textbox' || activeObject.type === 'i-text' || activeObject.type === 'text';

  return (
    <div className="p-4 space-y-5">
      <div className="pb-4 border-b border-slate-100">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Transform</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[9px] font-bold text-slate-500 uppercase">Opacity (0-1)</label>
            <input type="number" step="0.1" min="0" max="1" value={activeObject.opacity ?? 1} 
              onChange={e => updateActiveProperty('opacity', parseFloat(e.target.value))} 
              className="w-full p-2 mt-1 border border-slate-200 rounded-lg text-xs" />
          </div>
          <div>
            <label className="text-[9px] font-bold text-slate-500 uppercase">Rotation (°)</label>
            <input type="number" value={Math.round(activeObject.angle || 0)} 
              onChange={e => updateActiveProperty('angle', parseInt(e.target.value))} 
              className="w-full p-2 mt-1 border border-slate-200 rounded-lg text-xs" />
          </div>
        </div>
      </div>

      {isText && (
        <div className="space-y-4 pb-4 border-b border-slate-100">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Typography</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase">Font Size</label>
              <input type="number" value={(activeObject as any).fontSize || 32} 
                onChange={e => updateActiveProperty('fontSize', parseInt(e.target.value))} 
                className="w-full p-2 mt-1 border border-slate-200 rounded-lg text-xs" />
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase">Color</label>
              <input type="color" value={(activeObject as any).fill || '#000000'} 
                onChange={e => updateActiveProperty('fill', e.target.value)} 
                className="w-full h-8 mt-1 border border-slate-200 rounded-lg p-0 cursor-pointer" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase">Line Height</label>
              <input type="number" step="0.1" value={(activeObject as any).lineHeight || 1.16} 
                onChange={e => updateActiveProperty('lineHeight', parseFloat(e.target.value))} 
                className="w-full p-2 mt-1 border border-slate-200 rounded-lg text-xs" />
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase">Letter Space</label>
              <input type="number" step="10" value={(activeObject as any).charSpacing || 0} 
                onChange={e => updateActiveProperty('charSpacing', parseInt(e.target.value))} 
                className="w-full p-2 mt-1 border border-slate-200 rounded-lg text-xs" />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Style & Alignment</label>
            <div className="flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
              <button onClick={() => updateActiveProperty('fontWeight', (activeObject as any).fontWeight === 'bold' ? 'normal' : 'bold')}
                className={`flex-1 p-1.5 rounded flex justify-center ${(activeObject as any).fontWeight === 'bold' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}><Bold size={14} /></button>
              <button onClick={() => updateActiveProperty('fontStyle', (activeObject as any).fontStyle === 'italic' ? 'normal' : 'italic')}
                className={`flex-1 p-1.5 rounded flex justify-center ${(activeObject as any).fontStyle === 'italic' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}><Italic size={14} /></button>
              <button onClick={() => updateActiveProperty('underline', !(activeObject as any).underline)}
                className={`flex-1 p-1.5 rounded flex justify-center ${(activeObject as any).underline ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}><Underline size={14} /></button>
              
              <div className="w-px bg-slate-200 mx-1" />
              
              <button onClick={() => updateActiveProperty('textAlign', 'left')}
                className={`flex-1 p-1.5 rounded flex justify-center ${(activeObject as any).textAlign === 'left' ? 'bg-white shadow-sm text-[#6C3BFF]' : 'text-slate-500'}`}><AlignLeft size={14} /></button>
              <button onClick={() => updateActiveProperty('textAlign', 'center')}
                className={`flex-1 p-1.5 rounded flex justify-center ${(activeObject as any).textAlign === 'center' ? 'bg-white shadow-sm text-[#6C3BFF]' : 'text-slate-500'}`}><AlignCenter size={14} /></button>
              <button onClick={() => updateActiveProperty('textAlign', 'right')}
                className={`flex-1 p-1.5 rounded flex justify-center ${(activeObject as any).textAlign === 'right' ? 'bg-white shadow-sm text-[#6C3BFF]' : 'text-slate-500'}`}><AlignRight size={14} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
