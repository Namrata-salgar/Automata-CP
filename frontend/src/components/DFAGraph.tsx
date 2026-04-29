import React, { useState, useEffect, useRef } from 'react';
import { DFA_LAYOUTS } from '../constants/dfaLayouts';

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

const COLORS = {
  node: '#141428',
  nodeBorder: '#3b3b6b',
  nodeText: '#e0e0ff',
  dead: '#331111',
  deadBorder: '#ff4444',
  edge: '#4b4b7b',
  edgeText: '#ffffff',
  activeNode: '#06B6D4',
  activeEdge: '#06B6D4',
  deadEdge: '#ff4444',
  dot: '#ffffff',
};

export default function DFAGraph({ format, trace, input }: Props) {
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
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isPlaying, currentStep, speed, trace.length]);

  const layout = DFA_LAYOUTS[format];
  if (!layout) return <div className="dfa-graph--empty"><p>No graph for this format</p></div>;

  const SCALE = 1.8;
  const R = 36;
  const currentState = trace.length > 0 ? trace[currentStep] : -1;
  const activeEdgeKey = currentStep > 0 ? `${trace[currentStep - 1]}-${trace[currentStep]}` : '';

  const isFinalStep = currentStep === trace.length - 1 && trace.length > 0;
  const isFinalAccept = isFinalStep && layout.nodes.find(n => n.id === currentState)?.isAccept;
  const isFinalDead = isFinalStep && layout.nodes.find(n => n.id === currentState)?.isDead;

  let explanation = '';
  let statusBannerClass = '';
  if (currentStep === 0) {
    explanation = "Step 0 — Ready to process input. Currently at Start state.";
  } else {
    const prevNode = layout.nodes.find(n => n.id === trace[currentStep - 1]);
    const currNode = layout.nodes.find(n => n.id === trace[currentStep]);
    const char = input[currentStep - 1];
    explanation = `'${char}' → ${prevNode?.label} to ${currNode?.label}`;
    if (isFinalAccept) statusBannerClass = 'diagram--accept';
    if (isFinalDead) statusBannerClass = 'diagram--reject';
  }

  const edges = layout.edges.map((edge) => {
    const from = layout.nodes.find(n => n.id === edge.from)!;
    const to = layout.nodes.find(n => n.id === edge.to)!;
    if (!from || !to) return null;

    const fx = from.x * SCALE;
    const fy = from.y * SCALE;
    const tx = to.x * SCALE;
    const ty = to.y * SCALE;
    
    const isSelf = from.id === to.id;
    const isDeadEdge = (edge as any).isDeadEdge || edge.label === 'other';

    let d = '';
    let labelX = 0, labelY = 0;

    if (isSelf) {
      d = `M ${fx},${fy - R} C ${fx - 50},${fy - 120} ${fx + 50},${fy - 120} ${fx},${fy - R}`;
      labelX = fx; labelY = fy - 100;
    } else if (isDeadEdge) {
      d = `M ${fx},${fy} L ${tx},${ty}`;
      labelX = (fx + tx) / 2; labelY = (fy + ty) / 2;
    } else {
      const cx = (fx + tx) / 2;
      const cy = (fy + ty) / 2 - 50; // Lifted 50px
      d = `M ${fx},${fy} Q ${cx},${cy} ${tx},${ty}`;
      labelX = 0.25*fx + 0.5*cx + 0.25*tx;
      labelY = 0.25*fy + 0.5*cy + 0.25*ty - 12;
    }

    return { ...edge, key: `${edge.from}-${edge.to}`, d, labelX, labelY, isSelf, isDeadEdge, fx, fy, tx, ty };
  }).filter(Boolean);

  const activeEdgeData = currentStep > 0 ? edges.find(e => e?.key === activeEdgeKey) : null;

  return (
    <div className={`dfa-diagram-container ${statusBannerClass}`}>
      <svg viewBox="0 0 1600 500" className="dfa-svg" width="100%" height="100%" style={{ minHeight: '500px', background: '#0a0a15', borderRadius: '8px' }}>
        <defs>
          <marker id="arrow-inactive" viewBox="0 0 10 10" refX="26" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.edge} />
          </marker>
          <marker id="arrow-active" viewBox="0 0 10 10" refX="26" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.activeEdge} />
          </marker>
          <marker id="arrow-dead" viewBox="0 0 10 10" refX="26" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={COLORS.deadEdge} />
          </marker>
          <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {edges.map((e: any) => {
          const isActive = e.key === activeEdgeKey;
          const marker = isActive ? "url(#arrow-active)" : e.isDeadEdge ? "url(#arrow-dead)" : "url(#arrow-inactive)";
          const strokeColor = isActive ? COLORS.activeEdge : e.isDeadEdge ? COLORS.deadEdge : COLORS.edge;

          return (
            <g key={`edge-${e.key}`}>
              <path 
                d={e.d} fill="none" stroke={strokeColor} strokeWidth={isActive ? 3 : 2}
                strokeDasharray={e.isDeadEdge ? "6,6" : "none"} markerEnd={marker}
              />
              <g transform={`translate(${e.labelX}, ${e.labelY})`}>
                <rect x="-35" y="-12" width="70" height="24" rx="4" fill="#1a1a3a" stroke={strokeColor} strokeWidth="1" />
                <text x="0" y="0" fill={COLORS.edgeText} fontSize="11" fontFamily="monospace" textAnchor="middle" dominantBaseline="middle">
                  {e.label}
                </text>
              </g>
            </g>
          );
        })}

        {activeEdgeData && (
          <g key={`dot-${currentStep}`}>
            <circle r="8" fill={COLORS.dot} filter="url(#glow-cyan)">
              <animateMotion dur="0.8s" repeatCount="1" path={activeEdgeData.d} fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" />
              <animate attributeName="opacity" values="1;1;0" keyTimes="0; 0.9; 1" dur="0.8s" fill="freeze" />
            </circle>
          </g>
        )}

        {layout.nodes.map(n => {
          const isCurrent = n.id === currentState;
          const cx = n.x * SCALE;
          const cy = n.y * SCALE;
          let fill = COLORS.node; let stroke = COLORS.nodeBorder; let filter = 'none';
          
          if (isCurrent) { stroke = COLORS.activeNode; filter = 'url(#glow-cyan)'; }
          else if (n.isDead) { fill = COLORS.dead; stroke = COLORS.deadBorder; }

          return (
            <g key={`node-${n.id}`}>
              <circle cx={cx} cy={cy} r={R} fill={fill} stroke={stroke} strokeWidth={isCurrent ? 3 : 2} filter={filter} />
              {n.isAccept && <circle cx={cx} cy={cy} r={R + 8} fill="none" stroke={stroke} strokeWidth="2" />}
              {n.isStart && <path d={`M ${cx - R - 30} ${cy} L ${cx - R} ${cy}`} stroke={COLORS.edge} strokeWidth="2" markerEnd="url(#arrow-inactive)" />}
              <text x={cx} y={cy} fill={isCurrent ? COLORS.activeNode : COLORS.nodeText} fontSize="16" fontWeight="bold" fontFamily="monospace" textAnchor="middle" dominantBaseline="middle">
                q{n.id}
              </text>
              <text x={cx} y={cy + R + 18} fill="#a0a0c0" fontSize="12" fontFamily="monospace" textAnchor="middle" dominantBaseline="middle">
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
      
      <div className="info-bar">
        <div className="info-bar__left">
          {input.split('').map((char, idx) => {
            let status = 'future';
            if (idx < currentStep) status = 'past';
            else if (idx === currentStep) status = 'current';
            return <span key={idx} className={`char-box char-box--${status}`}>{char}</span>;
          })}
        </div>
        <div className="info-bar__center monospace-explanation">{explanation}</div>
        <div className="info-bar__right">
          <button className="ctrl-btn" onClick={() => { if (currentStep > 0) { setCurrentStep(p => p - 1); setIsPlaying(false); } }} disabled={currentStep === 0}>◀</button>
          <button className="ctrl-btn ctrl-btn--play" onClick={() => { if (currentStep >= trace.length - 1) { setCurrentStep(0); setIsPlaying(true); } else setIsPlaying(!isPlaying); }}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button className="ctrl-btn" onClick={() => { if (currentStep < trace.length - 1) { setCurrentStep(p => p + 1); setIsPlaying(false); } }} disabled={currentStep >= trace.length - 1}>▶▶</button>
          <select className="ctrl-speed" value={speed} onChange={(e) => setSpeed(e.target.value as keyof typeof SPEEDS)}>
            {Object.keys(SPEEDS).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}