// One small shared store for the whole prototype (React context + reducer).
// It holds the feed settings, your wants, the pieces you post, and chat state.
// Feed settings and posted pieces are saved on the phone so they survive a restart.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';

import { INSTANTS, PIECES, SEARCHES, THREADS, type MixMode, type Piece, type SavedSearch, type Thread } from '@/data/mock';

export type Layout = 'board' | 'swipe';

type State = {
  layout: Layout;
  mix: MixMode;
  show: 'For you' | 'Following';
  pieces: Piece[];
  wants: Record<string, boolean>;
  passed: Record<string, boolean>;
  threads: Thread[];
  seenInstants: Record<string, boolean>;
  searches: SavedSearch[];
  japanBrands: string[];
  hydrated: boolean;
};

type Action =
  | { type: 'hydrate'; data: Partial<State> }
  | { type: 'setLayout'; layout: Layout }
  | { type: 'setMix'; mix: MixMode }
  | { type: 'setShow'; show: State['show'] }
  | { type: 'toggleWant'; id: string }
  | { type: 'pass'; id: string }
  | { type: 'post'; piece: Piece }
  | { type: 'openThread'; id: string }
  | { type: 'sendMessage'; threadId: string; text: string }
  | { type: 'acceptDeal'; threadId: string }
  | { type: 'startDeal'; piece: Piece; kind: 'offer' | 'trade'; line: string; sub: string; text: string }
  | { type: 'seeInstant'; id: string }
  | { type: 'toggleAlerts'; id: string }
  | { type: 'toggleJapanBrand'; brand: string };

const initial: State = {
  layout: 'board',
  mix: 'mix',
  show: 'For you',
  pieces: PIECES,
  wants: {},
  passed: {},
  threads: THREADS,
  seenInstants: { [INSTANTS[3].id]: true },
  searches: SEARCHES,
  japanBrands: ['IfSixWasNine', '14th Addiction', 'L.G.B.', 'Kapital'],
  hydrated: false,
};

const ACCEPTED_LINE = {
  offer: 'Accepted. They pay now, and rChiv holds the money until the piece arrives.',
  trade: 'Accepted. You both ship with tracking, and nothing is final until both packages arrive.',
};

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'hydrate':
      return { ...s, ...a.data, hydrated: true };
    case 'setLayout':
      return { ...s, layout: a.layout };
    case 'setMix':
      return { ...s, mix: a.mix };
    case 'setShow':
      return { ...s, show: a.show };
    case 'toggleWant': {
      const on = !s.wants[a.id];
      return {
        ...s,
        wants: { ...s.wants, [a.id]: on },
        pieces: s.pieces.map((p) => (p.id === a.id ? { ...p, wants: p.wants + (on ? 1 : -1) } : p)),
      };
    }
    case 'pass':
      return { ...s, passed: { ...s.passed, [a.id]: true } };
    case 'post':
      return { ...s, pieces: [a.piece, ...s.pieces] };
    case 'openThread':
      return { ...s, threads: s.threads.map((t) => (t.id === a.id ? { ...t, unread: false } : t)) };
    case 'sendMessage':
      return {
        ...s,
        threads: s.threads.map((t) =>
          t.id === a.threadId ? { ...t, msgs: [...t.msgs, { mine: true, text: a.text }], preview: a.text, time: 'now' } : t,
        ),
      };
    case 'acceptDeal':
      return {
        ...s,
        threads: s.threads.map((t) =>
          t.id === a.threadId
            ? { ...t, deal: { ...t.deal, kind: 'Accepted', actionable: false }, done: ACCEPTED_LINE[t.group === 'trade' ? 'trade' : 'offer'] }
            : t,
        ),
      };
    case 'startDeal': {
      const id = `${a.piece.owner}-${a.piece.id}`;
      const existing = s.threads.find((t) => t.id === id);
      const thread: Thread = {
        id,
        who: a.piece.owner,
        group: a.kind,
        unread: false,
        time: 'now',
        pieceId: a.piece.id,
        preview: a.text,
        deal: { kind: a.kind === 'offer' ? 'Offer' : 'Trade proposed', line: a.line, sub: a.sub, actionable: false },
        msgs: [...(existing?.msgs ?? []), { mine: true, text: a.text }],
      };
      return { ...s, threads: [thread, ...s.threads.filter((t) => t.id !== id)] };
    }
    case 'seeInstant':
      return { ...s, seenInstants: { ...s.seenInstants, [a.id]: true } };
    case 'toggleAlerts':
      return { ...s, searches: s.searches.map((q) => (q.id === a.id ? { ...q, alerts: !q.alerts } : q)) };
    case 'toggleJapanBrand': {
      const has = s.japanBrands.includes(a.brand);
      return { ...s, japanBrands: has ? s.japanBrands.filter((b) => b !== a.brand) : [...s.japanBrands, a.brand] };
    }
  }
}

const Ctx = createContext<{ state: State; dispatch: (a: Action) => void } | null>(null);
const KEY = 'rchiv.v1';

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  // Load saved settings once.
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        const saved = raw ? JSON.parse(raw) : {};
        const posted: Piece[] = saved.posted ?? [];
        dispatch({
          type: 'hydrate',
          data: {
            layout: saved.layout ?? initial.layout,
            mix: saved.mix ?? initial.mix,
            show: saved.show ?? initial.show,
            wants: saved.wants ?? {},
            japanBrands: saved.japanBrands ?? initial.japanBrands,
            pieces: [...posted, ...PIECES],
          },
        });
      })
      .catch(() => dispatch({ type: 'hydrate', data: {} }));
  }, []);

  // Save whenever the parts we keep change.
  useEffect(() => {
    if (!state.hydrated) return;
    const posted = state.pieces.filter((p) => p.id.startsWith('mine-'));
    AsyncStorage.setItem(
      KEY,
      JSON.stringify({ layout: state.layout, mix: state.mix, show: state.show, wants: state.wants, japanBrands: state.japanBrands, posted }),
    ).catch(() => {});
  }, [state.hydrated, state.layout, state.mix, state.show, state.wants, state.japanBrands, state.pieces]);

  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used inside AppStoreProvider');
  return v;
}

export function usePiece(id?: string) {
  const { state } = useStore();
  return state.pieces.find((p) => p.id === id);
}
