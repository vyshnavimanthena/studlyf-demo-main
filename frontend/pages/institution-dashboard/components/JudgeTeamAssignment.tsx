import React, { useState, useEffect } from 'react';
import { 
    Users, 
    Plus, 
    Trash2, 
    Star, 
    Mail, 
    Shield,
    CheckCircle2,
    Search,
    Shuffle,
    Eye,
    Settings,
    AlertCircle
} from 'lucide-react';

interface Judge {
    id: string;
    name: string;
    email: string;
    expertise: string[];
    assigned: boolean;
    currentLoad: number;
    assignmentCount?: number;
    institutionId: string;
    institutionName: string;
    department?: string;
    position?: string;
}

interface Team {
    id: string;
    name: string;
    members: string[];
    projectTitle: string;
    submittedAt: string;
    status: 'pending' | 'assigned' | 'in_review' | 'completed';
    assignedJudges: string[];
}

interface AssignmentStrategy {
    type: 'round_robin' | 'expert_based' | 'random' | 'balanced';
    judgesPerTeam: number;
    considerExpertise: boolean;
    balanceLoad: boolean;
}

interface JudgeTeamAssignmentProps {
    eventId: string;
    teams: Team[];
    judges: Judge[];
    onAssignmentUpdate: (assignments: { teamId: string; judgeIds: string[] }[]) => void;
}

