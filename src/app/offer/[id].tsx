// Offer sheet: cash offer (with the 3% capped fee shown up front), trade proposal,
// or buy now. Sending it opens a deal thread in Messages.
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { PieceImage } from '@/components/piece-image';
import { Divider, Glass, PrimaryButton, Segmented, Txt, shadow } from '@/components/ui';
import { ME, money } from '@/data/mock';
import { usePiece, useStore } from '@/store/app-store';
import { usePalette } from '@/theme';

type Tab = 'offer' | 'trade' | 'buy';

/** Draft fee model from the concept doc: 3% capped at $25. Card processing is shown at cost. */
function fees(amount: number) {
  const platform = Math.min(Math.round(amount * 0.03 * 100) / 100, 25);
  const processing = Math.round((amount * 0.029 + 0.3) * 100) / 100;
  return { platform, processing };
}

export default function OfferSheet() {
  const { id, tab: initialTab } = useLocalSearchParams<{ id: string; tab?: Tab }>();
  const piece = usePiece(id);
  const { state, dispatch } = useStore();
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>(initialTab ?? (piece?.status === 'Trade' ? 'trade' : 'offer'));
  const [amount, setAmount] = useState(piece?.price ? String(Math.round(piece.price * 0.9)) : '');
  const [exp, setExp] = useState('48h');
  const [picked, setPicked] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (!piece) return null;
  const mine = state.pieces.filter((p) => p.owner === ME && p.status !== 'Sold' && p.id !== piece.id);
  const value = tab === 'buy' ? piece.price ?? 0 : Number(amount) || 0;
  const f = fees(value);

  const send = () => {
    if (tab === 'trade') {
      const mineP = mine.find((p) => p.id === picked);
      if (!mineP) return;
      dispatch({ type: 'startDeal', piece, kind: 'trade', line: `Your ${mineP.title.toLowerCase()} for their ${piece.title.toLowerCase()}`, sub: 'No cash added · expires in 72h', text: `Would you trade your ${piece.title.toLowerCase()} for my ${mineP.title.toLowerCase()}?` });
    } else {
      if (!value) return;
      const text = tab === 'buy' ? `Bought at ${money(value)}. Paid, rChiv is holding it until it arrives.` : `Would you take ${money(value)} for the ${piece.title.toLowerCase()}?`;
      dispatch({ type: 'startDeal', piece, kind: 'offer', line: money(value), sub: `${piece.title} · ${tab === 'buy' ? 'paid' : `expires in ${exp}`}`, text });
    }
    setSent(true);
  };

  if (sent) {
    const title = tab === 'trade' ? 'Trade proposed' : tab === 'buy' ? 'Paid' : 'Offer sent';
    const body =
      tab === 'trade'
        ? `@${piece.owner} can accept, counter or decline. Nothing ships until both of you confirm.`
        : tab === 'buy'
          ? 'rChiv holds the money until the piece arrives and you confirm it matches the listing.'
          : `It expires in ${exp}. You will hear the moment @${piece.owner} accepts, counters or declines.`;
    return (
      <View style={{ flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" color={c.inkText} size={30} stroke={2.4} />
        </View>
        <Txt kind="title" style={{ fontSize: 24 }}>{title}</Txt>
        <Txt muted style={{ textAlign: 'center', lineHeight: 21 }}>{body}</Txt>
        <PrimaryButton label="Open the chat" style={{ alignSelf: 'stretch', marginTop: 18 }} onPress={() => { router.back(); router.push(`/chat/${piece.owner}-${piece.id}`); }} />
        <Pressable onPress={() => router.back()} style={{ padding: 12 }}><Txt muted>Done</Txt></Pressable>
      </View>
    );
  }

  const tabs: { id: Tab; label: string }[] = [{ id: 'offer', label: 'Cash' }, { id: 'trade', label: 'Trade' }];
  if (piece.status === 'For sale' || piece.status === 'Open to offers') tabs.push({ id: 'buy', label: 'Buy now' });

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24, gap: 16 }} keyboardShouldPersistTaps="handled">
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <PieceImage piece={piece} glyph={false} style={{ width: 56, height: 56, borderRadius: 14 }} />
        <View style={{ flex: 1 }}>
          <Txt kind="heading">{tab === 'trade' ? 'Propose a trade' : tab === 'buy' ? 'Buy now' : piece.status === 'Not for sale' ? 'Standing offer' : 'Make an offer'}</Txt>
          <Txt kind="small" muted numberOfLines={1}>{piece.title} · @{piece.owner}{piece.price ? ` · listed ${money(piece.price)}` : ''}</Txt>
        </View>
      </View>

      <Segmented options={tabs} value={tab} onChange={setTab} />

      {tab !== 'trade' && (
        <>
          {tab === 'offer' ? (
            <Glass style={{ borderRadius: 20, paddingHorizontal: 18, paddingVertical: 14, flexDirection: 'row', alignItems: 'center' }}>
              <Txt style={{ fontSize: 34, fontWeight: '600' }}>$</Txt>
              <TextInput
                value={amount}
                onChangeText={(t) => setAmount(t.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={c.textSecondary}
                accessibilityLabel="Offer amount in dollars"
                style={{ flex: 1, fontSize: 34, fontWeight: '600', color: c.text, marginLeft: 4, padding: 0 }}
              />
            </Glass>
          ) : null}

          <Glass style={{ borderRadius: 20 }}>
            <Row label={tab === 'buy' ? 'Price' : 'Your offer'} value={money(value) || '$0'} />
            <Divider />
            <Row label="rChiv fee (3%, max $25)" value={money(f.platform)} muted />
            <Divider />
            <Row label="Card processing, at cost" value={money(f.processing)} muted />
            <Divider />
            <Row label="Total" value={money(Math.round((value + f.platform + f.processing) * 100) / 100)} bold />
          </Glass>

          {tab === 'offer' && (
            <View style={{ gap: 8 }}>
              <Txt kind="small" muted style={{ marginLeft: 4 }}>Offer expires in</Txt>
              <Segmented options={['24h', '48h', '72h'].map((x) => ({ id: x, label: x }))} value={exp} onChange={setExp} />
            </View>
          )}
        </>
      )}

      {tab === 'trade' && (
        <View style={{ gap: 10 }}>
          <Txt kind="small" muted style={{ marginLeft: 4 }}>Pick one of your pieces to offer</Txt>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {mine.map((p) => {
              const on = picked === p.id;
              return (
                <Pressable key={p.id} onPress={() => setPicked(on ? null : p.id)} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={p.title} style={{ width: '31%', gap: 4, opacity: picked && !on ? 0.45 : 1 }}>
                  <View style={[{ borderRadius: 16, borderWidth: 2, borderColor: on ? c.ink : 'transparent' }, on ? shadow(c.shadow, 8) : null]}>
                    <PieceImage piece={p} glyph={false} style={{ height: 120, borderRadius: 14 }} />
                  </View>
                  <Txt kind="tiny" numberOfLines={1}>{p.title}</Txt>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      <Txt kind="small" muted style={{ textAlign: 'center', lineHeight: 18 }}>
        {tab === 'trade' ? 'Both of you ship with tracking. Nothing is final until both packages arrive.' : 'rChiv holds payment until the piece arrives and matches the listing.'}
      </Txt>

      <PrimaryButton
        label={tab === 'trade' ? (picked ? 'Propose trade' : 'Choose a piece') : tab === 'buy' ? `Pay ${money(Math.round((value + f.platform + f.processing) * 100) / 100)}` : 'Send offer'}
        disabled={tab === 'trade' ? !picked : !value}
        onPress={send}
      />
    </ScrollView>
  );
}

function Row({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12 }}>
      <Txt muted={muted} style={{ flex: 1, fontWeight: bold ? '600' : '400' }}>{label}</Txt>
      <Txt muted={muted} style={{ fontWeight: bold ? '600' : '400' }}>{value}</Txt>
    </View>
  );
}
