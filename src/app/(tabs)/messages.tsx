// Messages: Instants (quick BeReal-style photo shares) on top, then offer,
// trade and question threads.
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Icon } from '@/components/icon';
import { PieceImage } from '@/components/piece-image';
import { Screen, TitleBar } from '@/components/screen';
import { Avatar, Divider, Glass, IconButton, Segmented, Txt } from '@/components/ui';
import { INSTANTS } from '@/data/mock';
import { useStore } from '@/store/app-store';
import { usePalette } from '@/theme';

type Filter = 'All' | 'Offers' | 'Trades';

export default function Messages() {
  const { state } = useStore();
  const c = usePalette();
  const [filter, setFilter] = useState<Filter>('All');
  const group = { All: null, Offers: 'offer', Trades: 'trade' }[filter];
  const threads = state.threads.filter((t) => !group || t.group === group);

  return (
    <Screen
      header={
        <TitleBar
          title="Messages"
          right={<IconButton label="Share an instant" onPress={() => router.push('/post?mode=instant')}><Icon name="camera" size={20} color={c.text} /></IconButton>}
        />
      }>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingHorizontal: 4, paddingVertical: 6 }} style={{ marginHorizontal: -16, paddingLeft: 12 }}>
        <Pressable onPress={() => router.push('/post?mode=instant')} accessibilityRole="button" accessibilityLabel="Add your instant" style={{ alignItems: 'center', gap: 6 }}>
          <Glass style={{ width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="plus" color={c.text} />
          </Glass>
          <Txt kind="tiny" muted>You</Txt>
        </Pressable>
        {INSTANTS.map((n) => {
          const seen = !!state.seenInstants[n.id];
          const piece = state.pieces.find((p) => p.id === n.pieceId)!;
          return (
            <Pressable key={n.id} onPress={() => router.push(`/instant/${n.id}`)} accessibilityRole="button" accessibilityLabel={`${n.who}'s instant, ${n.time}${seen ? ', seen' : ', new'}`} style={{ alignItems: 'center', gap: 6 }}>
              <LinearGradient
                colors={seen ? [c.glassEdge, c.glassEdge] : ['#FFB59A', '#EBA3C6', '#8DB4EE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ width: 68, height: 68, borderRadius: 34, padding: 2.5 }}>
                <View style={{ flex: 1, borderRadius: 32, padding: 2, backgroundColor: c.bg[0] }}>
                  <PieceImage piece={piece} glyph={false} style={{ flex: 1, borderRadius: 30 }} />
                </View>
              </LinearGradient>
              <Txt kind="tiny" muted={seen}>{n.who}</Txt>
            </Pressable>
          );
        })}
      </ScrollView>

      <Segmented options={(['All', 'Offers', 'Trades'] as const).map((f) => ({ id: f, label: f }))} value={filter} onChange={setFilter} style={{ marginTop: 16, marginBottom: 12 }} />

      <Glass style={{ borderRadius: 20 }}>
        {threads.map((t, k) => {
          const piece = state.pieces.find((p) => p.id === t.pieceId);
          const live = t.deal.actionable;
          return (
            <View key={t.id}>
              {k > 0 && <Divider />}
              <Pressable onPress={() => router.push(`/chat/${t.id}`)} accessibilityRole="button" style={({ pressed }) => ({ flexDirection: 'row', gap: 12, padding: 14, alignItems: 'center', opacity: pressed ? 0.7 : 1 })}>
                <Avatar name={t.who} size={44} />
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Txt kind="label" style={{ flex: 1 }}>{t.who}</Txt>
                    <Txt kind="small" muted>{t.time}</Txt>
                    {t.unread && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.unread }} />}
                  </View>
                  <Txt kind="small" color={live ? c.accent : c.textSecondary} style={{ fontWeight: '600' }}>{t.deal.kind === 'Offer' || t.deal.kind === 'Counter offer' ? `${t.deal.kind} · ${t.deal.line}` : t.deal.kind}</Txt>
                  <Txt kind="small" muted numberOfLines={1} style={{ fontSize: 13 }}>{t.preview}</Txt>
                </View>
                {piece && <PieceImage piece={piece} glyph={false} style={{ width: 44, height: 44, borderRadius: 10 }} />}
              </Pressable>
            </View>
          );
        })}
        {threads.length === 0 && <Txt muted style={{ padding: 20, textAlign: 'center' }}>Nothing here yet</Txt>}
      </Glass>
    </Screen>
  );
}
