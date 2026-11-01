
import React, { useState, useEffect } from 'react';
import { 
    Users, 
    Plus, 
    Trash2, 
    Star, 
    Mail, 
    Shield,
    CheckCircle2,
    Search
} from 'lucide-react';

interface Judge {
    id: string;
    name: string;
    email: string;
    expertise: string[];
    assigned: boolean;
    institutionId: string;
    institutionName: string;
    department?: string;
    position?: string;
}

interface JudgeAssignmentProps {
    assignedJudgeIds: string[];
    onUpdate: (judgeIds: string[]) => void;
    currentInstitutionId?: string;
    showInstitutionFilter?: boolean;
    availableJudges?: Judge[];
}

const JudgeAssignment: React.FC<JudgeAssignmentProps> = ({ 
    assignedJudgeIds, 
    onUpdate, 
    currentInstitutionId,
    showInstitutionFilter = true,
    availableJudges = []
}) => {
    const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Get unique institutions for filter safely
    const institutions = Array.from(new Set(availableJudges.map(j => j.institutionName || 'Unknown')));
    
    const filteredJudges = availableJudges.filter(judge => {
        const matchesSearch = judge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            judge.email.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesInstitution = selectedInstitution === 'all' || 
                                  judge.institutionId === selectedInstitution ||
                                  judge.institutionName === selectedInstitution;
        
        // If currentInstitutionId is provided, only show judges from that institution
        const matchesCurrentInstitution = !currentInstitutionId || 
                                         judge.institutionId === currentInstitutionId;
        
        return matchesSearch && matchesInstitution && matchesCurrentInstitution;
    });

    const toggleJudge = (id: string) => {
        if (assignedJudgeIds.includes(id)) {
            onUpdate(assignedJudgeIds.filter(jid => jid !== id));
        } else {
            onUpdate([...assignedJudgeIds, id]);
        }
    };

    return (
        <div className="space-y-6">
            {/* Institution Filter */}
            {showInstitutionFilter && !currentInstitutionId && (
                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Filter by Institution</label>
                    <select 
                        value={selectedInstitution}
                        onChange={(e) => setSelectedInstitution(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium"
                    >
                        <option value="all">All Institutions</option>
                        {institutions.map(inst => (
                            <option key={inst} value={inst}>{inst}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Search */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={16} />
                <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-purple-50 focus:border-purple-600 outline-none transition-all placeholder:text-slate-400 text-sm font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredJudges.map((judge) => {
                    const isAssigned = assignedJudgeIds.includes(judge.id);
                    return (
                        <div 
                            key={judge.id}
                            onClick={() => toggleJudge(judge.id)}
                            className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                                isAssigned 
                                    ? 'bg-purple-50 border-purple-200 shadow-sm' 
                                    : 'bg-white border-slate-100 hover:border-purple-100'
                            }`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                                isAssigned ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-400'
                            }`}>
                                {judge.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h5 className="font-bold text-slate-900 text-sm">{judge.name}</h5>
                                    {isAssigned && <CheckCircle2 size={14} className="text-purple-600" />}
                                </div>
                                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                    <Mail size={10} /> {judge.email}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md text-[8px] font-bold">
                                        {judge.institutionName}
                                    </span>
                                    {judge.department && (
                                        <span className="text-[8px] text-slate-500">
                                            {judge.department}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {(judge.expertise || []).map(exp => (
                                        <span key={exp} className="px-2 py-0.5 bg-white border border-slate-100 rounded-md text-[8px] font-bold text-slate-500 uppercase">
                                            {exp}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                isAssigned ? 'bg-purple-600 border-purple-600' : 'border-slate-200'
                            }`}>
                                {isAssigned && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Shield size={16} className="text-purple-600" />
                        <h5 className="text-xs font-black text-slate-900 uppercase">Assignment Summary</h5>
                    </div>
                    <span className="text-xs font-bold text-purple-600 bg-white px-3 py-1 rounded-full shadow-sm border border-purple-100">
                        {assignedJudgeIds.length} Judges Assigned
                    </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                    Assigned judges will receive an automated invitation to evaluate submissions in this stage. 
                    They will have access to the scoring rubric once the review period starts.
                </p>
            </div>
        </div>
    );
};

export default JudgeAssignment;

