// A piece's photo. Until real photos are added, each mock piece gets a quiet
// cool-grey gradient "plate" so the exhibit layout still reads well.
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import type { Piece } from '@/data/mock';
import { usePalette } from '@/theme';

import { Icon } from './icon';

const LIGHT_TONES: [string, string][] = [
  ['#D9DDE5', '#B9C0CC'], ['#E4D9D6', '#C7B9B6'], ['#D5DCE6', '#AFBBCC'], ['#DDE0E6', '#C2C7D0'],
  ['#D8D6E2', '#B8B4C8'], ['#E1E3E8', '#C6CAD2'], ['#D3D9E3', '#A9B4C5'], ['#E3DEE3', '#C8BFC8'],
  ['#D9DEE3', '#BCC4CC'], ['#D6D8DD', '#AEB2BA'], ['#DCE1EA', '#BAC2D1'], ['#E2E2E2', '#C4C4C6'],
];
const DARK_TONES: [string, string][] = LIGHT_TONES.map(([a, b]) => [shade(a, 0.32), shade(b, 0.22)]);

function shade(hex: string, f: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * f), g = Math.round(((n >> 8) & 255) * f), b = Math.round((n & 255) * f);
  return `rgb(${r},${g},${b})`;
}

export function PieceImage({ piece, style, glyph = true }: { piece: Pick<Piece, 'photo' | 'tone' | 'title'>; style?: StyleProp<ViewStyle>; glyph?: boolean }) {
  const c = usePalette();
  if (piece.photo) {
    return <Image source={{ uri: piece.photo }} style={[{ backgroundColor: c.card }, style as any]} contentFit="cover" transition={220} accessibilityLabel={piece.title} />;
  }
  const tones = c.scheme === 'dark' ? DARK_TONES : LIGHT_TONES;
  const t = tones[piece.tone % tones.length];
  return (
    <View style={[{ overflow: 'hidden' }, style]} accessibilityLabel={piece.title}>
      <LinearGradient colors={t} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFill} />
      {glyph && (
        <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', opacity: 0.35 }]}>
          <Icon name="image" size={28} color={c.scheme === 'dark' ? '#FFFFFF' : '#1B1D22'} stroke={1.3} />
        </View>
      )}
    </View>
  );
}
