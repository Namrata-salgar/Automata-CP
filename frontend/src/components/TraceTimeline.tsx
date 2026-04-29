import React, { useEffect, useRef } from 'react';
import { DFA_LAYOUTS } from '../constants/dfaLayouts';

interface Props {
  format: string;
  trace: number[];
  input: string;
  currentStep: number;
  onJumpToStep: (step: number) => void;
}

export default function TraceTimeline({ format, trace, input, currentStep, onJumpToStep }: Props) {
  const layout = DFA_LAYOUTS[format];
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll timeline to keep current step visible
  useEffect(() => {
    if (containerRef.current) {
      const activeEl = containerRef.current.querySelector('.trace-step--active') as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentStep]);

  if (trace.length === 0 || !layout) return null;

  return (
    <div className="trace-timeline" id="trace-timeline">
      <h4 className="trace-timeline__title">State Trace</h4>
      <div className="trace-timeline__track" ref={containerRef}>
        {trace.map((stateId, i) => {
          const char = i === 0 ? 'ε' : input[i - 1] || '?';
          const node = layout.nodes.find(n => n.id === stateId);
          
          let statusClass = 'trace-step--future';
          if (i < currentStep) statusClass = 'trace-step--past';
          if (i === currentStep) statusClass = 'trace-step--active';

          return (
            <React.Fragment key={i}>
              <div 
                className={`trace-step ${statusClass}`}
                onClick={() => onJumpToStep(i)}
                title={`Jump to step ${i}`}
              >
                <div className="trace-step__state">q{stateId}</div>
                <div className="trace-step__char">
                  {i === 0 ? 'start' : `'${char}'`}
                </div>
                <div className="trace-step__label">{node?.label || 'Unknown'}</div>
              </div>
              {i < trace.length - 1 && <div className={`trace-arrow ${i < currentStep ? 'trace-arrow--active' : ''}`}>→</div>}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}