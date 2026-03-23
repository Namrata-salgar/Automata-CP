import React, { useState, useEffect, useCallback } from 'react';
import FormatSelector from './components/FormatSelector';
import InputField from './components/InputField';
import ResultBanner from './components/ResultBanner';
import DFAGraph from './components/DFAGraph';
import TraceTimeline from './components/TraceTimeline';
import HistoryPanel from './components/HistoryPanel';
import { useValidation } from './hooks/useValidation';
import { useHistory } from './hooks/useHistory';
import { getFormats, checkHealth } from './api/validate';
import { FormatInfo, HistoryEntry } from './types';

export default function App() {
  const [formats, setFormats] = useState<FormatInfo[]>([]);
  const [selectedFormat, setSelectedFormat] = useState('email');
  const [inputValue, setInputValue] = useState('');
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  const { result, loading, error, validate, reset } = useValidation();
  const { history, addEntry, clearHistory } = useHistory();

  // Fetch formats from backend
  useEffect(() => {
    getFormats()
      .then((f) => {
        setFormats(f);
        setBackendOnline(true);
      })
      .catch(() => {
        setBackendOnline(false);
        // Use fallback formats
        setFormats([
          { key: 'email', label: 'Email Address', pattern: 'local@domain.tld', valid_examples: ['user@example.com', 'riya.sharma@college.ac.in'], invalid_examples: ['@nodomain', 'user@'] },
          { key: 'ipv4', label: 'IPv4 Address', pattern: '0-255.0-255.0-255.0-255', valid_examples: ['192.168.1.1', '10.0.0.1'], invalid_examples: ['256.1.1.1', '1.2.3'] },
          { key: 'date', label: 'Date (DD/MM/YYYY)', pattern: 'DD/MM/YYYY', valid_examples: ['01/01/2024', '29/02/2000'], invalid_examples: ['31/02/2024', '2024/01/01'] },
          { key: 'binary', label: 'Binary Number', pattern: '[0b][01]+', valid_examples: ['101010', '0b1101'], invalid_examples: ['102', '0b'] },
          { key: 'hex', label: 'Hex Number (0x...)', pattern: '0x[0-9a-f]+', valid_examples: ['0x1A3F', '0xFF'], invalid_examples: ['1A3F', '0x'] },
          { key: 'name', label: 'Full Name', pattern: 'Firstname Lastname', valid_examples: ['Riya Sharma', 'Mary-Jane Watson'], invalid_examples: ['riya sharma', '123'] },
          { key: 'phone', label: 'Phone Number', pattern: '+CC digits', valid_examples: ['+91 98765 43210', '9876543210'], invalid_examples: ['12345', 'abcd'] },
        ]);
      });
  }, []);

  // Health check
  useEffect(() => {
    checkHealth().then(setBackendOnline);
    const interval = setInterval(() => {
      checkHealth().then(setBackendOnline);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleFormatChange = useCallback((key: string) => {
    setSelectedFormat(key);
    setInputValue('');
    reset();
  }, [reset]);

  const handleValidate = useCallback(async () => {
    if (!inputValue.trim()) return;
    const res = await validate(inputValue, selectedFormat);
    if (res) {
      addEntry(selectedFormat, inputValue, res);
    }
  }, [inputValue, selectedFormat, validate, addEntry]);

  const handleReplay = useCallback((entry: HistoryEntry) => {
    setSelectedFormat(entry.format);
    setInputValue(entry.input);
    validate(entry.input, entry.format);
  }, [validate]);

  const currentFormat = formats.find((f) => f.key === selectedFormat);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__content">
          <h1 className="app-header__title">
            <span className="app-header__icon">⚙</span>
            Multi-Format Validator
          </h1>
          <p className="app-header__subtitle">
            DFA / NFA Automata-based input validation
          </p>
          <div className={`status-badge ${backendOnline ? 'status-badge--online' : 'status-badge--offline'}`}>
            <span className="status-badge__dot" />
            {backendOnline === null ? 'Checking...' : backendOnline ? 'Backend Online' : 'Backend Offline'}
          </div>
        </div>
      </header>

      <main className="app-main">
        <section className="section section--formats">
          <FormatSelector
            formats={formats}
            selected={selectedFormat}
            onSelect={handleFormatChange}
          />
        </section>

        <section className="section section--input">
          <InputField
            format={currentFormat}
            value={inputValue}
            onChange={setInputValue}
            onValidate={handleValidate}
            loading={loading}
          />
        </section>

        <ResultBanner result={result} error={error} input={inputValue} />

        {result && (
          <div className="visualization-grid">
            <section className="section section--graph">
              <DFAGraph format={selectedFormat} trace={result.trace} />
            </section>
            <section className="section section--trace">
              <TraceTimeline trace={result.trace} input={inputValue} />
            </section>
          </div>
        )}

        <section className="section section--history">
          <HistoryPanel
            history={history}
            onClear={clearHistory}
            onReplay={handleReplay}
          />
        </section>
      </main>

      <footer className="app-footer">
        <p>Automata Theory Project — DFA / NFA Multi-Format Validator</p>
      </footer>
    </div>
  );
}