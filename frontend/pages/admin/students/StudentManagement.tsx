
import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    MoreVertical,
    Mail,
    ShieldAlert,
    History,
    UserPlus,
    CheckCircle2,
    XCircle,
    Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { API_BASE_URL } from '../../../apiConfig';
import { useAuth } from '../../../AuthContext';

const StudentManagement: React.FC = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    
    // Registration Modal State
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [newStudent, setNewStudent] = useState({ name: '', email: '', college: '', role: 'student' });
    const [registering, setRegistering] = useState(false);

    const fetchStudents = async () => {
        if (!user?.email) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/students`, {
                headers: { 'X-Admin-Email': user.email }
            });
            if (!response.ok) return;
            const data = await response.json();
            if (!Array.isArray(data)) return;
            const formatted = data.map((s: any) => ({
                id: s.uid || s._id || Math.random().toString(),
                name: s.displayName || s.name || 'Anonymous Student',
                email: s.email || 'N/A',
                course: s.role === 'super_admin' ? 'Admin' : 'Active Learner',
                score: s.skill_score || 0,
                status: s.status === 'active' ? 'Hiring Ready' : 'In Assessment',
                college: s.college || 'StudLyf Partner',
                joined: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A',
                restricted: s.restricted || false
            }));
            setStudents(formatted);
        } catch (error) {
            try { console.error("Error fetching students:", error instanceof Error ? error.message : String(error)); } catch (_) {}
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [user]);

    const tabs = ['All', 'Placed', 'Hiring Ready', 'In Assessment', 'Needs Improvement'];

    const filteredStudents = students.filter(s =>
        (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
         s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
         s.college.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (activeTab === 'All' || s.status === activeTab)
    );

    const handleExportCSV = () => {
        if (students.length === 0) return;
        const headers = ["ID", "Name", "Email", "College", "Score", "Status", "Joined"];
        const rows = filteredStudents.map(s => [s.id, s.name, s.email, s.college, s.score, s.status, s.joined]);
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `StudLyf_Students_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newStudent.email || !newStudent.name) return;
        setRegistering(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/register-student`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Admin-Email': user?.email || '' },
                body: JSON.stringify(newStudent)
            });
            if (res.ok) {
                alert('Student registered successfully!');
                setIsRegisterModalOpen(false);
                setNewStudent({ name: '', email: '', college: '', role: 'student' });
                fetchStudents();
            } else {
                const err = await res.json();
                alert(`Error: ${err.detail || 'Failed to register'}`);
            }
        } catch (err) { } finally { setRegistering(false); }
    };

    const toggleRestriction = async (studentId: string, currentStatus: boolean) => {
        if (!window.confirm(`${currentStatus ? 'Unrestrict' : 'Restrict'} access for this student?`)) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/restrict-student`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Admin-Email': user?.email || '' },
                body: JSON.stringify({ student_id: studentId, restricted: !currentStatus })
            });
            if (res.ok) fetchStudents();
        } catch (err) { }
    };

    return (
        <div className="space-y-3 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Student Management</h1>
                    <p className="text-white/50 mt-1">Manage, track, and support the entire student community.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors text-white">
                        <Download size={18} />
                        Export CSV
                    </button>
                    <button onClick={() => setIsRegisterModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-purple-500/20">
                        <UserPlus size={18} />
                        Register Student
                    </button>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 custom-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab
                                ? 'bg-white/10 text-white border border-white/20'
                                : 'text-white/40 hover:text-white/60'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="relative flex-grow max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input
                        type="search"
                        placeholder="Search students..."
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/10">
                                <th className="px-3 sm:px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Student</th>
                                <th className="px-3 sm:px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Course & College</th>
                                <th className="px-3 sm:px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-center">Skill Score</th>
                                <th className="px-3 sm:px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
                                <th className="px-3 sm:px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Joined</th>
                                <th className="px-3 sm:px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredStudents.map((student) => (
                                <motion.tr
                                    key={student.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={`hover:bg-white/[0.02] transition-colors group ${student.restricted ? 'opacity-50 grayscale' : ''}`}
                                >
                                    <td className="px-3 sm:px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center font-bold text-white/80">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-white flex items-center gap-2">
                                                    {student.name}
                                                    {student.restricted && <ShieldAlert size={12} className="text-red-500" />}
                                                </div>
                                                <div className="text-xs text-white/40">{student.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-4">
                                        <div className="text-sm text-white/80">{student.course}</div>
                                        <div className="text-xs text-white/40">{student.college}</div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 text-center">
                                        <div className={`text-sm font-bold ${student.score >= 90 ? 'text-green-400' : student.score >= 75 ? 'text-blue-400' : 'text-orange-400'}`}>
                                            {student.score}%
                                        </div>
                                        <div className="w-20 bg-white/5 h-1 rounded-full mx-auto mt-1 overflow-hidden">
                                            <div className={`h-full rounded-full ${student.score >= 90 ? 'bg-green-500' : student.score >= 75 ? 'bg-blue-500' : 'bg-orange-500'}`} style={{ width: `${student.score}%` }} />
                                        </div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${student.status === 'Placed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                            student.status === 'Hiring Ready' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                student.status === 'Interviewing' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                    student.status === 'Needs Improvement' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                        'bg-white/10 text-white/60 border-white/10'
                                            }`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 text-sm text-white/40 font-mono">
                                        {student.joined}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a href={`mailto:${student.email}`} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all shadow-sm" title="Send Email">
                                                <Mail size={16} />
                                            </a>
                                            <button onClick={() => toggleRestriction(student.id, student.restricted)} className={`p-2 hover:bg-white/10 rounded-lg ${student.restricted ? 'text-red-500' : 'text-white/60'} hover:text-red-500 transition-all shadow-sm`} title={student.restricted ? "Unrestrict Account" : "Restrict Account"}>
                                                <ShieldAlert size={16} />
                                            </button>
                                            <button className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all shadow-sm">
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredStudents.length === 0 && (
                        <div className="py-20 text-center">
                            <div className="text-white/20 mb-2 flex justify-center"><Search size={48} /></div>
                            <h3 className="text-white/60 font-medium">{loading ? 'Scanning ecosystem...' : 'No students found'}</h3>
                            <p className="text-white/30 text-sm">Try adjusting your search or filters.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-4">
                <div className="text-sm text-white/40">
                    Showing <span className="text-white font-medium">{filteredStudents.length}</span> of <span className="text-white font-medium">{students.length}</span> recorded students
                </div>
            </div>

            {/* Register Modal */}
            <AnimatePresence>
                {isRegisterModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsRegisterModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-[#1A1A1A] border border-white/10 w-full max-w-md rounded-[2rem] p-8 shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500" />
                            <h2 className="text-2xl font-bold text-white mb-2">Register New Student</h2>
                            <p className="text-white/40 text-sm mb-6 uppercase tracking-widest font-black">Direct Portal Entry</p>

                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Full Name</label>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="Enter name"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 transition-all"
                                        value={newStudent.name}
                                        onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Email Address</label>
                                    <input 
                                        required
                                        type="email" 
                                        placeholder="student@example.com"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 transition-all"
                                        value={newStudent.email}
                                        onChange={e => setNewStudent({...newStudent, email: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">College/Institution</label>
                                    <input 
                                        type="text" 
                                        placeholder="Partner College"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 transition-all"
                                        value={newStudent.college}
                                        onChange={e => setNewStudent({...newStudent, college: e.target.value})}
                                    />
                                </div>
                                
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setIsRegisterModalOpen(false)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all">Cancel</button>
                                    <button 
                                        type="submit" 
                                        disabled={registering}
                                        className="flex-3 py-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-purple-500/20 disabled:opacity-50"
                                    >
                                        {registering ? 'Processing...' : 'Register Protocol'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudentManagement;

