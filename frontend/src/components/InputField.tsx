import React, { useState } from 'react';
import { FormatInfo } from '../types';

interface Props {
  format: FormatInfo | undefined;
  value: string;
  onChange: (val: string) => void;
  onValidate: () => void;
  loading: boolean;
}

export default function InputField({ format, value, onChange, onValidate, loading }: Props) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && value.trim()) {
      onValidate();
    }
  };

  const fillExample = (ex: string) => {
    onChange(ex);
  };

  return (
    <div className="input-field">
      <div className="input-field__row">
        <input
          id="validation-input"
          type="text"
          className="input-field__input"
          placeholder={format ? `Enter ${format.label}...` : 'Select a format first...'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!format}
          autoComplete="off"
          spellCheck={false}
        />
        <button
          id="validate-btn"
          className="input-field__btn"
          onClick={onValidate}
          disabled={loading || !value.trim() || !format}
        >
          {loading ? (
            <span className="spinner" />
          ) : (
            'Validate'
          )}
        </button>
      </div>
      {format && (
        <div className="input-field__examples">
          <span className="input-field__examples-label">Try:</span>
          {format.valid_examples.slice(0, 3).map((ex) => (
            <button
              key={ex}
              className="example-chip example-chip--valid"
              onClick={() => fillExample(ex)}
            >
              {ex}
            </button>
          ))}
          {format.invalid_examples.slice(0, 2).map((ex) => (
            <button
              key={ex}
              className="example-chip example-chip--invalid"
              onClick={() => fillExample(ex)}
            >
              {ex}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}