import React, { useRef, useEffect } from 'react';
import { DFA_LAYOUTS, DFALayout, DFANode, DFAEdge } from '../constants/dfaLayouts';

interface Props {
  format: string;
  trace: number[];
}

const COLORS = {
  bg: '#0f0f1a',
  node: '#1e1e3a',
  nodeBorder: '#3b3b6b',
  nodeText: '#e0e0ff',
  accept: '#0d3320',
  acceptBorder: '#00ff88',
  dead: '#331111',
  deadBorder: '#ff4444',
  start: '#1a1a4a',
  startBorder: '#6666ff',
  edge: '#3b3b6b',
  edgeText: '#9090c0',
  activeNode: '#1a0044',
  activeBorder: '#aa44ff',
  activeEdge: '#aa44ff',
  traceNode: 'rgba(170, 68, 255, 0.15)',
  traceBorder: 'rgba(170, 68, 255, 0.4)',
};

export default function DFAGraph({ format, trace }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layout = DFA_LAYOUTS[format];

  useEffect(() => {
    if (!canvasRef.current || !layout) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const R = 28;

    // Scale layout to fit
    const maxX = Math.max(...layout.nodes.map((n) => n.x)) + 60;
    const maxY = Math.max(...layout.nodes.map((n) => n.y)) + 60;
    const scaleX = (W - 40) / maxX;
    const scaleY = (H - 40) / maxY;
    const scale = Math.min(scaleX, scaleY, 1.2);
    const offsetX = (W - maxX * scale) / 2;
    const offsetY = (H - maxY * scale) / 2;

    const tx = (x: number) => x * scale + offsetX;
    const ty = (y: number) => y * scale + offsetY;

    // Active states in the trace
    const activeStates = new Set(trace);
    const currentState = trace.length > 0 ? trace[trace.length - 1] : -1;

    // Trace edges: consecutive pairs in the trace
    const traceEdges = new Set<string>();
    for (let i = 0; i < trace.length - 1; i++) {
      traceEdges.add(`${trace[i]}-${trace[i + 1]}`);
    }

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Draw edges
    layout.edges.forEach((edge) => {
      const from = layout.nodes.find((n) => n.id === edge.from)!;
      const to = layout.nodes.find((n) => n.id === edge.to)!;
      if (!from || !to) return;

      const x1 = tx(from.x), y1 = ty(from.y);
      const x2 = tx(to.x), y2 = ty(to.y);

      const isActive = traceEdges.has(`${edge.from}-${edge.to}`);

      if (from.id === to.id) {
        // Self-loop
        ctx.beginPath();
        ctx.arc(x1, y1 - R - 12, 14, 0, Math.PI * 2);
        ctx.strokeStyle = isActive ? COLORS.activeEdge : COLORS.edge;
        ctx.lineWidth = isActive ? 2.5 : 1.5;
        ctx.stroke();

        ctx.fillStyle = isActive ? COLORS.activeEdge : COLORS.edgeText;
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(edge.label, x1, y1 - R - 30);
        return;
      }

      const angle = Math.atan2(y2 - y1, x2 - x1);
      const sx = x1 + R * Math.cos(angle);
      const sy = y1 + R * Math.sin(angle);
      const ex = x2 - R * Math.cos(angle);
      const ey = y2 - R * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = isActive ? COLORS.activeEdge : COLORS.edge;
      ctx.lineWidth = isActive ? 2.5 : 1.5;
      ctx.stroke();

      // Arrow head
      const arrowLen = 10;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(
        ex - arrowLen * Math.cos(angle - 0.35),
        ey - arrowLen * Math.sin(angle - 0.35)
      );
      ctx.moveTo(ex, ey);
      ctx.lineTo(
        ex - arrowLen * Math.cos(angle + 0.35),
        ey - arrowLen * Math.sin(angle + 0.35)
      );
      ctx.strokeStyle = isActive ? COLORS.activeEdge : COLORS.edge;
      ctx.lineWidth = isActive ? 2.5 : 1.5;
      ctx.stroke();

      // Edge label
      const mx = (sx + ex) / 2;
      const my = (sy + ey) / 2;
      const labelOffset = 14;
      const perpX = -Math.sin(angle) * labelOffset;
      const perpY = Math.cos(angle) * labelOffset;

      ctx.fillStyle = isActive ? COLORS.activeEdge : COLORS.edgeText;
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(edge.label, mx + perpX, my + perpY);
    });

    // Draw nodes
    layout.nodes.forEach((n) => {
      const x = tx(n.x);
      const y = ty(n.y);
      const isCurrent = n.id === currentState;
      const isTraced = activeStates.has(n.id);

      // Glow effect for current state
      if (isCurrent) {
        ctx.beginPath();
        ctx.arc(x, y, R + 8, 0, Math.PI * 2);
        const glow = ctx.createRadialGradient(x, y, R, x, y, R + 12);
        glow.addColorStop(0, 'rgba(170, 68, 255, 0.3)');
        glow.addColorStop(1, 'rgba(170, 68, 255, 0)');
        ctx.fillStyle = glow;
        ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(x, y, R, 0, Math.PI * 2);
      ctx.fillStyle = isCurrent
        ? COLORS.activeNode
        : n.isDead ? COLORS.dead
        : n.isAccept ? COLORS.accept
        : isTraced ? COLORS.traceNode
        : COLORS.node;
      ctx.fill();

      ctx.strokeStyle = isCurrent
        ? COLORS.activeBorder
        : n.isDead ? COLORS.deadBorder
        : n.isAccept ? COLORS.acceptBorder
        : n.isStart ? COLORS.startBorder
        : isTraced ? COLORS.traceBorder
        : COLORS.nodeBorder;
      ctx.lineWidth = isCurrent ? 3 : 2;
      ctx.stroke();

      // Accept double circle
      if (n.isAccept) {
        ctx.beginPath();
        ctx.arc(x, y, R - 4, 0, Math.PI * 2);
        ctx.strokeStyle = isCurrent ? COLORS.activeBorder : COLORS.acceptBorder;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Start arrow
      if (n.isStart) {
        ctx.beginPath();
        ctx.moveTo(x - R - 20, y);
        ctx.lineTo(x - R, y);
        ctx.strokeStyle = isCurrent ? COLORS.activeBorder : COLORS.startBorder;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - R, y);
        ctx.lineTo(x - R - 8, y - 5);
        ctx.moveTo(x - R, y);
        ctx.lineTo(x - R - 8, y + 5);
        ctx.stroke();
      }

      // Label
      ctx.fillStyle = isCurrent ? '#e0b0ff' : COLORS.nodeText;
      ctx.font = `600 12px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.label, x, y);
    });
  }, [format, trace, layout]);

  if (!layout) {
    return (
      <div className="dfa-graph dfa-graph--empty" id="dfa-graph">
        <p>No graph for this format</p>
      </div>
    );
  }

  return (
    <div className="dfa-graph" id="dfa-graph">
      <h4 className="dfa-graph__title">DFA State Diagram</h4>
      <canvas ref={canvasRef} className="dfa-graph__canvas" />
      <div className="dfa-graph__legend">
        <span className="legend-item"><span className="legend-dot legend-dot--start"></span>Start</span>
        <span className="legend-item"><span className="legend-dot legend-dot--accept"></span>Accept</span>
        <span className="legend-item"><span className="legend-dot legend-dot--dead"></span>Dead</span>
        <span className="legend-item"><span className="legend-dot legend-dot--active"></span>Active</span>
      </div>
    </div>
  );
}