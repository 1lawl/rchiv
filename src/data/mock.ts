// Mock data for the prototype. Nothing here talks to a server yet.
// When a real backend is added, these shapes become the API's shapes.

import type { PieceStatus } from '@/theme';

export type Piece = {
  id: string;
  title: string;
  brand?: string; // notable label; undefined = aesthetic / unbranded
  look?: string; // aesthetic tag for unbranded pieces
  status: PieceStatus;
  price?: number; // USD
  size: string;
  owner: string;
  wants: number;
  photo?: string; // local file uri (from Post) or remote url
  tone: number; // placeholder colour seed until real photos are added
  height: number; // board tile height, for the exhibit-wall rhythm
  story?: string;
  measurements?: Record<string, string>;
  createdAt: number;
};

export const ME = 'zzzombr';

const now = Date.now();
const h = 3600_000;

export const PIECES: Piece[] = [
  { id: 'p1', title: 'Painted black flares', brand: 'L.G.B.', status: 'For sale', price: 420, size: 'W30', owner: ME, wants: 18, tone: 0, height: 250, createdAt: now - 2 * h,
    story: 'Hand-painted by the previous owner. Paint is fully cured and does not crack.', measurements: { Waist: '15"', Rise: '10"', Inseam: '33"', Thigh: '11"', Knee: '9"', 'Leg opening': '12"' } },
  { id: 'p2', title: 'Patch bomber, fur hood', look: 'Y2K military', status: 'Open to offers', price: 260, size: 'M', owner: 'jun', wants: 9, tone: 1, height: 210, createdAt: now - 5 * h },
  { id: 'p3', title: 'Shredded patchwork denim', brand: 'Kapital', status: 'Not for sale', size: 'W31', owner: 'sora', wants: 41, tone: 2, height: 200, createdAt: now - 9 * h },
  { id: 'p4', title: 'Fringe distressed flares', look: 'Japanese denim', status: 'For sale', price: 180, size: 'W29', owner: 'mika', wants: 6, tone: 3, height: 270, createdAt: now - 12 * h },
  { id: 'p5', title: 'Gloss hooded puffer', brand: '14th Addiction', status: 'Trade', size: 'L', owner: 'leo', wants: 22, tone: 4, height: 240, createdAt: now - 20 * h },
  { id: 'p6', title: 'Lace-up distressed denim', look: 'Japanese denim', status: 'For sale', price: 150, size: 'W30', owner: 'rin', wants: 4, tone: 5, height: 200, createdAt: now - 26 * h },
  { id: 'p7', title: 'Whisper Words of Wisdom tee', brand: 'Number (N)ine', status: 'For sale', price: 310, size: 'S', owner: ME, wants: 27, tone: 6, height: 210, createdAt: now - 30 * h },
  { id: 'p8', title: 'Silver-wash flared denim', look: 'Japanese denim', status: 'Open to offers', price: 220, size: 'W32', owner: 'mika', wants: 11, tone: 7, height: 260, createdAt: now - 40 * h },
  { id: 'p9', title: 'Overdrive raglan sweatshirt', brand: 'Hysteric Glamour', status: 'Open to offers', price: 190, size: 'M', owner: ME, wants: 8, tone: 8, height: 230, createdAt: now - 50 * h },
  { id: 'p10', title: 'Black fringe flare denim', look: 'Japanese denim', status: 'Not for sale', size: 'W30', owner: ME, wants: 15, tone: 9, height: 250, createdAt: now - 60 * h },
  { id: 'p11', title: 'Grey panelled flares', brand: 'IfSixWasNine', status: 'Trade', size: 'W30', owner: ME, wants: 12, tone: 10, height: 240, createdAt: now - 70 * h },
  { id: 'p12', title: 'Blue straight-leg denim', look: 'Vintage denim', status: 'Sold', price: 140, size: 'W31', owner: ME, wants: 3, tone: 11, height: 220, createdAt: now - 90 * h },
];

export type Msg = { mine: boolean; text: string };
export type Deal = { kind: 'Offer' | 'Trade proposed' | 'Counter offer' | 'Accepted' | 'Question'; line: string; sub: string; actionable: boolean };
export type Thread = { id: string; who: string; group: 'offer' | 'trade' | 'message'; unread: boolean; time: string; pieceId: string; preview: string; deal: Deal; msgs: Msg[]; done?: string };

