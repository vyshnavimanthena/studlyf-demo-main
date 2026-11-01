import React from 'react';
import { CertData } from '../CertTemplates';
import { useFabricEditor } from './useFabricEditor';
import { Toolbar } from './Toolbar';
import { LeftSidebar } from './LeftSidebar';
import { PropertiesPanel } from './PropertiesPanel';
import { LayersPanel } from './LayersPanel';
import { X } from 'lucide-react';

interface CanvaEditorProps {
  data: CertData;
  onChange: (updates: Partial<CertData>) => void;
  onSave: () => void;
  onClose: () => void;
}

export const CanvaEditor: React.FC<CanvaEditorProps> = ({ data, onChange, onSave, onClose }) => {
  const {
    canvasElementRef,
    canvas,
    activeObjects,
    objectsList,
    addText,
    addSvg,
    setBackgroundImage,
    duplicateSelection,
    undo,
    redo,
    toggleLock,
    toggleVisibility,
    groupSelection,
    ungroupSelection,
    updateActiveProperty,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
  } = useFabricEditor(data.canvaData);

  const handleSaveInternal = () => {
    if (!canvas) return;
    
    // Save the raw Fabric JSON
    const json = canvas.toObject(['id', 'placeholder', 'assetId', 'locked', 'name']);
    
    // Generate perfect SVG HTML for backend rendering
    const svgExport = canvas.toSVG();
    const staticHtml = `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <style>
    body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; }
    svg { width: 100%; height: 100%; max-width: ${CANVAS_WIDTH}px; max-height: ${CANVAS_HEIGHT}px; }
  </style>
</head>
<body>
  ${svgExport}
</body>
</html>`;

    onChange({ canvaData: json as any, customHtml: staticHtml });
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex flex-col backdrop-blur-sm overflow-hidden">
      {/* Top Header */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 relative z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">StudLyf Design Studio</h2>
        </div>
        <button onClick={handleSaveInternal} className="px-5 py-2 bg-[#6C3BFF] text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-[#5B2EE0] shadow-lg shadow-[#6C3BFF]/20 hover:-translate-y-0.5 transition-all">
          Save Template
        </button>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar (Asset Library) */}
        <LeftSidebar 
          addText={addText}
          addSvg={addSvg}
          setBackgroundImage={setBackgroundImage}
        />

        {/* Center Canvas Workspace */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-100 relative">
          <Toolbar 
            undo={undo}
            redo={redo}
            duplicateSelection={duplicateSelection}
            groupSelection={groupSelection}
            ungroupSelection={ungroupSelection}
            activeObjects={activeObjects}
          />
          
          <div className="flex-1 overflow-auto p-10 flex items-center justify-center relative">
            {/* The actual canvas container scaled for the UI */}
            <div className="shadow-2xl bg-white relative transition-transform" 
                 style={{ 
                   width: CANVAS_WIDTH, 
                   height: CANVAS_HEIGHT,
                   transform: 'scale(0.8)', // MVP responsive scaling
                   transformOrigin: 'center center'
                 }}>
              <canvas ref={canvasElementRef} />
            </div>
          </div>
        </div>

        {/* Right Sidebar (Properties & Layers) */}
        <div className="w-72 bg-white border-l border-slate-200 flex flex-col shrink-0">
          {/* Properties Panel (Top Half) */}
          <div className="h-1/2 flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Properties</span>
              {activeObjects.length > 0 && <span className="text-[9px] font-bold bg-[#6C3BFF]/10 text-[#6C3BFF] px-2 py-0.5 rounded">{activeObjects.length} Selected</span>}
            </div>
            <div className="flex-1 overflow-y-auto">
              <PropertiesPanel 
                activeObject={activeObjects.length === 1 ? activeObjects[0] : null}
                updateActiveProperty={updateActiveProperty}
              />
            </div>
          </div>
          
          {/* Layers Panel (Bottom Half) */}
          <div className="h-1/2 flex flex-col">
            <LayersPanel 
              canvas={canvas}
              objectsList={objectsList}
              activeObjects={activeObjects}
              toggleVisibility={toggleVisibility}
              toggleLock={toggleLock}
            />
          </div>
        </div>

      </div>
    </div>
  );
};
