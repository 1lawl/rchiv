// Swipe layout: one big piece at a time, dating-app style.
// Right = want, left = pass, up = make an offer, down = open details.
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { interpolate, runOnJS, useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

import { pieceLine, type Piece } from '@/data/mock';
import { useStore } from '@/store/app-store';
import { motion, usePalette } from '@/theme';

import { NAV_SPACE } from './screen';
import { Icon } from './icon';
import { PieceImage } from './piece-image';
import { Glass, StatusBadge, Txt, shadow } from './ui';

type Kind = 'want' | 'pass' | 'offer' | 'open';
const HINTS: Record<Kind, string> = {
  want: 'Saved to your wants. The owner can see it.',
  pass: 'Passed',
  offer: 'Opening the offer sheet',
  open: 'Opening the piece',
};
const ease = Easing.bezier(0.2, 0.8, 0.2, 1);

export function SwipeDeck({ pieces }: { pieces: Piece[] }) {
  const { dispatch } = useStore();
  const c = usePalette();
  const [i, setI] = useState(0);
  const [toast, setToast] = useState<Kind | null>(null);
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1600);
    return () => clearTimeout(t);
  }, [toast]);

  const n = pieces.length;
  const card = n ? pieces[i % n] : undefined;
  const next = n > 1 ? pieces[(i + 1) % n] : undefined;

  const finish = (kind: Kind) => {
    if (!card) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setToast(kind);
    if (kind === 'want') dispatch({ type: 'toggleWant', id: card.id });
    if (kind === 'offer') router.push(`/offer/${card.id}`);
    if (kind === 'open') router.push(`/piece/${card.id}`);
    if (kind === 'want' || kind === 'pass') setI((v) => v + 1);
    x.value = 0;
    y.value = 0;
  };

  const fling = (kind: Kind) => {
    'worklet';
    const tx = kind === 'want' ? 520 : kind === 'pass' ? -520 : 0;
    const ty = kind === 'offer' ? -760 : kind === 'open' ? 0 : 0;
    if (kind === 'open') {
      x.value = withTiming(0, { duration: motion.fast, easing: ease });
      y.value = withTiming(0, { duration: motion.fast, easing: ease }, () => runOnJS(finish)(kind));
      return;
    }
    x.value = withTiming(tx, { duration: motion.fast, easing: ease });
    y.value = withTiming(ty, { duration: motion.fast, easing: ease }, () => runOnJS(finish)(kind));
  };

  const pan = Gesture.Pan()
    .onChange((e) => {
      x.value = e.translationX;
      y.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationX > 100) fling('want');
      else if (e.translationX < -100) fling('pass');
      else if (e.translationY < -110 && Math.abs(e.translationX) < 60) fling('offer');
      else if (e.translationY > 120 && Math.abs(e.translationX) < 60) fling('open');
      else {
        x.value = withTiming(0, { duration: motion.fast, easing: ease });
        y.value = withTiming(0, { duration: motion.fast, easing: ease });
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }, { rotate: `${x.value / 18}deg` }],
  }));
  const wantStamp = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [0, 110], [0, 1], 'clamp') }));
  const passStamp = useAnimatedStyle(() => ({ opacity: interpolate(x.value, [-110, 0], [1, 0], 'clamp') }));
  const offerStamp = useAnimatedStyle(() => ({ opacity: Math.abs(x.value) < 60 ? interpolate(y.value, [-120, 0], [1, 0], 'clamp') : 0 }));

  if (!card) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Txt kind="heading">You have seen everything</Txt>
        <Txt muted style={{ textAlign: 'center', marginTop: 6 }}>Switch the mix in feed settings, or check back later.</Txt>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingHorizontal: 16, paddingBottom: NAV_SPACE - 20 }}>
      <View style={{ flex: 1, marginTop: 6 }}>
        {next && (
          <View style={[StyleSheet.absoluteFill, { transform: [{ scale: 0.95 }, { translateY: 14 }], opacity: 0.7 }]}>
            <PieceImage piece={next} style={{ flex: 1, borderRadius: 28 }} />
          </View>
        )}
        <GestureDetector gesture={pan}>
          <Animated.View style={[StyleSheet.absoluteFill, cardStyle, shadow(c.shadow, 18)]}>
            <PieceImage piece={card} style={{ flex: 1, borderRadius: 28 }} />
            <StatusBadge status={card.status} style={{ position: 'absolute', left: 12, top: 12 }} />
            <Stamp label="Want" style={[{ left: 18, top: 50, transform: [{ rotate: '-12deg' }] }, wantStamp]} />
            <Stamp label="Pass" style={[{ right: 18, top: 50, transform: [{ rotate: '12deg' }] }, passStamp]} />
            <Stamp label="Offer" style={[{ alignSelf: 'center', bottom: 120 }, offerStamp]} />
            <Glass style={styles.label}>
              <Txt kind="heading" numberOfLines={1}>{card.title}</Txt>
              <Txt kind="small" muted numberOfLines={1} style={{ fontSize: 13 }}>{pieceLine(card)} · {card.size} · @{card.owner}</Txt>
            </Glass>
          </Animated.View>
        </GestureDetector>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18, marginTop: 16 }}>
        <RoundAction label="Pass" icon="x" onPress={() => fling('pass')} />
        <Txt kind="small" muted style={{ flex: 1, textAlign: 'center', fontSize: 12 }}>
          {toast ? HINTS[toast] : 'Right to want, left to pass, up to offer'}
        </Txt>
        <RoundAction label="Want" icon="heart" onPress={() => fling('want')} />
      </View>
    </View>
  );
}

function RoundAction({ label, icon, onPress }: { label: string; icon: 'x' | 'heart'; onPress: () => void }) {
  const c = usePalette();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.94 : 1 }] })}>
      <Glass style={{ width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={24} color={c.text} />
      </Glass>
    </Pressable>
  );
}

function Stamp({ label, style }: { label: string; style: any }) {
  return (
    <Animated.View style={[{ position: 'absolute', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, borderWidth: 2, borderColor: '#FFFFFF', backgroundColor: 'rgba(27,29,34,0.35)' }, style]}>
      <Txt kind="heading" color="#FFFFFF" style={{ fontSize: 20, letterSpacing: 1 }}>{label.toUpperCase()}</Txt>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  label: { position: 'absolute', left: 12, right: 12, bottom: 12, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, gap: 2 },
});
