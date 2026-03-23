import React from 'react';
import { DFAResult } from '../types';

interface Props {
  result: DFAResult | null;
  error: string | null;
  input: string;
}

export default function ResultBanner({ result, error, input }: Props) {
  if (error) {
    return (
      <div className="result-banner result-banner--error" id="result-banner">
        <div className="result-banner__icon">⚠️</div>
        <div className="result-banner__content">
          <h4>Connection Error</h4>
          <p>{error}</p>
          <p className="result-banner__hint">Make sure the backend is running on port 8080</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const isValid = result.valid;

  return (
    <div className={`result-banner ${isValid ? 'result-banner--valid' : 'result-banner--invalid'}`} id="result-banner">
      <div className="result-banner__icon">
        {isValid ? '✅' : '❌'}
      </div>
      <div className="result-banner__content">
        <h4>{isValid ? 'Valid' : 'Invalid'}</h4>
        <p className="result-banner__input">
          {input.split('').map((ch, i) => (
            <span
              key={i}
              className={`result-char ${
                !isValid && result.error_position === i ? 'result-char--error' : ''
              } ${
                result.trace[i + 1] !== undefined ? 'result-char--traced' : ''
              }`}
            >
              {ch}
            </span>
          ))}
        </p>
        {!isValid && result.error_message && (
          <p className="result-banner__msg">{result.error_message}</p>
        )}
      </div>
    </div>
  );
}