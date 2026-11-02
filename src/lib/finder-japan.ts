// Finder Japan client. Talks to the small Python service in /server (built from jpbot).
// If the service isn't running or reachable, it falls back to sample results so the
// prototype still demos well. The screen tells you which one you're looking at.

export type JapanListing = {
  id: string;
  brand: string;
  title: string; // original Japanese title
  price_jpy: number;
  market: 'Mercari' | 'Yahoo Auctions' | 'Rakuma' | 'Secondhand store';
  url: string;
  image?: string;
  created: number; // unix seconds
  doubtful: boolean; // flagged by the real-vs-fake brand filter
  reason?: string; // why it was flagged, e.g. "Style reference (風)"
};

export type JapanBrand = { name: string; jp: string[]; aliases: string[] };

export type JapanResult = { source: 'live' | 'sample'; fetchedAt: number; listings: JapanListing[]; error?: string };

export const FINDER_URL = process.env.EXPO_PUBLIC_FINDER_URL ?? '';

async function getJSON<T>(path: string, timeoutMs = 12000): Promise<T> {
  if (!FINDER_URL) throw new Error('No Finder service set (EXPO_PUBLIC_FINDER_URL)');
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const r = await fetch(FINDER_URL.replace(/\/$/, '') + path, { signal: ctl.signal });
    if (!r.ok) throw new Error(`Finder service said ${r.status}`);
    return (await r.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export async function searchJapan(brands: string[]): Promise<JapanResult> {
  try {
    const q = encodeURIComponent(brands.join(','));
    const data = await getJSON<{ listings: JapanListing[]; fetched_at: number }>(`/search?brands=${q}`, 30000);
    return { source: 'live', fetchedAt: data.fetched_at * 1000, listings: data.listings };
  } catch (e) {
    return { source: 'sample', fetchedAt: Date.now(), listings: SAMPLE.filter((l) => brands.includes(l.brand)), error: (e as Error).message };
  }
}

export async function listBrands(): Promise<JapanBrand[]> {
  try {
    return (await getJSON<{ brands: JapanBrand[] }>('/brands')).brands;
  } catch {
    return SAMPLE_BRANDS;
  }
}

export function yen(n: number) {
  return '¥' + n.toLocaleString('en-US');
}

/** Rough USD for display only. */
export function yenToUsd(n: number) {
  return '≈ $' + Math.round(n / 150).toLocaleString('en-US');
}

export function ago(unixSeconds: number) {
  const m = Math.max(1, Math.round((Date.now() / 1000 - unixSeconds) / 60));
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
}

/** Proxy services that buy on your behalf. rChiv never buys for you. */
export function proxyLinks(l: JapanListing) {
  return [
    { name: 'Buyee', url: `https://buyee.jp/mercari/search?keyword=${encodeURIComponent(l.title)}` },
    { name: 'ZenMarket', url: `https://zenmarket.jp/en/search.aspx?q=${encodeURIComponent(l.title)}` },
    { name: 'Open original', url: l.url },
  ];
}

// ---- Sample data (used when the service isn't reachable) ----------------------

const now = Math.floor(Date.now() / 1000);

export const SAMPLE_BRANDS: JapanBrand[] = [
  { name: 'IfSixWasNine', jp: ['イフシックスワズナイン'], aliases: ['IFSIXWASNINE', 'if six was nine'] },
  { name: '14th Addiction', jp: ['フォーティーンスアディクション'], aliases: ['14TH ADDICTION'] },
  { name: 'L.G.B.', jp: ['ルグランブルー'], aliases: ['LGB', 'Le Grande Bleu'] },
  { name: 'Kapital', jp: ['キャピタル'], aliases: ['KAPITAL'] },
  { name: 'Number (N)ine', jp: ['ナンバーナイン'], aliases: ['NUMBER NINE', 'number nine'] },
  { name: 'Hysteric Glamour', jp: ['ヒステリックグラマー'], aliases: ['HYSTERIC GLAMOUR'] },
  { name: 'Undercover', jp: ['アンダーカバー'], aliases: ['UNDERCOVER'] },
  { name: 'Kmrii', jp: ['ケムリ'], aliases: ['KMRII'] },
];

export const SAMPLE: JapanListing[] = [
  { id: 'm1', brand: 'IfSixWasNine', title: 'IFSIXWASNINE フレアデニム 2', price_jpy: 38000, market: 'Mercari', url: 'https://jp.mercari.com/', created: now - 600, doubtful: false },
  { id: 'y1', brand: '14th Addiction', title: '14th Addiction ボンバージャケット ファー', price_jpy: 52000, market: 'Yahoo Auctions', url: 'https://auctions.yahoo.co.jp/', created: now - 2400, doubtful: false },
  { id: 'r1', brand: 'L.G.B.', title: 'L.G.B. ペイントデニム ルグランブルー', price_jpy: 29800, market: 'Rakuma', url: 'https://fril.jp/', created: now - 5400, doubtful: false },
  { id: 's1', brand: 'Kapital', title: 'KAPITAL パッチワークデニム', price_jpy: 24000, market: 'Secondhand store', url: 'https://www.2ndstreet.jp/', created: now - 9000, doubtful: false },
  { id: 'm2', brand: 'IfSixWasNine', title: 'イフシックスワズナイン レザーパンツ', price_jpy: 61000, market: 'Mercari', url: 'https://jp.mercari.com/', created: now - 12000, doubtful: false },
  { id: 'm3', brand: 'Number (N)ine', title: 'NUMBER (N)INE 05AW ニット', price_jpy: 33000, market: 'Mercari', url: 'https://jp.mercari.com/', created: now - 15000, doubtful: false },
  { id: 'd1', brand: 'IfSixWasNine', title: 'IFSIXWASNINE風 フレアパンツ', price_jpy: 4800, market: 'Mercari', url: 'https://jp.mercari.com/', created: now - 1800, doubtful: true, reason: 'Style reference (風)' },
  { id: 'd2', brand: '14th Addiction', title: '14th Addiction好きな方に ジャケット', price_jpy: 6500, market: 'Mercari', url: 'https://jp.mercari.com/', created: now - 3600, doubtful: true, reason: 'For fans of (好きな方)' },
  { id: 'd3', brand: 'Kapital', title: 'キャピタル系 デニム', price_jpy: 3900, market: 'Rakuma', url: 'https://fril.jp/', created: now - 7200, doubtful: true, reason: 'Style reference (系)' },
];
