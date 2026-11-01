import React from 'react';
import { Search } from 'lucide-react';

interface SearchFilterProps {
    onSearch: (query: string) => void;
    onCategoryChange: (category: string) => void;
    selectedCategory: string;
}

const AIToolSearch: React.FC<SearchFilterProps> = ({ onSearch }) => {
    return (
        <div className="flex flex-col gap-6 w-full mb-10">
            <div className="relative group max-w-4xl mx-auto w-full">
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none group-focus-within:text-[#7C3AED] text-[#6B7280] transition-colors">
                    <Search className="w-5 h-5" />
                </div>
                <input
                    type="search"
                    onChange={(e) => onSearch(e.target.value)}
                    placeholder="Search tools by name, category or description..."
                    className="w-full bg-[#F9FAFB] border-2 border-gray-100 rounded-[2.5rem] py-4 pl-16 pr-8 text-[#111827] text-base placeholder-gray-400 focus:outline-none focus:border-[#7C3AED]/20 focus:bg-white transition-all shadow-sm focus:shadow-xl focus:shadow-[#7C3AED]/5"
                />
            </div>
        </div>
    );
};

export default AIToolSearch;