export const THREADS: Thread[] = [
  { id: 'mika', who: 'mika', group: 'offer', unread: true, time: '2m', pieceId: 'p1', preview: 'Would you take $380 for the painted flares?',
    deal: { kind: 'Offer', line: '$380', sub: 'Painted black flares · expires in 46h', actionable: true },
    msgs: [{ mine: false, text: 'Love these. Would you take $380 for the painted flares?' }, { mine: false, text: 'Can pay today if yes.' }] },
  { id: 'jun', who: 'jun', group: 'trade', unread: true, time: '18m', pieceId: 'p11', preview: 'My patch bomber for your grey flares?',
    deal: { kind: 'Trade proposed', line: 'Their patch bomber for your grey flares', sub: 'No cash added · expires in 70h', actionable: true },
    msgs: [{ mine: false, text: 'Those panelled flares are the best thing on here.' }, { mine: false, text: 'My patch bomber for your grey flares? Same size.' }] },
  { id: 'sora', who: 'sora', group: 'offer', unread: false, time: '1h', pieceId: 'p9', preview: 'Countered at $170. Ships tomorrow if yes.',
    deal: { kind: 'Counter offer', line: '$170', sub: 'You asked $190 · expires in 22h', actionable: true },
    msgs: [{ mine: false, text: 'Would you do $150?' }, { mine: true, text: 'Countered at $170. Ships tomorrow if yes.' }] },
  { id: 'leo', who: 'leo', group: 'offer', unread: false, time: 'Yesterday', pieceId: 'p7', preview: 'Paid. Can you send tracking when it ships?',
    deal: { kind: 'Accepted', line: '$310', sub: 'Whisper Words of Wisdom tee', actionable: false }, done: 'Paid. rChiv holds the money until the piece arrives.',
    msgs: [{ mine: false, text: 'Paid. Can you send tracking when it ships?' }, { mine: true, text: 'Shipping tomorrow morning.' }] },
  { id: 'rin', who: 'rin', group: 'message', unread: false, time: 'Mon', pieceId: 'p7', preview: 'Is the tee true to size?',
    deal: { kind: 'Question', line: '$310', sub: 'Whisper Words of Wisdom tee', actionable: false },
    msgs: [{ mine: false, text: 'Is the tee true to size? I usually wear a small.' }] },
];

export type Instant = { id: string; who: string; time: string; pieceId: string; insetPieceId: string; caption: string };

export const INSTANTS: Instant[] = [
  { id: 'i1', who: 'mika', time: '12m', pieceId: 'p8', insetPieceId: 'p4', caption: 'fit check before the flea' },
  { id: 'i2', who: 'jun', time: '40m', pieceId: 'p2', insetPieceId: 'p5', caption: 'finally came in the mail' },
  { id: 'i3', who: 'sora', time: '2h', pieceId: 'p3', insetPieceId: 'p6', caption: 'still not selling this' },
  { id: 'i4', who: 'leo', time: '5h', pieceId: 'p5', insetPieceId: 'p9', caption: 'rain test' },
];

export type SavedSearch = { id: string; name: string; criteria: string; fresh: number; alerts: boolean };

export const SEARCHES: SavedSearch[] = [
  { id: 's1', name: 'Flared denim', criteria: 'W30 to 32 · flare · under $300', fresh: 2, alerts: true },
  { id: 's2', name: 'IfSixWasNine', criteria: 'Any size · any status', fresh: 0, alerts: true },
  { id: 's3', name: 'Fur-hood outerwear', criteria: 'Size M · unbranded is fine', fresh: 1, alerts: false },
];

export const MIXES = [
  { id: 'brand', label: 'Brand', desc: 'Notable labels only' },
  { id: 'mix', label: 'Mix', desc: 'Labels and look-alikes together' },
  { id: 'aesthetic', label: 'Aesthetic', desc: 'Unbranded pieces that fit the look' },
] as const;

export type MixMode = (typeof MIXES)[number]['id'];

export function money(n?: number) {
  return n == null ? '' : '$' + n.toLocaleString('en-US');
}

/** Second line under a piece: label or look, then price/status. */
export function pieceLine(p: Piece) {
  const left = p.brand ?? p.look ?? 'Unbranded';
  const right =
    p.status === 'Not for sale' ? `${p.wants} want` : p.status === 'Trade' ? 'Trade' : p.status === 'Sold' ? 'Sold' : money(p.price);
  return `${left} · ${right}`;
}
