import { useState, useCallback } from 'react';
import { HistoryEntry, DFAResult } from '../types';

const MAX_HISTORY = 50;

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('validator-history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addEntry = useCallback((format: string, input: string, result: DFAResult) => {
    const entry: HistoryEntry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      format,
      input,
      result,
      timestamp: Date.now(),
    };
    setHistory((prev) => {
      const next = [entry, ...prev].slice(0, MAX_HISTORY);
      localStorage.setItem('validator-history', JSON.stringify(next));
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('validator-history');
  }, []);

  return { history, addEntry, clearHistory };
}