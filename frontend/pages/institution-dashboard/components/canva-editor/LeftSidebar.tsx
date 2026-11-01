import React, { useState } from 'react';
import { Type, Square, Image as ImageIcon, LayoutTemplate, Shapes, ShieldAlert, Upload } from 'lucide-react';
import { AssetLibrary } from './AssetLibrary';

interface LeftSidebarProps {
  addText: (text: string, options?: any, placeholder?: string) => void;
  addSvg: (svgString: string, assetId: string, name?: string) => void;
  setBackgroundImage: (url: string | null) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ addText, addSvg, setBackgroundImage }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'borders' | 'seals' | 'shapes' | 'bg'>('text');

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setBackgroundImage(evt.target?.result as string);
    };
    reader.readAsDataURL(f);
  };

  const tabs = [
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'borders', icon: Square, label: 'Borders' },
    { id: 'seals', icon: ShieldAlert, label: 'Seals' },
    { id: 'shapes', icon: Shapes, label: 'Shapes' },
    { id: 'bg', icon: ImageIcon, label: 'Bg' }
  ];

  return (
    <div className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0">
      <div className="flex border-b border-slate-100 flex-wrap">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-[50px] py-3 flex flex-col items-center gap-1.5 border-b-2 ${activeTab === tab.id ? 'border-[#6C3BFF] text-[#6C3BFF]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
            <tab.icon size={16} />
            <span className="text-[9px] font-bold uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Dynamic Fields</p>
              <div className="space-y-2">
                <button onClick={() => addText('{{student_name}}', { fontSize: 48, fontWeight: 800 }, 'student_name')} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-[#6C3BFF] text-left">+ Student Name</button>
                <button onClick={() => addText('{{course_title}}', { fontSize: 32, fontWeight: 700, fill: '#3B82F6' }, 'course_title')} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-[#6C3BFF] text-left">+ Event Name</button>
                <button onClick={() => addText('{{date}}', { fontSize: 24 }, 'date')} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-[#6C3BFF] text-left">+ Date</button>
                <button onClick={() => addText('{{institution}}', { fontSize: 24, fontWeight: 700 }, 'institution')} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-[#6C3BFF] text-left">+ Institution</button>
                <button onClick={() => addText('{{custom_field}}', { fontSize: 24 }, 'custom_field')} className="w-full p-3 bg-[#6C3BFF]/10 border border-[#6C3BFF]/20 rounded-xl text-xs font-bold text-[#6C3BFF] hover:bg-[#6C3BFF]/20 text-left border-dashed">+ Custom Placeholder</button>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-200">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Standard Text</p>
              <div className="space-y-2">
                <button onClick={() => addText('CERTIFICATE OF ACHIEVEMENT', { fontSize: 56, fontWeight: 900 })} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-[#6C3BFF] text-left">+ Heading</button>
                <button onClick={() => addText('Proudly presented to', { fontSize: 24 })} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-[#6C3BFF] text-left">+ Subtitle</button>
                <button onClick={() => addText('Add signature line here', { fontSize: 16, borderBottom: true })} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-[#6C3BFF] text-left">+ Signature Block</button>
              </div>
            </div>
          </div>
        )}

        {['borders', 'seals', 'shapes'].includes(activeTab) && (
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Asset Library</p>
            <div className="grid grid-cols-2 gap-2">
              {(AssetLibrary[activeTab as keyof typeof AssetLibrary] || []).map(asset => (
                <button key={asset.id} onClick={() => addSvg(asset.svg, asset.id, asset.label)}
                  className="w-full aspect-square bg-white border border-slate-200 rounded-xl hover:border-[#6C3BFF] overflow-hidden flex flex-col items-center justify-center p-2 relative group">
                  <div className="w-full h-full pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity flex items-center justify-center" dangerouslySetInnerHTML={{ __html: asset.svg }} />
                  <span className="absolute bottom-1 bg-white/90 px-1.5 py-0.5 rounded text-[8px] font-bold">{asset.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bg' && (
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Upload Image</p>
            <button type="button" onClick={() => document.getElementById('canva-bg-upload')?.click()} className="w-full p-4 border-2 border-dashed border-[#6C3BFF]/30 bg-[#6C3BFF]/5 rounded-xl text-xs font-bold text-[#6C3BFF] hover:bg-[#6C3BFF]/10 flex flex-col items-center gap-2">
              <Upload size={20} /> Upload Background
            </button>
            <input id="canva-bg-upload" type="file" accept="image/*" className="hidden" onChange={handleBgUpload} />
            <button type="button" onClick={() => setBackgroundImage(null)} className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50">
              Remove Background
            </button>
            
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mt-6">Design Library</p>
            <div className="grid grid-cols-2 gap-2">
              {(AssetLibrary.backgrounds || []).map(bg => (
                <button key={bg.id} onClick={() => setBackgroundImage('data:image/svg+xml;base64,' + btoa(bg.svg))}
                  className="w-full aspect-[4/3] bg-white border border-slate-200 rounded-xl hover:border-[#6C3BFF] overflow-hidden flex flex-col items-center justify-center p-1 relative group">
                  <div className="w-full h-full pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg overflow-hidden border border-slate-100" dangerouslySetInnerHTML={{ __html: bg.svg }} />
                  <span className="absolute bottom-1 bg-white/90 px-1.5 py-0.5 rounded text-[8px] font-bold">{bg.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
