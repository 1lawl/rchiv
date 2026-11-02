// Post a piece: pick photos from your camera roll, title, label or look, status,
// price, size. Posting adds it to your Closet and the Home board right away.
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Screen, TitleBar } from '@/components/screen';
import { Chip, Glass, PrimaryButton, Segmented, Txt } from '@/components/ui';
import { ME, type Piece } from '@/data/mock';
import { useStore } from '@/store/app-store';
import { usePalette, type PieceStatus } from '@/theme';

const STATUSES: PieceStatus[] = ['For sale', 'Open to offers', 'Trade', 'Not for sale'];
const SLOTS = ['Front', 'Back', 'Tag', 'Label', 'Flaws'];

export default function Post() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { dispatch } = useStore();
  const c = usePalette();
  const [photos, setPhotos] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<'brand' | 'aesthetic'>('brand');
  const [label, setLabel] = useState('');
  const [status, setStatus] = useState<PieceStatus>('Open to offers');
  const [price, setPrice] = useState('');
  const [size, setSize] = useState('');
  const [story, setStory] = useState('');

  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: 5, quality: 0.85 });
    if (!res.canceled) setPhotos((p) => [...p, ...res.assets.map((a) => a.uri)].slice(0, 5));
  };

  const needsPrice = status === 'For sale' || status === 'Open to offers';
  const ready = title.trim() && label.trim() && (!needsPrice || Number(price) > 0);

  const submit = () => {
    if (!ready) return;
    const piece: Piece = {
      id: `mine-${Date.now()}`,
      title: title.trim(),
      brand: kind === 'brand' ? label.trim() : undefined,
      look: kind === 'aesthetic' ? label.trim() : undefined,
      status,
      price: needsPrice ? Number(price) : undefined,
      size: size.trim() || 'One size',
      owner: ME,
      wants: 0,
      photo: photos[0],
      tone: Math.floor(Math.random() * 12),
      height: 200 + Math.floor(Math.random() * 70),
      story: story.trim() || undefined,
      createdAt: Date.now(),
    };
    dispatch({ type: 'post', piece });
    setPhotos([]); setTitle(''); setLabel(''); setPrice(''); setSize(''); setStory('');
    if (Platform.OS === 'web') router.push(`/piece/${piece.id}`);
    else Alert.alert('Posted', 'It is on your Closet and the Home board.', [{ text: 'View it', onPress: () => router.push(`/piece/${piece.id}`) }, { text: 'OK' }]);
  };

  return (
    <Screen header={<TitleBar title={mode === 'instant' ? 'New instant' : 'Post a piece'} />} scrollProps={{ keyboardShouldPersistTaps: 'handled' }}>
      {mode === 'instant' && (
        <Txt muted style={{ marginHorizontal: 4, marginBottom: 12 }}>Instants are coming next. For now, post the piece you are wearing and it shows up for your followers.</Txt>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }} style={{ marginHorizontal: -16, paddingLeft: 16 }}>
        {SLOTS.map((s, i) => {
          const uri = photos[i];
          return (
            <Pressable key={s} onPress={pick} accessibilityRole="button" accessibilityLabel={`Add ${s} photo`}>
              <Glass style={{ width: i === 0 ? 150 : 100, height: i === 0 ? 200 : 130, borderRadius: 18, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {uri ? <Image source={{ uri }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} contentFit="cover" /> : <Icon name={i === 0 ? 'camera' : 'plus'} color={c.textSecondary} />}
                {!uri && <Txt kind="tiny" muted>{s}</Txt>}
              </Glass>
            </Pressable>
          );
        })}
        <View style={{ width: 16 }} />
      </ScrollView>
      <Txt kind="small" muted style={{ marginHorizontal: 4, marginTop: 8 }}>Front first. Tag, label and flaws photos build trust and speed up offers.</Txt>

      <Field label="Title"><Input value={title} onChangeText={setTitle} placeholder="Painted black flares" /></Field>

      <Field label="Is it a notable label, or an aesthetic piece?">
        <Segmented options={[{ id: 'brand', label: 'Label' }, { id: 'aesthetic', label: 'Aesthetic' }]} value={kind} onChange={setKind} />
        <View style={{ height: 8 }} />
        <Input value={label} onChangeText={setLabel} placeholder={kind === 'brand' ? 'Brand, e.g. IfSixWasNine' : 'Look, e.g. Japanese denim'} />
      </Field>

      <Field label="Status">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {STATUSES.map((s) => <Chip key={s} label={s} on={status === s} onPress={() => setStatus(s)} />)}
        </View>
      </Field>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        {needsPrice && <View style={{ flex: 1 }}><Field label="Price (USD)"><Input value={price} onChangeText={(t) => setPrice(t.replace(/[^0-9]/g, ''))} placeholder="250" keyboardType="number-pad" /></Field></View>}
        <View style={{ flex: 1 }}><Field label="Size"><Input value={size} onChangeText={setSize} placeholder="W30 / M" /></Field></View>
      </View>

      <Field label="Story (optional)"><Input value={story} onChangeText={setStory} placeholder="Where it came from, season, what makes it special" multiline /></Field>

      {needsPrice && Number(price) > 0 && (
        <Txt kind="small" muted style={{ marginHorizontal: 4, marginTop: 12 }}>
          You keep ${Number(price)}. The buyer pays the rChiv fee (3%, max $25) on top.
        </Txt>
      )}

      <PrimaryButton label="Post" disabled={!ready} onPress={submit} style={{ marginTop: 20 }} />
    </Screen>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 18, gap: 8 }}>
      <Txt kind="small" muted style={{ marginLeft: 4, fontWeight: '500' }}>{label}</Txt>
      {children}
    </View>
  );
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  const c = usePalette();
  return (
    <Glass style={{ borderRadius: 16 }}>
      <TextInput {...props} placeholderTextColor={c.textSecondary} style={{ color: c.text, fontSize: 16, paddingHorizontal: 14, paddingVertical: 13, minHeight: props.multiline ? 90 : undefined, textAlignVertical: props.multiline ? 'top' : 'center' }} />
    </Glass>
  );
}
