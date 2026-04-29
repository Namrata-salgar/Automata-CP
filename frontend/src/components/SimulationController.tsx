import React, { useState, useEffect, useRef } from 'react';
import DFAGraph from './DFAGraph';

interface Props {
  format: string;
  trace: number[];
  input: string;
}

const SPEEDS = {
  Slow: 2000,
  Normal: 1500,
  Fast: 800,
  'Very Fast': 300,
};

export default function SimulationController({ format, trace, input }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<keyof typeof SPEEDS>('Normal');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [format, trace, input]);

  useEffect(() => {
    if (isPlaying && currentStep < trace.length - 1) {
      timerRef.current = setTimeout(() => {
        setCurrentStep(prev => {
          if (prev >= trace.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, SPEEDS[speed]);
    } else if (currentStep >= trace.length - 1) {
      setIsPlaying(false);
    }
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStep, speed, trace.length]);

  const handlePlayPause = () => {
    if (currentStep >= trace.length - 1) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const stepForward = () => {
    if (currentStep < trace.length - 1) {
      setCurrentStep(prev => prev + 1);
      setIsPlaying(false);
    }
  };

  const stepBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setIsPlaying(false);
    }
  };

  return (
    <div className="simulation-controller">
      <DFAGraph 
        format={format} 
        trace={trace} 
        input={input} 
        currentStep={currentStep} 
      />
      
      {/* Clean Info Bar Below Diagram */}
      <div className="info-bar">
        <div className="info-bar__left">
          {input.split('').map((char, idx) => {
            let status = 'future';
            if (idx < currentStep) status = 'past';
            else if (idx === currentStep) status = 'current';
            return (
              <span key={idx} className={`char-box char-box--${status}`}>
                {char}
              </span>
            );
          })}
        </div>

        <div className="info-bar__center">
          <span className="monospace-explanation">
            {/* Will populate this dynamically in CSS or logic, wait, passing from DFAGraph? */}
          </span>
        </div>

        <div className="info-bar__right">
          <button className="ctrl-btn" onClick={stepBack} disabled={currentStep === 0}>◀</button>
          <button className="ctrl-btn ctrl-btn--play" onClick={handlePlayPause}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button className="ctrl-btn" onClick={stepForward} disabled={currentStep >= trace.length - 1}>▶▶</button>
          <select 
            className="ctrl-speed" 
            value={speed} 
            onChange={(e) => setSpeed(e.target.value as keyof typeof SPEEDS)}
          >
            {Object.keys(SPEEDS).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
