import React from 'react';
import { HistoryEntry } from '../types';

interface Props {
  history: HistoryEntry[];
  onClear: () => void;
  onReplay: (entry: HistoryEntry) => void;
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function HistoryPanel({ history, onClear, onReplay }: Props) {
  if (history.length === 0) {
    return (
      <div className="history-panel history-panel--empty" id="history-panel">
        <p>No validation history yet</p>
      </div>
    );
  }

  return (
    <div className="history-panel" id="history-panel">
      <div className="history-panel__header">
        <h4>History</h4>
        <button className="history-panel__clear" onClick={onClear}>Clear</button>
      </div>
      <div className="history-panel__list">
        {history.map((entry) => (
          <button
            key={entry.id}
            className={`history-item ${entry.result.valid ? 'history-item--valid' : 'history-item--invalid'}`}
            onClick={() => onReplay(entry)}
          >
            <span className="history-item__status">{entry.result.valid ? '✓' : '✗'}</span>
            <span className="history-item__input">{entry.input}</span>
            <span className="history-item__format">{entry.format}</span>
            <span className="history-item__time">{timeAgo(entry.timestamp)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}