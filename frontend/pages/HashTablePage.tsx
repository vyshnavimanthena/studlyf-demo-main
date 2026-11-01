import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Scene from '@/components/HashTableVisualizer/Scene';
import ControlPanel from '@/components/HashTableVisualizer/ControlPanel';
import OperationLog from '@/components/ArrayVisualizer/OperationLog';
import { useHashTableOperations } from '@/components/HashTableVisualizer/useHashTableOperations';

const HashTablePage: React.FC = () => {
  const navigate = useNavigate();
  const { buckets, logs, createTable, insert, deleteKey, search, clear } = useHashTableOperations();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#090B1A]">
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white/70 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Go Back
      </button>
      <Suspense fallback={<div className="flex items-center justify-center h-full text-white/70">Loading 3D scene...</div>}>
        <Scene buckets={buckets} />
      </Suspense>
      <div className="absolute top-20 left-6 z-10"><ControlPanel onCreateTable={createTable} onInsert={insert} onDelete={deleteKey} onSearch={search} onClear={clear} /></div>
      <div className="absolute top-20 right-6 z-10"><OperationLog logs={logs} /></div>
    </div>
  );
};

export default HashTablePage;