const JudgeTeamAssignment: React.FC<JudgeTeamAssignmentProps> = ({
    eventId,
    teams,
    judges,
    onAssignmentUpdate
}) => {
    const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
    const [selectedJudges, setSelectedJudges] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [assignmentStrategy, setAssignmentStrategy] = useState<AssignmentStrategy>({
        type: 'balanced',
        judgesPerTeam: 3,
        considerExpertise: true,
        balanceLoad: true
    });
    const [assignments, setAssignments] = useState<{ teamId: string; judgeIds: string[] }[]>([]);
    const [isAutoAssigning, setIsAutoAssigning] = useState(false);

    // Get unique institutions for filtering
    const institutions = Array.from(new Set(judges.map(j => j.institutionName)));
    const [selectedInstitution, setSelectedInstitution] = useState<string>('all');

    const filteredJudges = judges.filter(judge => 
        (judge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        judge.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (selectedInstitution === 'all' || judge.institutionName === selectedInstitution)
    );

    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.projectTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleTeam = (teamId: string) => {
        setSelectedTeams(prev => 
            prev.includes(teamId) 
                ? prev.filter(id => id !== teamId)
                : [...prev, teamId]
        );
    };

    const toggleJudge = (judgeId: string) => {
        setSelectedJudges(prev => 
            prev.includes(judgeId) 
                ? prev.filter(id => id !== judgeId)
                : [...prev, judgeId]
        );
    };

    const assignSelectedJudgesToTeams = () => {
        if (selectedTeams.length === 0 || selectedJudges.length === 0) {
            alert('Please select teams and judges to assign');
            return;
        }

        const newAssignments = selectedTeams.map(teamId => {
            const currentAssignment = assignments.find(a => a.teamId === teamId);
            const existingJudges = currentAssignment?.judgeIds || [];
            const newJudges = selectedJudges.filter(jid => !existingJudges.includes(jid));
            
            return {
                teamId,
                judgeIds: [...existingJudges, ...newJudges]
            };
        });

        const updatedAssignments = [
            ...assignments.filter(a => !selectedTeams.includes(a.teamId)),
            ...newAssignments
        ];

        setAssignments(updatedAssignments);
        onAssignmentUpdate(updatedAssignments);
        setSelectedTeams([]);
        setSelectedJudges([]);
    };

    const removeJudgeFromTeam = (teamId: string, judgeId: string) => {
        const updatedAssignments = assignments.map(assignment => {
            if (assignment.teamId === teamId) {
                return {
                    ...assignment,
                    judgeIds: assignment.judgeIds.filter(jid => jid !== judgeId)
                };
            }
            return assignment;
        }).filter(a => a.judgeIds.length > 0);

        setAssignments(updatedAssignments);
        onAssignmentUpdate(updatedAssignments);
    };

    const autoAssignJudges = async () => {
        setIsAutoAssigning(true);
        
        try {
            const newAssignments: { teamId: string; judgeIds: string[] }[] = [];
            
            // Sort judges by current load for balanced assignment
            const sortedJudges = [...judges].sort((a, b) => a.currentLoad - b.currentLoad);
            
            filteredTeams.forEach((team, teamIndex) => {
                let selectedJudgeIds: string[] = [];
                
                if (assignmentStrategy.type === 'round_robin') {
                    // Round-robin assignment
                    const startIndex = teamIndex % sortedJudges.length;
                    for (let i = 0; i < assignmentStrategy.judgesPerTeam; i++) {
                        const judgeIndex = (startIndex + i) % sortedJudges.length;
                        if (sortedJudges[judgeIndex]) {
                            selectedJudgeIds.push(sortedJudges[judgeIndex].id);
                        }
                    }
                } else if (assignmentStrategy.type === 'expert_based') {
                    const relevantJudges = sortedJudges.filter(judge => 
                        judge.expertise.some(exp => 
                            team.projectTitle.toLowerCase().includes(exp.toLowerCase())
                        )
                    );
                    
                    for (let i = 0; i < Math.min(assignmentStrategy.judgesPerTeam, relevantJudges.length); i++) {
                        selectedJudgeIds.push(relevantJudges[i].id);
                    }
                    
                    // Fill remaining slots with any available judges
                    if (selectedJudgeIds.length < assignmentStrategy.judgesPerTeam) {
                        const remainingJudges = sortedJudges.filter(j => !selectedJudgeIds.includes(j.id));
                        const needed = assignmentStrategy.judgesPerTeam - selectedJudgeIds.length;
                        for (let i = 0; i < Math.min(needed, remainingJudges.length); i++) {
                            selectedJudgeIds.push(remainingJudges[i].id);
                        }
                    }
                } else if (assignmentStrategy.type === 'balanced') {
                    // Balanced assignment considering current load
                    const availableJudges = [...sortedJudges];
                    for (let i = 0; i < assignmentStrategy.judgesPerTeam; i++) {
                        if (availableJudges.length > 0) {
                            selectedJudgeIds.push(availableJudges[i].id);
                        }
                    }
                } else {
                    // Random assignment
                    const shuffled = [...sortedJudges].sort(() => Math.random() - 0.5);
                    for (let i = 0; i < Math.min(assignmentStrategy.judgesPerTeam, shuffled.length); i++) {
                        selectedJudgeIds.push(shuffled[i].id);
                    }
                }
                
                if (selectedJudgeIds.length > 0) {
                    newAssignments.push({
                        teamId: team.id,
                        judgeIds: selectedJudgeIds
                    });
                }
            });
            
            setAssignments(newAssignments);
            onAssignmentUpdate(newAssignments);
        } catch (error) {
            try { console.error('Auto-assignment failed:', error instanceof Error ? error.message : String(error)); } catch (_) {}
            alert('Auto-assignment failed. Please try manual assignment.');
        } finally {
            setIsAutoAssigning(false);
        }
    };

    const clearAllAssignments = () => {
        if (confirm('Are you sure you want to clear all judge assignments?')) {
            setAssignments([]);
            onAssignmentUpdate([]);
        }
    };

    const getJudgeById = (judgeId: string) => judges.find(j => j.id === judgeId);
    const getTeamAssignment = (teamId: string) => assignments.find(a => a.teamId === teamId);

    return (
        <div className="space-y-8">
            {/* Assignment Strategy */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Settings className="text-purple-600" size={20} />
                    <h3 className="text-lg font-black text-slate-900">Assignment Strategy</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Strategy</label>
                        <select 
                            value={assignmentStrategy.type}
                            onChange={(e) => setAssignmentStrategy(prev => ({ ...prev, type: e.target.value as any }))}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium"
                        >
                            <option value="balanced">Balanced</option>
                            <option value="round_robin">Round Robin</option>
                            <option value="expert_based">Expert-Based</option>
                            <option value="random">Random</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Judges per Team</label>
                        <input 
                            type="number"
                            min="1"
                            max="5"
                            value={assignmentStrategy.judgesPerTeam}
                            onChange={(e) => setAssignmentStrategy(prev => ({ ...prev, judgesPerTeam: parseInt(e.target.value) || 1 }))}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium"
                        />
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <input 
                            type="checkbox"
                            id="considerExpertise"
                            checked={assignmentStrategy.considerExpertise}
                            onChange={(e) => setAssignmentStrategy(prev => ({ ...prev, considerExpertise: e.target.checked }))}
                            className="w-4 h-4 text-purple-600 rounded"
                        />
                        <label htmlFor="considerExpertise" className="text-sm font-medium text-slate-700">Consider Expertise</label>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <input 
                            type="checkbox"
                            id="balanceLoad"
                            checked={assignmentStrategy.balanceLoad}
                            onChange={(e) => setAssignmentStrategy(prev => ({ ...prev, balanceLoad: e.target.checked }))}
                            className="w-4 h-4 text-purple-600 rounded"
                        />
                        <label htmlFor="balanceLoad" className="text-sm font-medium text-slate-700">Balance Load</label>
                    </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={autoAssignJudges}
                        disabled={isAutoAssigning || filteredTeams.length === 0 || judges.length === 0}
                        className="px-6 py-3 bg-purple-600 text-white rounded-xl text-sm font-black uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
                    >
                        <Shuffle size={16} />
                        {isAutoAssigning ? 'Assigning...' : 'Auto Assign'}
                    </button>
                    
                    <button
                        onClick={clearAllAssignments}
                        disabled={assignments.length === 0}
                        className="px-6 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-black uppercase tracking-widest disabled:opacity-50"
                    >
                        Clear All
                    </button>
                </div>
            </div>

            {/* Institution Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                
                {/* Search */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search teams or judges..." 
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-purple-50 focus:border-purple-600 outline-none transition-all placeholder:text-slate-400 text-sm font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Teams and Judges Selection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Teams */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="text-purple-600" size={20} />
                        <h3 className="text-lg font-black text-slate-900">Teams</h3>
                        <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                            {selectedTeams.length} selected
                        </span>
                    </div>
                    
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {filteredTeams.map((team) => {
                            const assignment = getTeamAssignment(team.id);
                            const isSelected = selectedTeams.includes(team.id);
                            
                            return (
                                <div 
                                    key={team.id}
                                    onClick={() => toggleTeam(team.id)}
                                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                                        isSelected 
                                            ? 'bg-purple-50 border-purple-200 shadow-sm' 
                                            : 'bg-white border-slate-100 hover:border-purple-100'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                                isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-400'
                                            }`}>
                                                {team.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-slate-900 text-sm">{team.name}</h5>
                                                <p className="text-xs text-slate-500">{team.projectTitle}</p>
                                            </div>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                            isSelected ? 'bg-purple-600 border-purple-600' : 'border-slate-200'
                                        }`}>
                                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                    </div>
                                    
                                    {assignment && (
                                        <div className="mt-3 pt-3 border-t border-slate-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Users size={12} className="text-purple-600" />
                                                <span className="text-xs font-bold text-purple-600">Assigned Judges</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {assignment.judgeIds.map(judgeId => {
                                                    const judge = getJudgeById(judgeId);
                                                    return judge ? (
                                                        <span key={judgeId} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium flex items-center gap-1">
                                                            {judge.name.split(' ')[0]}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    removeJudgeFromTeam(team.id, judgeId);
                                                                }}
                                                                className="hover:text-purple-900"
                                                            >
                                                                <Trash2 size={10} />
                                                            </button>
                                                        </span>
                                                    ) : null;
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Judges */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="text-purple-600" size={20} />
                        <h3 className="text-lg font-black text-slate-900">Judges</h3>
                        <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                            {selectedJudges.length} selected
                        </span>
                    </div>
                    
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {filteredJudges.map((judge) => {
                            const isSelected = selectedJudges.includes(judge.id);
                            const currentAssignments = assignments.filter(a => a.judgeIds.includes(judge.id)).length;
                            
                            return (
                                <div 
                                    key={judge.id}
                                    onClick={() => toggleJudge(judge.id)}
                                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${
                                        isSelected 
                                            ? 'bg-purple-50 border-purple-200 shadow-sm' 
                                            : 'bg-white border-slate-100 hover:border-purple-100'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                                        isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-400'
                                    }`}>
                                        {judge.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h5 className="font-bold text-slate-900 text-sm">{judge.name}</h5>
                                            {isSelected && <CheckCircle2 size={14} className="text-purple-600" />}
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
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-bold text-purple-600">
                                                {(judge.assignmentCount ?? judge.currentLoad ?? 0) + currentAssignments} assigned
                                                {currentAssignments > 0 ? ` (+${currentAssignments} pending)` : ''}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {judge.expertise.map(exp => (
                                                <span key={exp} className="px-2 py-0.5 bg-slate-100 rounded-md text-[8px] font-bold text-slate-500 uppercase">
                                                    {exp}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                        isSelected ? 'bg-purple-600 border-purple-600' : 'border-slate-200'
                                    }`}>
                                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Assignment Actions */}
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                    <AlertCircle className="text-purple-600" size={20} />
                    <div>
                        <h5 className="text-sm font-bold text-slate-900">Bulk Assignment</h5>
                        <p className="text-xs text-slate-500">
                            Assign selected judges to selected teams
                        </p>
                    </div>
                </div>
                
                <button
                    onClick={assignSelectedJudgesToTeams}
                    disabled={selectedTeams.length === 0 || selectedJudges.length === 0}
                    className="px-6 py-3 bg-purple-600 text-white rounded-xl text-sm font-black uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
                >
                    <Plus size={16} />
                    Assign to {selectedTeams.length} Team{selectedTeams.length !== 1 ? 's' : ''}
                </button>
            </div>
        </div>
    );
};

export default JudgeTeamAssignment;

