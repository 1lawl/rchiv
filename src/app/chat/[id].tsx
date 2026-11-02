// One conversation, with the deal card pinned on top (accept / counter / decline).
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { PieceImage } from '@/components/piece-image';
import { Avatar, Backdrop, Glass, IconButton, Txt } from '@/components/ui';
import { useStore } from '@/store/app-store';
import { usePalette } from '@/theme';

export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, dispatch } = useStore();
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const t = state.threads.find((x) => x.id === id);
  const piece = state.pieces.find((p) => p.id === t?.pieceId);

  useEffect(() => {
    if (t?.unread) dispatch({ type: 'openThread', id: t.id });
  }, [t?.unread, t?.id, dispatch]);

  if (!t) return <Backdrop><Txt style={{ margin: 80 }}>Chat not found</Txt></Backdrop>;

  const send = () => {
    const v = text.trim();
    if (!v) return;
    dispatch({ type: 'sendMessage', threadId: t.id, text: v });
    setText('');
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Backdrop />
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <IconButton label="Back" onPress={() => router.back()}><Icon name="back" size={20} color={c.text} /></IconButton>
        <Avatar name={t.who} size={36} />
        <View style={{ flex: 1 }}>
          <Txt kind="label">{t.who}</Txt>
          <Txt kind="small" muted>usually replies in an hour</Txt>
        </View>
      </View>

      <Pressable onPress={() => piece && router.push(`/piece/${piece.id}`)} style={{ marginHorizontal: 16, marginTop: 12 }}>
        <Glass style={{ borderRadius: 20, padding: 12, gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            {piece && <PieceImage piece={piece} glyph={false} style={{ width: 52, height: 52, borderRadius: 12 }} />}
            <View style={{ flex: 1 }}>
              <Txt kind="small" color={t.deal.actionable ? c.accent : c.textSecondary} style={{ fontWeight: '600' }}>{t.deal.kind}</Txt>
              <Txt kind="heading" numberOfLines={2}>{t.deal.line}</Txt>
              <Txt kind="small" muted numberOfLines={1}>{t.deal.sub}</Txt>
            </View>
          </View>
          {t.deal.actionable && (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <SmallBtn label="Decline" onPress={() => dispatch({ type: 'sendMessage', threadId: t.id, text: 'Going to pass on this one, thanks.' })} />
              <SmallBtn label="Counter" onPress={() => piece && router.push(`/offer/${piece.id}`)} />
              <SmallBtn label="Accept" primary onPress={() => dispatch({ type: 'acceptDeal', threadId: t.id })} />
            </View>
          )}
          {t.done && <Txt kind="small" muted style={{ lineHeight: 18 }}>{t.done}</Txt>}
        </Glass>
      </Pressable>

      <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 8 }} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })}>
        {t.msgs.map((m, k) => (
          <View key={k} style={{ flexDirection: 'row', justifyContent: m.mine ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
            {!m.mine && <Avatar name={t.who} size={26} />}
            {m.mine ? (
              <LinearGradient colors={c.bubbleMine} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ maxWidth: '75%', borderRadius: 20, borderBottomRightRadius: 6, paddingHorizontal: 14, paddingVertical: 10 }}>
                <Txt>{m.text}</Txt>
              </LinearGradient>
            ) : (
              <View style={{ maxWidth: '75%', borderRadius: 20, borderBottomLeftRadius: 6, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: c.bubbleTheirs }}>
                <Txt>{m.text}</Txt>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 10, paddingTop: 6 }}>
        <Glass style={{ borderRadius: 24, flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 6, minHeight: 48 }}>
          <TextInput value={text} onChangeText={setText} placeholder="Message" placeholderTextColor={c.textSecondary} onSubmitEditing={send} returnKeyType="send" accessibilityLabel="Message" style={{ flex: 1, color: c.text, fontSize: 16, paddingVertical: 10 }} />
          <Pressable onPress={send} accessibilityRole="button" accessibilityLabel="Send" style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: text.trim() ? c.ink : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="arrowUp" size={18} color={text.trim() ? c.inkText : c.textSecondary} stroke={2.2} />
          </Pressable>
        </Glass>
      </View>
    </KeyboardAvoidingView>
  );
}

function SmallBtn({ label, onPress, primary }: { label: string; onPress: () => void; primary?: boolean }) {
  const c = usePalette();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => ({ flex: 1, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: primary ? c.ink : c.glass, borderWidth: primary ? 0 : 1, borderColor: c.glassEdge, opacity: pressed ? 0.8 : 1 })}>
      <Txt kind="label" color={primary ? c.inkText : c.text}>{label}</Txt>
    </Pressable>
  );
}
