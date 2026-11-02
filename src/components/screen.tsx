// Page frame used by every tab: soft background, a frosted fade behind the header,
// and room at the bottom for the floating nav.
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePalette } from '@/theme';

import { Backdrop, Txt } from './ui';

export const NAV_SPACE = 124;

export function Screen({ header, children, scroll = true, scrollProps }: { header?: ReactNode; children: ReactNode; scroll?: boolean; scrollProps?: ScrollViewProps }) {
  const insets = useSafeAreaInsets();
  const c = usePalette();
  const top = insets.top + 8;
  const headerH = header ? 52 : 0;
  return (
    <View style={{ flex: 1 }}>
      <Backdrop />
      {scroll ? (
        <ScrollView
          {...scrollProps}
          contentContainerStyle={[{ paddingTop: top + headerH + 4, paddingBottom: NAV_SPACE, paddingHorizontal: 16 }, scrollProps?.contentContainerStyle]}
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, paddingTop: top + headerH }}>{children}</View>
      )}
      {header && (
        <>
          <LinearGradient
            pointerEvents="none"
            colors={[c.bg[0], c.scheme === 'dark' ? 'rgba(19,20,24,0.85)' : 'rgba(248,249,251,0.85)', c.scheme === 'dark' ? 'rgba(19,20,24,0)' : 'rgba(248,249,251,0)']}
            locations={[0, 0.6, 1]}
            style={[styles.fade, { height: top + headerH + 20 }]}
          />
          <View style={[styles.header, { top }]}>{header}</View>
        </>
      )}
    </View>
  );
}

/** Large page title with optional right-side controls. */
export function TitleBar({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, height: 44 }}>
      <Txt kind={title === 'rChiv' ? 'logo' : 'title'} style={{ flex: 1 }} accessibilityRole="header">
        {title}
      </Txt>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  fade: { position: 'absolute', left: 0, right: 0, top: 0 },
  header: { position: 'absolute', left: 16, right: 16 },
});
