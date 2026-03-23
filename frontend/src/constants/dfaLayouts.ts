// DFA state positions and metadata for each format's DFA graph visualization

export interface DFANode {
  id: number;
  label: string;
  x: number;
  y: number;
  isAccept: boolean;
  isStart: boolean;
  isDead: boolean;
}

export interface DFAEdge {
  from: number;
  to: number;
  label: string;
}

export interface DFALayout {
  nodes: DFANode[];
  edges: DFAEdge[];
}

function node(id: number, label: string, x: number, y: number, opts: { accept?: boolean; start?: boolean; dead?: boolean } = {}): DFANode {
  return { id, label, x, y, isAccept: !!opts.accept, isStart: !!opts.start, isDead: !!opts.dead };
}

const EMAIL_LAYOUT: DFALayout = {
  nodes: [
    node(0, 'Start', 60, 200, { start: true }),
    node(1, 'Local', 200, 200),
    node(2, '@', 340, 200),
    node(3, 'Domain', 480, 200),
    node(4, '.', 620, 200),
    node(5, 'TLD', 760, 200, { accept: true }),
    node(6, 'Dead', 400, 60, { dead: true }),
  ],
  edges: [
    { from: 0, to: 1, label: 'a-z,0-9' },
    { from: 1, to: 1, label: 'a-z,._' },
    { from: 1, to: 2, label: '@' },
    { from: 2, to: 3, label: 'a-z' },
    { from: 3, to: 3, label: 'a-z,-' },
    { from: 3, to: 4, label: '.' },
    { from: 4, to: 5, label: 'a-z' },
    { from: 5, to: 5, label: 'a-z' },
    { from: 5, to: 4, label: '.' },
  ],
};

const IPV4_LAYOUT: DFALayout = {
  nodes: [
    node(0, 'Start', 40, 150, { start: true }),
    node(1, 'Oct1', 150, 150),
    node(2, '.', 260, 150),
    node(3, 'Oct2', 370, 150),
    node(4, '.', 480, 150),
    node(5, 'Oct3', 590, 150),
    node(6, '.', 700, 150),
    node(7, 'Oct4', 810, 150, { accept: true }),
    node(8, 'Dead', 420, 30, { dead: true }),
  ],
  edges: [
    { from: 0, to: 1, label: '0-9' },
    { from: 1, to: 1, label: '0-9' },
    { from: 1, to: 2, label: '.' },
    { from: 2, to: 3, label: '0-9' },
    { from: 3, to: 3, label: '0-9' },
    { from: 3, to: 4, label: '.' },
    { from: 4, to: 5, label: '0-9' },
    { from: 5, to: 5, label: '0-9' },
    { from: 5, to: 6, label: '.' },
    { from: 6, to: 7, label: '0-9' },
    { from: 7, to: 7, label: '0-9' },
  ],
};

const DATE_LAYOUT: DFALayout = {
  nodes: [
    node(0, 'Start', 30, 150, { start: true }),
    node(1, 'D1', 110, 150),
    node(2, 'D2', 190, 150),
    node(3, '/', 270, 150),
    node(4, 'M1', 350, 150),
    node(5, 'M2', 430, 150),
    node(6, '/', 510, 150),
    node(7, 'Y1', 590, 150),
    node(8, 'Y2', 670, 150),
    node(9, 'Y3', 750, 150),
    node(10, 'Y4', 830, 150, { accept: true }),
    node(11, 'Dead', 430, 30, { dead: true }),
  ],
  edges: [
    { from: 0, to: 1, label: '0-3' },
    { from: 1, to: 2, label: '0-9' },
    { from: 2, to: 3, label: '/' },
    { from: 3, to: 4, label: '0-1' },
    { from: 4, to: 5, label: '0-9' },
    { from: 5, to: 6, label: '/' },
    { from: 6, to: 7, label: '1-9' },
    { from: 7, to: 8, label: '0-9' },
    { from: 8, to: 9, label: '0-9' },
    { from: 9, to: 10, label: '0-9' },
  ],
};

const BINARY_LAYOUT: DFALayout = {
  nodes: [
    node(0, 'Start', 80, 200, { start: true }),
    node(1, '0', 250, 200, { accept: true }),
    node(2, '0b', 420, 120),
    node(3, 'Bits', 590, 200, { accept: true }),
    node(4, 'Dead', 340, 40, { dead: true }),
  ],
  edges: [
    { from: 0, to: 1, label: '0' },
    { from: 0, to: 3, label: '1' },
    { from: 1, to: 1, label: '0' },
    { from: 1, to: 3, label: '1' },
    { from: 1, to: 2, label: 'b/B' },
    { from: 2, to: 3, label: '0,1' },
    { from: 3, to: 3, label: '0,1' },
  ],
};

const HEX_LAYOUT: DFALayout = {
  nodes: [
    node(0, 'Start', 80, 150, { start: true }),
    node(1, '0', 250, 150),
    node(2, '0x', 420, 150),
    node(3, 'Hex', 590, 150, { accept: true }),
    node(4, 'Dead', 340, 30, { dead: true }),
  ],
  edges: [
    { from: 0, to: 1, label: '0' },
    { from: 1, to: 2, label: 'x/X' },
    { from: 2, to: 3, label: '0-9,a-f' },
    { from: 3, to: 3, label: '0-9,a-f' },
  ],
};

const NAME_LAYOUT: DFALayout = {
  nodes: [
    node(0, 'Start', 80, 150, { start: true }),
    node(1, 'Word', 300, 150, { accept: true }),
    node(2, 'Sep', 520, 150),
    node(3, 'Dead', 300, 30, { dead: true }),
  ],
  edges: [
    { from: 0, to: 1, label: 'A-Z' },
    { from: 1, to: 1, label: 'a-z,A-Z' },
    { from: 1, to: 2, label: 'space/-' },
    { from: 2, to: 1, label: 'A-Z' },
  ],
};

const PHONE_LAYOUT: DFALayout = {
  nodes: [
    node(0, 'Start', 60, 150, { start: true }),
    node(1, '+', 220, 80),
    node(2, 'Digits', 420, 150, { accept: true }),
    node(3, 'Sep', 620, 150, { accept: true }),
    node(4, 'Dead', 420, 30, { dead: true }),
  ],
  edges: [
    { from: 0, to: 1, label: '+' },
    { from: 0, to: 2, label: '0-9' },
    { from: 1, to: 2, label: '0-9' },
    { from: 2, to: 2, label: '0-9' },
    { from: 2, to: 3, label: 'space/-' },
    { from: 3, to: 2, label: '0-9' },
  ],
};

export const DFA_LAYOUTS: Record<string, DFALayout> = {
  email: EMAIL_LAYOUT,
  ipv4: IPV4_LAYOUT,
  date: DATE_LAYOUT,
  binary: BINARY_LAYOUT,
  hex: HEX_LAYOUT,
  name: NAME_LAYOUT,
  phone: PHONE_LAYOUT,
};