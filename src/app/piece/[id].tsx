// A single piece: big photo, detail slots (back, tag, label, flaws), story,
// measurements, wants, and the offer / trade / message actions.
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { PieceImage } from '@/components/piece-image';
import { Avatar, Backdrop, Divider, Glass, IconButton, PrimaryButton, SecondaryButton, StatusBadge, Txt } from '@/components/ui';
import { ME, money } from '@/data/mock';
import { usePiece, useStore } from '@/store/app-store';
import { usePalette } from '@/theme';

const SLOTS = ['Back', 'Tag', 'Label', 'Flaws'];

export default function PieceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const piece = usePiece(id);
  const { state, dispatch } = useStore();
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const [measure, setMeasure] = useState(true);

  if (!piece) return <Backdrop><Txt style={{ margin: 80 }}>Piece not found</Txt></Backdrop>;
  const wanted = !!state.wants[piece.id];
  const mine = piece.owner === ME;
  const canBuy = piece.status === 'For sale' || piece.status === 'Open to offers';

  return (
    <View style={{ flex: 1 }}>
      <Backdrop />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 120 }} showsVerticalScrollIndicator={false}>
        <PieceImage piece={piece} style={{ height: 520, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }} />
        <View style={{ paddingHorizontal: 16, gap: 16, marginTop: 14 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {SLOTS.map((s, k) => (
              <View key={s} style={{ gap: 4, alignItems: 'center' }}>
                <PieceImage piece={{ ...piece, tone: piece.tone + k + 1 }} glyph={false} style={{ width: 72, height: 72, borderRadius: 14 }} />
                <Txt kind="tiny" muted>{s}</Txt>
              </View>
            ))}
          </ScrollView>

          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <StatusBadge status={piece.status} />
              <Txt kind="small" muted>{piece.brand ? 'Notable label' : 'Aesthetic'}</Txt>
            </View>
            <Txt kind="title" style={{ fontSize: 26 }}>{piece.title}</Txt>
            <Txt muted>{[piece.brand ?? piece.look, piece.size].filter(Boolean).join(' · ')}</Txt>
            {piece.price != null && piece.status !== 'Not for sale' && <Txt kind="heading" style={{ fontSize: 20, marginTop: 4 }}>{money(piece.price)}</Txt>}
          </View>

          <Pressable onPress={() => dispatch({ type: 'toggleWant', id: piece.id })} accessibilityRole="button" accessibilityState={{ selected: wanted }}>
            <Glass style={{ borderRadius: 20, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Icon name="heart" size={20} color={wanted ? c.unread : c.text} fill={wanted ? c.unread : 'none'} />
              <Txt style={{ flex: 1 }}>{wanted ? `You and ${piece.wants - 1} others want this` : `${piece.wants} want this`}</Txt>
              <Txt kind="small" muted>{wanted ? 'Wanted' : 'Want'}</Txt>
            </Glass>
          </Pressable>

          <Glass style={{ borderRadius: 20, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar name={piece.owner} />
            <View style={{ flex: 1 }}>
              <Txt kind="label">@{piece.owner}</Txt>
              <Txt kind="small" muted>12 sales · ships in 2 days · verified ID</Txt>
            </View>
          </Glass>

          {piece.story && (
            <View style={{ gap: 6 }}>
              <Txt kind="heading">Story</Txt>
              <Txt muted style={{ lineHeight: 21 }}>{piece.story}</Txt>
            </View>
          )}

          <Glass style={{ borderRadius: 20, overflow: 'hidden' }}>
            <Pressable onPress={() => setMeasure(!measure)} accessibilityRole="button" accessibilityState={{ expanded: measure }} style={{ flexDirection: 'row', padding: 14, alignItems: 'center' }}>
              <Txt kind="heading" style={{ flex: 1 }}>Measurements</Txt>
              <Txt kind="small" muted>{measure ? 'Flat, inches' : 'Show'}</Txt>
            </Pressable>
            {measure &&
              Object.entries(piece.measurements ?? { Waist: '15"', Rise: '10.5"', Inseam: '32"', Thigh: '11"', Knee: '9"', 'Leg opening': '11.5"' }).map(([k, v]) => (
                <View key={k}>
                  <Divider />
                  <View style={{ flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 11 }}>
                    <Txt muted style={{ flex: 1 }}>{k}</Txt>
                    <Txt>{v}</Txt>
                  </View>
                </View>
              ))}
          </Glass>
        </View>
      </ScrollView>

      <View style={{ position: 'absolute', top: insets.top + 8, left: 16 }}>
        <IconButton label="Back" onPress={() => router.back()}><Icon name="back" size={20} color={c.text} /></IconButton>
      </View>

      {!mine && piece.status !== 'Sold' && (
        <Glass strong style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 12, flexDirection: 'row', gap: 10, borderWidth: 0, borderTopWidth: 1 }}>
          {piece.status === 'Not for sale' ? (
            <PrimaryButton style={{ flex: 1 }} label="Leave a standing offer" onPress={() => router.push(`/offer/${piece.id}`)} />
          ) : piece.status === 'Trade' ? (
            <PrimaryButton style={{ flex: 1 }} label="Propose a trade" onPress={() => router.push(`/offer/${piece.id}?tab=trade`)} />
          ) : (
            <>
              <SecondaryButton style={{ flex: 1 }} label="Offer" onPress={() => router.push(`/offer/${piece.id}`)} />
              {canBuy && <PrimaryButton style={{ flex: 1.3 }} label={`Buy ${money(piece.price)}`} onPress={() => router.push(`/offer/${piece.id}?tab=buy`)} />}
            </>
          )}
        </Glass>
      )}
    </View>
  );
}
