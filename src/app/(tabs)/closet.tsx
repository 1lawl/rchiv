// Closet: your profile and every piece you own, sorted by status.
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { PieceImage } from '@/components/piece-image';
import { Screen } from '@/components/screen';
import { Avatar, Glass, Segmented, StatusDot, Txt } from '@/components/ui';
import { ME } from '@/data/mock';
import { useStore } from '@/store/app-store';
import type { PieceStatus } from '@/theme';

type Filter = 'All' | 'For Sale' | 'Trade' | 'Not for Sale';
const GROUP: Record<PieceStatus, Filter | 'Sold'> = { 'For sale': 'For Sale', 'Open to offers': 'For Sale', Trade: 'Trade', 'Not for sale': 'Not for Sale', Sold: 'Sold' };
const LEGEND: Record<Filter, string> = {
  All: 'Solid dot: for sale. Blue dot: open to offers. Ring: up for trade. No dot: not for sale. Faded: sold.',
  'For Sale': 'Pieces for sale or open to offers.',
  Trade: 'Pieces you would trade.',
  'Not for Sale': 'Flex only. People can still want these or leave a standing offer.',
};

export default function Closet() {
  const { state } = useStore();
  const [filter, setFilter] = useState<Filter>('All');
  const mine = state.pieces.filter((p) => p.owner === ME);
  const shown = mine.filter((p) => filter === 'All' || GROUP[p.status] === filter);
  const wants = mine.reduce((n, p) => n + p.wants, 0);

  return (
    <Screen>
      <View style={{ alignItems: 'center', gap: 8, marginTop: 8 }}>
        <Avatar name={ME} size={84} />
        <Txt kind="title" style={{ fontSize: 24 }}>@{ME}</Txt>
        <Txt muted style={{ textAlign: 'center' }}>Japanese archive denim and Y2K outerwear.</Txt>
      </View>

      <Glass style={{ borderRadius: 20, flexDirection: 'row', marginTop: 16, paddingVertical: 14 }}>
        {[[String(mine.length), 'pieces'], [String(wants), 'wants'], ['12', 'sales'], ['4.9', 'rating']].map(([n, l]) => (
          <View key={l} style={{ flex: 1, alignItems: 'center' }}>
            <Txt kind="heading">{n}</Txt>
            <Txt kind="small" muted>{l}</Txt>
          </View>
        ))}
      </Glass>

      <Segmented options={(['All', 'For Sale', 'Trade', 'Not for Sale'] as const).map((f) => ({ id: f, label: f }))} value={filter} onChange={setFilter} style={{ marginTop: 16 }} />
      <Txt kind="small" muted style={{ marginHorizontal: 4, marginTop: 10, marginBottom: 12, lineHeight: 17 }}>{LEGEND[filter]}</Txt>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {shown.map((p) => (
          <Pressable key={p.id} onPress={() => router.push(`/piece/${p.id}`)} accessibilityRole="button" accessibilityLabel={`${p.title}, ${p.status}`} style={{ width: '32%', aspectRatio: 0.8, opacity: p.status === 'Sold' ? 0.4 : 1 }}>
            <PieceImage piece={p} glyph={false} style={{ flex: 1, borderRadius: 14 }} />
            {p.status !== 'Sold' && p.status !== 'Not for sale' && (
              <View style={{ position: 'absolute', right: 8, top: 8, padding: 2, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.7)' }}>
                <StatusDot status={p.status} size={8} />
              </View>
            )}
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
