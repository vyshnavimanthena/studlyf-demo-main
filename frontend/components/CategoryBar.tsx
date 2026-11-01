
import React from 'react';
import { Monitor, Cpu, Code, Database, Briefcase } from 'lucide-react';

const categories = [
    { name: 'Tech', icon: <Monitor size={20} /> },
    { name: 'Computer Science', icon: <Cpu size={20} /> },
    { name: 'Coding & AI', icon: <Code size={20} /> },
    { name: 'Data Analysis', icon: <Database size={20} /> },
    { name: 'Careers', icon: <Briefcase size={20} /> },
];

const CategoryBar: React.FC = () => {
    return (
        <div className="w-full bg-white border-t border-b border-gray-100 py-4 overflow-x-auto no-scrollbar">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between min-w-[600px]">
                {categories.map((cat, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors cursor-pointer"
                    >
                        <span className="text-gray-400">{cat.icon}</span>
                        <span>{cat.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryBar;

