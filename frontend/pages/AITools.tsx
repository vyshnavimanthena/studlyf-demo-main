import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, AlertCircle, RefreshCw } from 'lucide-react';
import AIToolGrid from '../components/AIToolGrid';
import AIToolSearch from '../components/AIToolSearch';
import SkeletonGrid from '../components/AIToolSkeleton';
import { API_BASE_URL } from '../apiConfig';

interface Tool {
    name: string;
    description: string;
    logo: string;
    category: string;
    url: string;
}

const AITools: React.FC = () => {
    const [tools, setTools] = useState<Tool[]>([]);
    const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [bookmarkedTools, setBookmarkedTools] = useState<string[]>([]);
    const [filterTab, setFilterTab] = useState<'all' | 'bookmarked'>('all');

    useEffect(() => {
        const saved = localStorage.getItem('studlyf_bookmarked_tools');
        if (saved) {
            try {
                setBookmarkedTools(JSON.parse(saved));
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    const handleToggleBookmark = (name: string) => {
        setBookmarkedTools(prev => {
            const updated = prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name];
            localStorage.setItem('studlyf_bookmarked_tools', JSON.stringify(updated));
            return updated;
        });
    };

    useEffect(() => {
        fetchTools();
    }, []);

    const fetchTools = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/ai-tools`);
            if (!response.ok) throw new Error('Failed to fetch AI tools');
            const data = await response.json();
            setTools(data);
            setFilteredTools(data);
        } catch (err) {
            try { console.error('Error fetching AI tools:', err instanceof Error ? err.message : String(err)); } catch (_) {}
            setError('Unable to fetch AI tools right now. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let result = tools;

        if (filterTab === 'bookmarked') {
            result = result.filter(t => bookmarkedTools.includes(t.name));
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(tool =>
                tool.name.toLowerCase().includes(query) ||
                tool.category.toLowerCase().includes(query) ||
                tool.description.toLowerCase().includes(query)
            );
        }

        setFilteredTools(result);
    }, [searchQuery, tools, filterTab, bookmarkedTools]);

    return (
        <div className="min-h-screen bg-white text-[#111827] pt-32 pb-20 px-3 sm:px-6 lg:px-12 relative overflow-hidden">
            {/* Design Accents */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#7C3AED]/5 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#7C3AED]/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">

                {/* Hero Section */}
                <div className="text-center mb-12 space-y-4">
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-tight text-[#111827] uppercase"
                    >
                        AI DISCOVERY <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C4DFF] via-[#EC4899] to-[#FF5B5B]">HUB.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-[#6B7280] text-base max-w-2xl mx-auto font-medium leading-relaxed"
                    >
                        Elite database of industry-leading AI tools. Manual curated selection of premium engineering assets.
                    </motion.p>
                </div>

                {/* Search */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <AIToolSearch
                        onSearch={setSearchQuery}
                        onCategoryChange={() => {}}
                        selectedCategory=""
                    />
                </motion.div>

                {/* Custom Tab Filters */}
                <div className="flex flex-wrap justify-center gap-3 mb-10 mt-8">
                    <button
                        onClick={() => setFilterTab('all')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${
                            filterTab === 'all'
                                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:shadow-sm hover:text-gray-800'
                        }`}
                    >
                        All Tools
                    </button>
                    <button
                        onClick={() => setFilterTab('bookmarked')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${
                            filterTab === 'bookmarked'
                                ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-md'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:shadow-sm hover:text-gray-800'
                        }`}
                    >
                        ⭐ Bookmarked
                    </button>
                </div>

                {/* Content Area */}
                <div className="min-h-[400px]">
                    {loading ? (
                        <SkeletonGrid />
                    ) : error ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-24 bg-red-50 rounded-[3rem] border border-red-100"
                        >
                            <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
                            <h3 className="text-2xl font-bold text-[#111827] mb-2">Sync Interrupted</h3>
                            <p className="text-red-500 text-center mb-8 max-w-md">{error}</p>
                            <button
                                onClick={fetchTools}
                                className="flex items-center gap-2 px-8 py-3 bg-[#7C3AED] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#6D28D9] transition-all shadow-xl shadow-[#7C3AED]/20 active:scale-95"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Retry Sync
                            </button>
                        </motion.div>
                    ) : filteredTools.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
                                <LayoutGrid className="w-10 h-10 text-gray-300" />
                            </div>
                            <p className="text-gray-400 text-lg font-medium">No tactical protocols found in this segment.</p>
                        </div>
                    ) : (
                        <AIToolGrid 
                            tools={filteredTools} 
                            bookmarkedTools={bookmarkedTools} 
                            onToggleBookmark={handleToggleBookmark} 
                        />
                    )}
                </div>

            </div>
        </div>
    );
};

export default AITools;

