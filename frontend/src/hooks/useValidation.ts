import { useState, useCallback } from 'react';
import { DFAResult } from '../types';
import { validateInput } from '../api/validate';

export function useValidation() {
  const [result, setResult] = useState<DFAResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(async (input: string, format: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await validateInput(input, format);
      setResult(res);
      return res;
    } catch (e: any) {
      setError(e.message || 'Validation failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, loading, error, validate, reset };
}