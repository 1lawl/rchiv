// Home: the exhibit board (2-column wall with wall labels) or the swipe deck.
// The layout choice and feed mix are saved per user.
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { PieceImage } from '@/components/piece-image';
import { Screen, TitleBar } from '@/components/screen';
import { SwipeDeck } from '@/components/swipe-deck';
import { Glass, IconButton, StatusBadge, Txt, shadow } from '@/components/ui';
import { MIXES, pieceLine, type Piece } from '@/data/mock';
import { useStore } from '@/store/app-store';
import { usePalette } from '@/theme';

export default function Home() {
  const { state, dispatch } = useStore();
  const c = usePalette();
  const [menu, setMenu] = useState(false);

  const shown = useMemo(() => {
    const list = state.pieces.filter((p) => p.status !== 'Sold');
    if (state.mix === 'brand') return list.filter((p) => p.brand);
    if (state.mix === 'aesthetic') return list.filter((p) => !p.brand);
    return list;
  }, [state.pieces, state.mix]);

  const header = (
    <TitleBar
      title="rChiv"
      right={
        <>
          <Glass style={{ flexDirection: 'row', padding: 3, borderRadius: 20 }}>
            {(['board', 'swipe'] as const).map((l) => {
              const on = state.layout === l;
              return (
                <Pressable
                  key={l}
                  onPress={() => dispatch({ type: 'setLayout', layout: l })}
                  accessibilityRole="button"
                  accessibilityLabel={l === 'board' ? 'Board layout' : 'Swipe layout'}
                  accessibilityState={{ selected: on }}
                  style={{ width: 40, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.segmentOn : 'transparent', ...(on && c.scheme === 'light' ? shadow(c.shadow, 3) : null) }}>
                  <Icon name={l} size={18} stroke={1.8} color={on ? c.text : c.textSecondary} />
                </Pressable>
              );
            })}
          </Glass>
          <IconButton label="Feed settings" onPress={() => setMenu(true)}>
            <Icon name="sliders" size={18} stroke={1.8} color={c.text} />
          </IconButton>
        </>
      }
    />
  );

  const mixLabel = MIXES.find((m) => m.id === state.mix)!.label;

  return (
    <>
      {state.layout === 'board' ? (
        <Screen header={header}>
          <Txt kind="small" muted style={{ marginHorizontal: 4, marginBottom: 14, fontSize: 13 }}>
            {state.show} · {mixLabel} · tap a piece to open it
          </Txt>
          <Board pieces={shown} />
        </Screen>
      ) : (
        <Screen header={header} scroll={false}>
          <SwipeDeck pieces={shown.filter((p) => !state.passed[p.id])} />
        </Screen>
      )}
      <FeedMenu open={menu} onClose={() => setMenu(false)} />
    </>
  );
}

/** Two columns, each piece goes to the shorter column: a gallery wall. */
function Board({ pieces }: { pieces: Piece[] }) {
  const cols: [Piece[], Piece[]] = [[], []];
  let a = 0, b = 0;
  for (const p of pieces) {
    if (a <= b) { cols[0].push(p); a += p.height + 60; } else { cols[1].push(p); b += p.height + 60; }
  }
  return (
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
      {cols.map((col, i) => (
        <View key={i} style={{ flex: 1, gap: 18 }}>
          {col.map((p) => <Tile key={p.id} piece={p} />)}
        </View>
      ))}
    </View>
  );
}

function Tile({ piece }: { piece: Piece }) {
  const c = usePalette();
  return (
    <Pressable onPress={() => router.push(`/piece/${piece.id}`)} accessibilityRole="button" accessibilityLabel={`${piece.title}, ${piece.status}`} style={({ pressed }) => ({ gap: 7, transform: [{ scale: pressed ? 0.98 : 1 }] })}>
      <View style={[{ height: piece.height, borderRadius: 20 }, shadow(c.shadow, 12)]}>
        <PieceImage piece={piece} style={{ flex: 1, borderRadius: 20 }} />
        <StatusBadge status={piece.status} style={{ position: 'absolute', left: 8, top: 8 }} />
      </View>
      <View style={{ paddingHorizontal: 4, gap: 1 }}>
        <Txt kind="label" numberOfLines={1}>{piece.title}</Txt>
        <Txt kind="small" muted numberOfLines={1}>{pieceLine(piece)}</Txt>
      </View>
    </Pressable>
  );
}

function FeedMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const Row = ({ on, label, desc, onPress }: { on: boolean; label: string; desc?: string; onPress: () => void }) => (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ checked: on }} style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}>
      <View style={{ width: 16, opacity: on ? 1 : 0 }}><Icon name="check" size={16} stroke={2.4} color={c.accent} /></View>
      <View style={{ gap: 1 }}>
        <Txt style={{ fontSize: 16 }}>{label}</Txt>
        {desc && <Txt kind="small" muted style={{ fontSize: 13 }}>{desc}</Txt>}
      </View>
    </Pressable>
  );
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close menu" />
      <Glass strong style={[styles.menu, { top: insets.top + 64 }, shadow(c.shadow, 20)]}>
        <Txt kind="small" muted style={styles.menuHead}>Show</Txt>
        {(['For you', 'Following'] as const).map((v) => (
          <Row key={v} on={state.show === v} label={v} onPress={() => { dispatch({ type: 'setShow', show: v }); onClose(); }} />
        ))}
        <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.divider, marginTop: 6 }} />
        <Txt kind="small" muted style={styles.menuHead}>Mix</Txt>
        {MIXES.map((m) => (
          <Row key={m.id} on={state.mix === m.id} label={m.label} desc={m.desc} onPress={() => { dispatch({ type: 'setMix', mix: m.id }); onClose(); }} />
        ))}
      </Glass>
    </Modal>
  );
}

const styles = StyleSheet.create({
  menu: { position: 'absolute', right: 16, width: 264, borderRadius: 20, paddingBottom: 6 },
  menuHead: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 4, fontWeight: '500' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 9 },
});
