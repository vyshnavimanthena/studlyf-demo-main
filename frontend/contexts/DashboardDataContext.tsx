import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface DashboardCache {
    [key: string]: any;
}

const DashboardDataContext = createContext<{
    cache: DashboardCache;
    setCacheData: (key: string, data: any) => void;
    isLoading: Record<string, boolean>;
    setLoading: (key: string, loading: boolean) => void;
}>({
    cache: {},
    setCacheData: () => {},
    isLoading: {},
    setLoading: () => {},
});

export const DashboardDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cache, setCache] = useState<DashboardCache>({});
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

    const setCacheData = useCallback((key: string, data: any) => {
        setCache(prev => ({ ...prev, [key]: data }));
    }, []);

    const setLoading = useCallback((key: string, loading: boolean) => {
        setIsLoading(prev => ({ ...prev, [key]: loading }));
    }, []);

    return (
        <DashboardDataContext.Provider value={{ cache, setCacheData, isLoading, setLoading }}>
            {children}
        </DashboardDataContext.Provider>
    );
};

export const useDashboardCache = () => useContext(DashboardDataContext);

export const useDashboardData = <T,>(key: string, fetcher: () => Promise<T>) => {
    const { cache, setCacheData, isLoading, setLoading } = useDashboardCache();
    const data = cache[key] as T;
    const loading = isLoading[key] ?? true;

    useEffect(() => {
        if (!cache[key]) {
            setLoading(key, true);
            fetcher()
                .then(result => {
                    setCacheData(key, result);
                })
                .catch(err => {
                    try { console.error(`Error fetching ${key}:`, err instanceof Error ? err.message : String(err)); } catch (_) {}
                })
                .finally(() => {
                    setLoading(key, false);
                });
        } else {
            setLoading(key, false);
        }
    }, [key, cache, fetcher, setCacheData, setLoading, loading]);

    return { data, loading };
};

