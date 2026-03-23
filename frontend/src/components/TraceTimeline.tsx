import React from 'react';
import { DFAResult } from '../types';

interface Props {
  trace: number[];
  input: string;
}

export default function TraceTimeline({ trace, input }: Props) {
  if (trace.length === 0) return null;

  return (
    <div className="trace-timeline" id="trace-timeline">
      <h4 className="trace-timeline__title">State Trace</h4>
      <div className="trace-timeline__track">
        {trace.map((state, i) => {
          const char = i === 0 ? 'ε' : input[i - 1] || '?';
          const isLast = i === trace.length - 1;

          return (
            <React.Fragment key={i}>
              <div className={`trace-step ${isLast ? 'trace-step--final' : ''}`}>
                <div className="trace-step__state">q{state}</div>
                <div className="trace-step__char">
                  {i === 0 ? 'start' : (
                    <span className="trace-step__input-char">'{char}'</span>
                  )}
                </div>
              </div>
              {!isLast && <div className="trace-arrow">→</div>}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}