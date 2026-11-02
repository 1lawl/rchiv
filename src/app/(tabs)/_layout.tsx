// The five tabs with the floating dark pill nav from the drafts:
// Home, Finder, Post, Messages, Closet.
import * as Haptics from 'expo-haptics';
import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import { Platform, Pressable, StyleSheet, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

import { Icon, type IconName } from '@/components/icon';
import { shadow } from '@/components/ui';
import { useStore } from '@/store/app-store';
import { usePalette } from '@/theme';

export default function TabsLayout() {
  const c = usePalette();
  const { state } = useStore();
  const unread = state.threads.some((t) => t.unread);

  // The triggers must be direct children of NavBar so expo-router can find them.
  return (
    <Tabs>
      <TabSlot />
      <TabList asChild>
        <NavBar>
          <TabTrigger name="index" href="/" asChild><NavButton icon="home" label="Home" /></TabTrigger>
          <TabTrigger name="finder" href="/finder" asChild><NavButton icon="search" label="Finder" /></TabTrigger>
          <TabTrigger name="post" href="/post" asChild><NavButton icon="post" label="Post a piece" /></TabTrigger>
          <TabTrigger name="messages" href="/messages" asChild><NavButton icon="messages" label="Messages" dot={unread ? c.unread : undefined} /></TabTrigger>
          <TabTrigger name="closet" href="/closet" asChild><NavButton icon="closet" label="Closet" /></TabTrigger>
        </NavBar>
      </TabList>
    </Tabs>
  );
}

function NavBar({ children, style, ...rest }: ViewProps) {
  const insets = useSafeAreaInsets();
  const c = usePalette();
  return (
    <View {...rest} style={[styles.navWrap, { bottom: Math.max(insets.bottom - 6, 14) }]} pointerEvents="box-none">
      <View style={[styles.nav, { backgroundColor: c.navPill, borderColor: c.navEdge }, shadow(c.shadow, 14), Platform.OS === 'web' && ({ backdropFilter: 'blur(24px) saturate(180%)' } as object)]}>
        {Platform.OS === 'ios' && (
          <View style={[StyleSheet.absoluteFill, { borderRadius: 32, overflow: 'hidden' }]}>
            <BlurView tint="dark" intensity={40} style={StyleSheet.absoluteFill} />
          </View>
        )}
        {children}
      </View>
    </View>
  );
}

type NavProps = TabTriggerSlotProps & { icon: IconName; label: string; dot?: string };

function NavButton({ icon, label, dot, isFocused, onPress, ref: _ref, ...props }: NavProps) {
  return (
    <Pressable
      {...props}
      onPress={(e) => {
        if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
        onPress?.(e);
      }}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!isFocused }}
      style={[styles.btn, { backgroundColor: isFocused ? 'rgba(255,255,255,0.16)' : 'transparent', opacity: isFocused ? 1 : 0.75 }]}>
      <Icon name={icon} color="#FFFFFF" />
      {dot && <View style={[styles.dot, { backgroundColor: dot }]} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  navWrap: { position: 'absolute', left: 24, right: 24, alignItems: 'center' },
  nav: {
    width: '100%',
    maxWidth: 420,
    height: 64,
    borderRadius: 32,
    borderWidth: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  btn: { width: 52, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', top: 9, right: 13, width: 8, height: 8, borderRadius: 4 },
});
