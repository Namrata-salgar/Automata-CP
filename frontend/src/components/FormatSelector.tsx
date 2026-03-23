import React from 'react';
import { FormatInfo } from '../types';

interface Props {
  formats: FormatInfo[];
  selected: string;
  onSelect: (key: string) => void;
}

const FORMAT_ICONS: Record<string, string> = {
  email: '✉',
  ipv4: '🌐',
  date: '📅',
  binary: '⚡',
  hex: '🔷',
  name: '👤',
  phone: '📱',
};

export default function FormatSelector({ formats, selected, onSelect }: Props) {
  return (
    <div className="format-selector">
      <h3 className="format-selector__title">Select Format</h3>
      <div className="format-selector__grid">
        {formats.map((f) => (
          <button
            key={f.key}
            className={`format-card ${selected === f.key ? 'format-card--active' : ''}`}
            onClick={() => onSelect(f.key)}
            id={`format-${f.key}`}
          >
            <span className="format-card__icon">{FORMAT_ICONS[f.key] || '📄'}</span>
            <span className="format-card__label">{f.label}</span>
            <span className="format-card__pattern">{f.pattern}</span>
          </button>
        ))}
      </div>
    </div>
  );
}