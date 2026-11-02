// Shared building blocks: background, glass surfaces, text, chips, segmented controls.
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type TextProps, type TextStyle, type ViewStyle } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { radius, type, usePalette, type PieceStatus } from '@/theme';

/** Soft gradient background with three blurred light orbs (peach, pink, blue). */
export function Backdrop({ children }: { children?: ReactNode }) {
  const c = usePalette();
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={c.bg} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFill} />
      <Orb color={c.orbs[0]} style={{ left: -90, top: -70, width: 320, height: 320 }} />
      <Orb color={c.orbs[1]} style={{ right: -110, top: 290, width: 340, height: 340 }} />
      <Orb color={c.orbs[2]} style={{ left: -100, bottom: 40, width: 360, height: 360 }} />
      {children}
    </View>
  );
}

let orbId = 0;
function Orb({ color, style }: { color: string; style: ViewStyle }) {
  const id = `orb${orbId++}`;
  return (
    <View pointerEvents="none" style={[{ position: 'absolute' }, style]}>
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity={1} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

/** Frosted glass surface. Real blur on phones; tinted fill everywhere. */
export function Glass({ children, style, strong, intensity = 30 }: { children?: ReactNode; style?: StyleProp<ViewStyle>; strong?: boolean; intensity?: number }) {
  const c = usePalette();
  const flat = StyleSheet.flatten(style) ?? {};
  return (
    <View style={[{ overflow: 'hidden', borderWidth: 1, borderColor: c.glassEdge }, Platform.OS === 'web' && (WEB_BLUR as ViewStyle), style]}>
      {Platform.OS === 'ios' && <BlurView tint={c.blurTint} intensity={intensity} style={[StyleSheet.absoluteFill, { borderRadius: flat.borderRadius }]} />}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: strong ? c.glassStrong : c.glass }]} />
      {children}
    </View>
  );
}

const WEB_BLUR = { backdropFilter: 'blur(16px) saturate(160%)', WebkitBackdropFilter: 'blur(16px) saturate(160%)' };

type TxtKind = keyof typeof type;
export function Txt({ kind = 'body', muted, color, style, ...rest }: TextProps & { kind?: TxtKind; muted?: boolean; color?: string; style?: StyleProp<TextStyle> }) {
  const c = usePalette();
  return <Text {...rest} style={[type[kind], { color: color ?? (muted ? c.textSecondary : c.text) }, style]} />;
}

/** Status dot used on every piece: solid = for sale, blue = offers, ring = trade, grey = not for sale. */
export function StatusDot({ status, size = 6 }: { status: PieceStatus; size?: number }) {
  const c = usePalette();
  const s = c.status[status];
  return <View style={{ width: size, height: size, borderRadius: size, backgroundColor: s.dot, borderWidth: s.ring ? 1.5 : 0, borderColor: s.ring }} />;
}

const SHORT: Record<PieceStatus, string> = { 'For sale': 'For sale', 'Open to offers': 'Offers', Trade: 'Trade', 'Not for sale': 'Not for sale', Sold: 'Sold' };

export function StatusBadge({ status, style }: { status: PieceStatus; style?: StyleProp<ViewStyle> }) {
  return (
    <Glass style={[{ height: 24, paddingHorizontal: 9, borderRadius: radius.chip, flexDirection: 'row', alignItems: 'center', gap: 5 }, style]} intensity={20}>
      <StatusDot status={status} />
      <Txt kind="tiny">{SHORT[status]}</Txt>
    </Glass>
  );
}

/** Round glass icon button (header buttons). */
export function IconButton({ children, onPress, label, size = 40 }: { children: ReactNode; onPress?: () => void; label: string; size?: number }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={6} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
      <Glass style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}>{children}</Glass>
    </Pressable>
  );
}

/** iOS-style segmented control on glass. */
export function Segmented<T extends string>({ options, value, onChange, style }: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void; style?: StyleProp<ViewStyle> }) {
  const c = usePalette();
  return (
    <Glass style={[{ flexDirection: 'row', padding: 3, borderRadius: 20 }, style]}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <Pressable
            key={o.id}
            onPress={() => onChange(o.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={{ flex: 1, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.segmentOn : 'transparent', ...(on && c.scheme === 'light' ? shadow(c.shadow, 4) : null) }}>
            <Txt kind="label" color={on ? c.text : c.textSecondary} style={{ fontWeight: on ? '600' : '500', fontSize: 14 }}>
              {o.label}
            </Txt>
          </Pressable>
        );
      })}
    </Glass>
  );
}

/** Pill chip, filled when selected. */
export function Chip({ label, on, onPress }: { label: string; on?: boolean; onPress?: () => void }) {
  const c = usePalette();
  if (on)
    return (
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: true }} style={{ height: 34, paddingHorizontal: 14, borderRadius: 17, backgroundColor: c.ink, justifyContent: 'center' }}>
        <Txt kind="label" color={c.inkText} style={{ fontSize: 13 }}>{label}</Txt>
      </Pressable>
    );
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: false }}>
      <Glass style={{ height: 34, paddingHorizontal: 14, borderRadius: 17, justifyContent: 'center' }}>
        <Txt kind="label" style={{ fontSize: 13, fontWeight: '500' }}>{label}</Txt>
      </Glass>
    </Pressable>
  );
}

export function PrimaryButton({ label, onPress, disabled, style }: { label: string; onPress?: () => void; disabled?: boolean; style?: StyleProp<ViewStyle> }) {
  const c = usePalette();
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [{ height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: disabled ? c.glass : c.ink, opacity: pressed ? 0.85 : 1 }, style]}>
      <Txt kind="heading" color={disabled ? c.textSecondary : c.inkText} style={{ fontSize: 16 }}>{label}</Txt>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, style }: { label: string; onPress?: () => void; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }, style]}>
      <Glass style={{ height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' }}>
        <Txt kind="heading" style={{ fontSize: 16 }}>{label}</Txt>
      </Glass>
    </Pressable>
  );
}

const AV = [['#FFC9B0', '#F2B3CB'], ['#BFD6F7', '#D9C8F0']] as const;
export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const pair = AV[name.charCodeAt(0) % 2];
  return (
    <LinearGradient colors={pair} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.4, fontWeight: '600', color: '#1B1D22' }}>{name[0]?.toUpperCase()}</Text>
    </LinearGradient>
  );
}

export function SectionLabel({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginHorizontal: 4, marginTop: 22, marginBottom: 10 }}>
      <Txt kind="heading">{children}</Txt>
      {right}
    </View>
  );
}

export function Divider() {
  const c = usePalette();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.divider }} />;
}

export function shadow(color: string, r = 12): ViewStyle {
  return Platform.select({
    web: { boxShadow: `0 ${r / 2}px ${r * 2}px ${color}` } as ViewStyle,
    default: { shadowColor: color, shadowOpacity: 1, shadowRadius: r, shadowOffset: { width: 0, height: r / 2 }, elevation: 4 },
  })!;
}
