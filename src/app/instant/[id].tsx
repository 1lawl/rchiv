// Full-screen instant: main photo plus a small inset (front camera style),
// with a like and a quick reply that lands in Messages.
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { PieceImage } from '@/components/piece-image';
import { Avatar, Txt } from '@/components/ui';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { INSTANTS } from '@/data/mock';
import { useStore } from '@/store/app-store';

export default function InstantViewer() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, dispatch } = useStore();
  const insets = useSafeAreaInsets();
  const [liked, setLiked] = useState(false);
  const n = INSTANTS.find((x) => x.id === id);

  useEffect(() => {
    if (n) dispatch({ type: 'seeInstant', id: n.id });
  }, [n, dispatch]);

  if (!n) return null;
  const main = state.pieces.find((p) => p.id === n.pieceId)!;
  const inset = state.pieces.find((p) => p.id === n.insetPieceId)!;

  return (
    <View style={{ flex: 1, backgroundColor: '#0E0F12' }}>
      <PieceImage piece={main} style={{ position: 'absolute', top: insets.top + 60, left: 8, right: 8, bottom: insets.bottom + 90, borderRadius: 28 }} />
      <PieceImage piece={inset} glyph={false} style={{ position: 'absolute', top: insets.top + 76, left: 24, width: 110, height: 146, borderRadius: 18, borderWidth: 2, borderColor: '#FFFFFF' }} />

      <View style={{ position: 'absolute', top: insets.top + 8, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Avatar name={n.who} size={36} />
        <View style={{ flex: 1 }}>
          <Txt kind="label" color="#FFFFFF">{n.who}</Txt>
          <Txt kind="small" color="rgba(255,255,255,0.7)">{n.time} ago · wearing {main.title.toLowerCase()}</Txt>
        </View>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close">
          <Dark style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}><Icon name="close" size={20} color="#FFFFFF" /></Dark>
        </Pressable>
      </View>

      <View style={{ position: 'absolute', left: 16, right: 16, bottom: insets.bottom + 20, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <Dark style={{ flex: 1, height: 48, borderRadius: 24, justifyContent: 'center', paddingHorizontal: 16 }}>
          <Txt color="#FFFFFF">{n.caption}</Txt>
        </Dark>
        <Pressable onPress={() => router.push(`/piece/${main.id}`)} accessibilityRole="button" accessibilityLabel="Open the piece">
          <Dark style={{ height: 48, borderRadius: 24, paddingHorizontal: 16, justifyContent: 'center' }}>
            <Txt kind="label" color="#FFFFFF">See piece</Txt>
          </Dark>
        </Pressable>
        <Pressable onPress={() => setLiked(!liked)} accessibilityRole="button" accessibilityLabel="Like" accessibilityState={{ selected: liked }}>
          <Dark style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="heart" color={liked ? '#F2A7BE' : '#FFFFFF'} fill={liked ? '#F2A7BE' : 'none'} />
          </Dark>
        </Pressable>
      </View>
    </View>
  );
}

// Instants always sit on black, so their controls use a fixed dark glass in both themes.
function Dark({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ backgroundColor: 'rgba(46,48,54,0.78)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.14)' }, style]}>{children}</View>;
}
