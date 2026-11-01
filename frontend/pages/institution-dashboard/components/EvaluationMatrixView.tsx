import React, { useState, useEffect } from 'react';
import { API_BASE_URL, authHeaders } from '../../../apiConfig';
import { 
    Download, 
    Filter, 
    Search, 
    TrendingUp, 
    Users, 
    Star, 
    ChevronRight,
    Loader2,
    FileSpreadsheet,
    AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface EvaluationMatrixViewProps {
    eventId: string;
    criteria: any[];
    refreshCounter?: number;
}

const EvaluationMatrixView: React.FC<EvaluationMatrixViewProps> = ({ eventId, criteria, refreshCounter }) => {
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [scores, setScores] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [subRes, scoreRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/judging/submissions/${eventId}`, { headers: authHeaders() }),
                    fetch(`${API_BASE_URL}/api/judging/scores/${eventId}`, { headers: authHeaders() })
                ]);

                if (subRes.ok) setSubmissions(await subRes.json());
                if (scoreRes.ok) setScores(await scoreRes.json());
            } catch (error) {
                try { console.error("Failed to fetch matrix data", error instanceof Error ? error.message : String(error)); } catch (_) {}
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [eventId, refreshCounter]);

    const getScoreForDimension = (submissionId: string, dimensionIdx: number) => {
        // Score logic: Find score for this submission and dimension
        // In our current backend, scores are stored in submission_scores_col
        // Each doc has submission_id, scores (array of objects with dimension and score)
        const subScores = scores.find(s => s.submission_id === submissionId);
        if (!subScores || !subScores.scores) return '-';
        
        const dimScore = subScores.scores.find((ds: any) => ds.dimension === dimensionIdx || ds.name === criteria[dimensionIdx]?.name);
        return dimScore ? dimScore.score : '-';
    };

    const getTotalScore = (submissionId: string) => {
        const subScores = scores.find(s => s.submission_id === submissionId);
        return subScores?.total_score || 0;
    };

    const handleExportCSV = () => {
        setExporting(true);
        try {
            const headers = ['Team/Participant', ...criteria.map(c => c.name), 'Total Score', 'Feedback'];
            const rows = filteredSubmissions.map(sub => {
                const row = [
                    sub.team_name || sub.user_name || 'Anonymous',
                    ...criteria.map((_, idx) => getScoreForDimension(sub._id, idx)),
                    getTotalScore(sub._id),
                    scores.find(s => s.submission_id === sub._id)?.feedback || ''
                ];
                return row.join(',');
            });

            const csvContent = [headers.join(','), ...rows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `Evaluation_Matrix_${eventId}.csv`);
            link.click();
        } catch (error) {
            try { console.error("Export failed", error instanceof Error ? error.message : String(error)); } catch (_) {}
        } finally {
            setExporting(false);
        }
    };

    const filteredSubmissions = submissions.filter(sub => 
        (sub.team_name || sub.user_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <Loader2 className="animate-spin text-[#6C3BFF]" size={48} />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Compiling Evaluation Matrix...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-8">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6C3BFF] transition-colors" size={20} />
                    <input 
                        type="text"
                        placeholder="Search teams or participants..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-[#6C3BFF]/5 focus:border-[#6C3BFF] transition-all shadow-sm"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleExportCSV}
                        disabled={exporting}
                        className="px-4 sm:px-8 py-3 sm:py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#6C3BFF] transition-all shadow-xl shadow-slate-900/10 flex items-center gap-2"
                    >
                        {exporting ? <Loader2 className="animate-spin" size={14} /> : <FileSpreadsheet size={16} />}
                        Export Analytics (CSV)
                    </button>
                </div>
            </div>

            {/* Matrix Table */}
            <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/20">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 min-w-[300px]">Project Entity</th>
                                {criteria.map((c, idx) => (
                                    <th key={idx} className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center min-w-[150px]">
                                        <div className="flex flex-col items-center gap-1">
                                            <span>{c.name}</span>
                                            <span className="text-[8px] opacity-60">Max: {c.max_points}</span>
                                        </div>
                                    </th>
                                ))}
                                <th className="px-10 py-8 text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 text-right min-w-[150px]">Total Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredSubmissions.length > 0 ? filteredSubmissions.map((sub, idx) => {
                                const totalScore = getTotalScore(sub._id);
                                return (
                                    <motion.tr 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={sub._id} 
                                        className="hover:bg-slate-50/30 transition-colors group"
                                    >
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-purple-50 text-[#6C3BFF] rounded-2xl flex items-center justify-center font-black text-sm shadow-inner group-hover:bg-[#6C3BFF] group-hover:text-white transition-all">
                                                    {sub.team_name?.charAt(0) || sub.user_name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-900 text-lg tracking-tight">{sub.team_name || sub.user_name || 'Anonymous'}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Project ID: {sub._id.slice(-6)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        {criteria.map((_, cIdx) => {
                                            const score = getScoreForDimension(sub._id, cIdx);
                                            return (
                                                <td key={cIdx} className="px-6 py-8 text-center">
                                                    <span className={`px-4 py-2 rounded-xl text-sm font-black ${score === '-' ? 'text-slate-300 bg-slate-100' : 'text-[#6C3BFF] bg-purple-50'}`}>
                                                        {score}
                                                    </span>
                                                </td>
                                            );
                                        })}
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex flex-col items-end">
                                                <div className="text-2xl font-black text-slate-900 tracking-tighter">{totalScore}</div>
                                                <div className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">
                                                    <Star size={10} fill="currentColor" /> Verified
                                                </div>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={criteria.length + 2} className="px-10 py-24 text-center">
                                        <div className="flex flex-col items-center opacity-20">
                                            <Filter size={64} className="mb-6" />
                                            <p className="font-black text-[11px] uppercase tracking-[0.3em]">No project evaluations found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                <div className="p-4 sm:p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl shadow-slate-900/20">
                    <TrendingUp className="text-[#6C3BFF] mb-4" size={32} />
                    <div className="text-xl sm:text-3xl font-black tracking-tighter">
                        {submissions.length > 0 ? (scores.length / submissions.length * 100).toFixed(0) : 0}%
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Evaluation Progress</div>
                </div>
                <div className="p-4 sm:p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
                    <Users className="text-[#6C3BFF] mb-4" size={32} />
                    <div className="text-xl sm:text-3xl font-black text-slate-900 tracking-tighter">
                        {submissions.length}
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Total Submissions</div>
                </div>
            </div>
        </div>
    );
};

export default EvaluationMatrixView;

