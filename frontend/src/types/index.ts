export interface DFAResult {
  valid: boolean;
  trace: number[];
  error_position: number;
  error_message: string;
}

export interface FormatInfo {
  key: string;
  label: string;
  pattern: string;
  valid_examples: string[];
  invalid_examples: string[];
}

export interface HistoryEntry {
  id: string;
  format: string;
  input: string;
  result: DFAResult;
  timestamp: number;
}