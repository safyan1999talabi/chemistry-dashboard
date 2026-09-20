import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { HistoryEntry } from '@/types';

export function useHistory() {
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>('chimlab_history', []);

  const addEntry = useCallback((entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    setHistory(prev => [newEntry, ...prev].slice(0, 50));
  }, [setHistory]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  const getRecent = useCallback((count: number = 5) => {
    return history.slice(0, count);
  }, [history]);

  return { history, addEntry, clearHistory, recent: getRecent() };
}
