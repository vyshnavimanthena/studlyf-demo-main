import React from 'react';

const AIToolSkeleton = () => (
    <div className="bg-white border border-gray-100 rounded-[1.5rem] p-6 flex flex-col h-full animate-pulse">
        <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gray-100" />
            <div className="w-20 h-6 rounded-full bg-gray-50" />
        </div>
        <div className="h-8 w-3/4 bg-gray-100 rounded-lg mb-4" />
        <div className="space-y-2 mb-8">
            <div className="h-4 w-full bg-gray-50 rounded" />
            <div className="h-4 w-5/6 bg-gray-50 rounded" />
        </div>
        <div className="mt-auto h-12 w-full bg-gray-100 rounded-xl" />
    </div>
);

const SkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <AIToolSkeleton key={i} />
        ))}
    </div>
);

export default SkeletonGrid;

