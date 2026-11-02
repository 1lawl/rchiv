// rChiv design tokens, taken straight from the approved UI drafts.
// Light glass is the default; dark mode (muted cool greys) follows the phone setting.

export type Palette = {
  scheme: 'light' | 'dark';
  bg: [string, string, string]; // top → bottom background gradient
  orbs: [string, string, string]; // peach, pink, blue soft light blobs
  text: string;
  textSecondary: string;
  glass: string; // frosted chip / card fill
  glassEdge: string; // frosted chip border
  glassStrong: string; // menus and sheets
  card: string; // solid-ish surface for lists
  divider: string;
  accent: string; // links, checkmarks, active tags
  navPill: string; // the floating tab bar
  navEdge: string;
  unread: string;
  segmentOn: string; // selected segment background
  ink: string; // primary button fill
  inkText: string;
  status: Record<PieceStatus, { dot: string; ring?: string }>;
  shadow: string;
  bubbleMine: [string, string];
  bubbleTheirs: string;
  blurTint: 'light' | 'dark';
};

export type PieceStatus = 'For sale' | 'Open to offers' | 'Trade' | 'Not for sale' | 'Sold';

export const light: Palette = {
  scheme: 'light',
  bg: ['#F8F9FB', '#F1F3F7', '#ECEFF5'],
  orbs: ['rgba(255,206,188,0.6)', 'rgba(232,192,220,0.55)', 'rgba(176,204,246,0.75)'],
  text: '#1B1D22',
  textSecondary: '#5F636B',
  glass: 'rgba(255,255,255,0.7)',
  glassEdge: 'rgba(255,255,255,0.9)',
  glassStrong: 'rgba(248,249,251,0.94)',
  card: 'rgba(255,255,255,0.62)',
  divider: 'rgba(60,64,72,0.12)',
  accent: '#3F6DB5',
  navPill: 'rgba(28,30,36,0.78)',
  navEdge: 'rgba(255,255,255,0.22)',
  unread: '#F2A7BE',
  segmentOn: '#FFFFFF',
  ink: '#1B1D22',
  inkText: '#FFFFFF',
  status: {
    'For sale': { dot: '#1B1D22' },
    'Open to offers': { dot: '#6F97D6' },
    Trade: { dot: 'transparent', ring: '#1B1D22' },
    'Not for sale': { dot: '#A9ADB5' },
    Sold: { dot: 'transparent' },
  },
  shadow: 'rgba(110,120,150,0.18)',
  bubbleMine: ['rgba(196,218,250,0.95)', 'rgba(234,206,234,0.95)'],
  bubbleTheirs: 'rgba(255,255,255,0.88)',
  blurTint: 'light',
};

export const dark: Palette = {
  scheme: 'dark',
  bg: ['#131418', '#0E0F12', '#0D0F13'],
  orbs: ['rgba(214,150,120,0.16)', 'rgba(200,130,160,0.12)', 'rgba(120,150,205,0.16)'],
  text: '#F1F2F4',
  textSecondary: '#989CA5',
  glass: 'rgba(60,63,70,0.62)',
  glassEdge: 'rgba(255,255,255,0.08)',
  glassStrong: 'rgba(28,30,34,0.95)',
  card: 'rgba(40,42,48,0.6)',
  divider: 'rgba(255,255,255,0.08)',
  accent: '#8FA2B5',
  navPill: 'rgba(46,48,54,0.8)',
  navEdge: 'rgba(255,255,255,0.12)',
  unread: '#D48FA3',
  segmentOn: 'rgba(255,255,255,0.16)',
  ink: '#F1F2F4',
  inkText: '#131418',
  status: {
    'For sale': { dot: '#E6E9EF' },
    'Open to offers': { dot: '#8FA2B5' },
    Trade: { dot: 'transparent', ring: '#E6E9EF' },
    'Not for sale': { dot: '#545862' },
    Sold: { dot: 'transparent' },
  },
  shadow: 'rgba(0,0,0,0.4)',
  bubbleMine: ['rgba(70,90,125,0.9)', 'rgba(105,80,110,0.9)'],
  bubbleTheirs: 'rgba(52,55,62,0.9)',
  blurTint: 'dark',
};

// "Smooth but fast" — the owner's motion brief.
export const motion = { fast: 220 };

export const radius = { chip: 12, card: 20, sheet: 28, pill: 32 };

export const type = {
  logo: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -1.1 },
  title: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.8 },
  heading: { fontSize: 17, fontWeight: '600' as const, letterSpacing: -0.2 },
  body: { fontSize: 15, fontWeight: '400' as const },
  label: { fontSize: 14, fontWeight: '600' as const, letterSpacing: -0.1 },
  small: { fontSize: 12, fontWeight: '400' as const },
  tiny: { fontSize: 11, fontWeight: '500' as const },
};
