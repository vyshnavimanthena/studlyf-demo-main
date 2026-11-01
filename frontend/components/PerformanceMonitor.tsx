import React, { useEffect } from 'react';

// Lightweight frontend performance observer to log core metrics
export const PerformanceMonitor: React.FC = () => {
    useEffect(() => {
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                console.log(`[PERF_AUDIT] Metric: ${entry.name} | Value: ${entry.startTime.toFixed(2)}ms`);
            });
        });

        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] });

        // Log total requests after load
        window.addEventListener('load', () => {
            const requests = performance.getEntriesByType('resource');
            console.log(`[PERF_AUDIT] Total Network Requests: ${requests.length}`);
            
            // Log top 5 largest requests
            const largest = requests
                .sort((a, b) => (b as PerformanceResourceTiming).transferSize - (a as PerformanceResourceTiming).transferSize)
                .slice(0, 5);
            largest.forEach(r => console.log(`[PERF_AUDIT] Largest Asset: ${r.name} | Size: ${(r as PerformanceResourceTiming).transferSize / 1024} KB`));
        });

        return () => observer.disconnect();
    }, []);

    return null;
};

