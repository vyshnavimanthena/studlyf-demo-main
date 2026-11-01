import React from 'react';
import { Download, ExternalLink } from 'lucide-react';
import {
    canUseCloudDocumentViewer,
    getFileKind,
    getFileTypeBadge,
    getFileTypeLabel,
} from '../utils/submissionFilePreview';

interface FilePreviewPanelProps {
    url: string;
    filename: string;
    mime?: string;
}

const FilePreviewPanel: React.FC<FilePreviewPanelProps> = ({ url, filename, mime }) => {
    const kind = getFileKind(filename, mime);
    const typeLabel = getFileTypeLabel(filename, mime);
    const badge = getFileTypeBadge(filename, mime);
    const useCloudViewer = kind === 'office' && canUseCloudDocumentViewer(url);

    if (kind === 'pdf') {
        return <iframe src={url} className="w-full h-full border-none" title="PDF Preview" />;
    }

    if (kind === 'image') {
        return <img src={url} className="w-full h-full object-contain" alt={filename} />;
    }

    if (kind === 'video') {
        return <video src={url} controls className="w-full h-full" />;
    }

    if (kind === 'office') {
        return (
            <div className="w-full h-full flex flex-col bg-slate-50 relative">
                {useCloudViewer ? (
                    <iframe
                        src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
                        className="flex-1 w-full border-none bg-white"
                        title="Office Preview"
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center p-12 text-center">
                        <div className="max-w-lg space-y-6">
                            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-2xl font-black mx-auto shadow-inner ${badge === 'PPT' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                                {badge}
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-xl font-black text-slate-900">{typeLabel}</h4>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                    {filename}
                                </p>
                                <p className="text-xs text-slate-400">
                                    In-browser slide preview needs a public file URL. On localhost, open or download the file directly — no Google Drive sign-in required.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-4 bg-[#6C3BFF] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-purple-500/20"
                                >
                                    Open {badge} File
                                </a>
                                <a
                                    href={url}
                                    download={filename}
                                    className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest"
                                >
                                    Download {badge}
                                </a>
                            </div>
                        </div>
                    </div>
                )}
                <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between px-8">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${badge === 'PPT' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                            {badge}
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{typeLabel}</span>
                    </div>
                    {useCloudViewer && (
                        <a
                            href={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
                        >
                            MS Office Viewer
                        </a>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
            <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center text-5xl">📎</div>
            <div className="text-center space-y-2">
                <p className="text-xl font-black text-slate-900">{filename}</p>
                <p className="text-sm text-slate-500 font-medium">Preview not available for this file type</p>
            </div>
            <div className="flex gap-3">
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-purple-700 transition-all shadow-lg"
                >
                    <ExternalLink size={18} /> Open File
                </a>
                <a
                    href={url}
                    download={filename}
                    className="flex items-center gap-2 px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                    <Download size={18} /> Download
                </a>
            </div>
        </div>
    );
};

export default FilePreviewPanel;
