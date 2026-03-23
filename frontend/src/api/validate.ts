import { DFAResult, FormatInfo } from '../types';

const API_BASE = '/api';

export async function validateInput(
  input: string,
  format: string
): Promise<DFAResult> {
  const res = await fetch(`${API_BASE}/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input, format }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Validation request failed');
  }
  return res.json();
}

export async function getFormats(): Promise<FormatInfo[]> {
  const res = await fetch(`${API_BASE}/formats`);
  if (!res.ok) throw new Error('Failed to fetch formats');
  const data = await res.json();
  return data.formats;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}