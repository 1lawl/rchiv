// Finder: "On rChiv" (saved searches with alerts, saved pieces, new matches) and
// "Japan" (brand search across Japanese secondhand markets, from jpbot).
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Switch, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { PieceImage } from '@/components/piece-image';
import { Screen, TitleBar } from '@/components/screen';
import { Chip, Divider, Glass, IconButton, SectionLabel, Segmented, Txt } from '@/components/ui';
import { pieceLine } from '@/data/mock';
import { ago, listBrands, searchJapan, yen, type JapanBrand, type JapanListing, type JapanResult } from '@/lib/finder-japan';
import { setJapanSelection } from '@/lib/japan-selection';
import { useStore } from '@/store/app-store';
import { usePalette } from '@/theme';

type Tab = 'rchiv' | 'japan';

export default function Finder() {
  const [tab, setTab] = useState<Tab>('rchiv');
  const [refreshing, setRefreshing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const c = usePalette();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setReloadKey((k) => k + 1);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  return (
    <Screen
      header={<TitleBar title="Finder" />}
      scrollProps={{ refreshControl: <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.textSecondary} />, keyboardShouldPersistTaps: 'handled' }}>
      <Segmented options={[{ id: 'rchiv', label: 'On rChiv' }, { id: 'japan', label: 'Japan' }]} value={tab} onChange={setTab} style={{ marginBottom: 14 }} />
      {tab === 'rchiv' ? <OnRchiv /> : <Japan reloadKey={reloadKey} />}
    </Screen>
  );
}

function OnRchiv() {
  const { state, dispatch } = useStore();
  const c = usePalette();
  const [q, setQ] = useState('');
  const saved = state.pieces.filter((p) => state.wants[p.id]);
  const matches = q.trim()
    ? state.pieces.filter((p) => `${p.title} ${p.brand ?? ''} ${p.look ?? ''}`.toLowerCase().includes(q.trim().toLowerCase()))
    : state.pieces.filter((p) => /flare|fur|ifsix/i.test(p.title + (p.brand ?? ''))).slice(0, 4);

  return (
    <>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Glass style={{ flex: 1, height: 44, borderRadius: 22, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 8 }}>
          <Icon name="search" size={18} color={c.textSecondary} />
          <TextInput value={q} onChangeText={setQ} placeholder="Brand, piece, season, look" placeholderTextColor={c.textSecondary} accessibilityLabel="Search rChiv" style={{ flex: 1, color: c.text, fontSize: 16 }} />
        </Glass>
        <IconButton label="Search by photo" size={44}><Icon name="camera" size={20} color={c.text} /></IconButton>
      </View>

      {!q && (
        <>
          <SectionLabel>Saved searches</SectionLabel>
          <Glass style={{ borderRadius: 20 }}>
            {state.searches.map((s, k) => (
              <View key={s.id}>
                {k > 0 && <Divider />}
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 }}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                      <Txt kind="label">{s.name}</Txt>
                      {s.fresh > 0 && <Txt kind="tiny" color={c.accent}>{s.fresh} new</Txt>}
                    </View>
                    <Txt kind="small" muted>{s.criteria}</Txt>
                  </View>
                  <Switch value={s.alerts} onValueChange={() => dispatch({ type: 'toggleAlerts', id: s.id })} trackColor={{ true: '#6F97D6', false: 'rgba(118,122,132,0.22)' }} thumbColor="#FFFFFF" {...({ activeThumbColor: "#FFFFFF" } as object)} accessibilityLabel={`Alerts for ${s.name}`} />
                </View>
              </View>
            ))}
          </Glass>

          <SectionLabel right={<Txt kind="small" muted>{saved.length}</Txt>}>Saved pieces</SectionLabel>
          {saved.length === 0 ? (
            <Txt kind="small" muted style={{ marginHorizontal: 4 }}>Tap the heart on any piece, or swipe right in Home, to save it here.</Txt>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {saved.map((p) => (
                <Pressable key={p.id} onPress={() => router.push(`/piece/${p.id}`)} accessibilityLabel={p.title} style={{ width: 104, gap: 4 }}>
                  <PieceImage piece={p} glyph={false} style={{ height: 130, borderRadius: 16 }} />
                  <Txt kind="tiny" numberOfLines={1}>{p.title}</Txt>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </>
      )}

      <SectionLabel>{q ? `${matches.length} results` : 'New matches'}</SectionLabel>
      <Glass style={{ borderRadius: 20 }}>
        {matches.map((p, k) => (
          <View key={p.id}>
            {k > 0 && <Divider />}
            <Pressable onPress={() => router.push(`/piece/${p.id}`)} style={{ flexDirection: 'row', gap: 12, padding: 12, alignItems: 'center' }}>
              <PieceImage piece={p} glyph={false} style={{ width: 56, height: 56, borderRadius: 12 }} />
              <View style={{ flex: 1 }}>
                <Txt kind="label" numberOfLines={1}>{p.title}</Txt>
                <Txt kind="small" muted numberOfLines={1}>{pieceLine(p)}</Txt>
              </View>
              <Icon name="chevron" size={16} color={c.textSecondary} />
            </Pressable>
          </View>
        ))}
        {matches.length === 0 && <Txt muted style={{ padding: 16 }}>No pieces match yet. Save this search to get an alert.</Txt>}
      </Glass>
    </>
  );
}

function Japan({ reloadKey }: { reloadKey: number }) {
  const { state, dispatch } = useStore();
  const c = usePalette();
  const [brand, setBrand] = useState<string>('All');
  const [result, setResult] = useState<JapanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDoubt, setShowDoubt] = useState(false);
  const [adding, setAdding] = useState(false);
  const [allBrands, setAllBrands] = useState<JapanBrand[]>([]);
  const followed = state.japanBrands;

  useEffect(() => {
    let live = true;
    setLoading(true);
    searchJapan(followed).then((r) => {
      if (!live) return;
      setResult(r);
      setLoading(false);
    });
    return () => { live = false; };
  }, [followed, reloadKey]);

  useEffect(() => { listBrands().then(setAllBrands); }, []);

  const inBrand = (l: JapanListing) => brand === 'All' || l.brand === brand;
  const listings = (result?.listings ?? []).filter((l) => !l.doubtful && inBrand(l));
  const doubtful = (result?.listings ?? []).filter((l) => l.doubtful && inBrand(l));

  const open = (l: JapanListing) => {
    setJapanSelection(l);
    router.push(`/japan/${l.id}`);
  };

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 24 }} style={{ marginHorizontal: -16, paddingLeft: 16 }}>
        {['All', ...followed].map((b) => <Chip key={b} label={b} on={brand === b} onPress={() => setBrand(b)} />)}
        <Chip label={adding ? 'Done' : '+ Brand'} onPress={() => setAdding(!adding)} />
      </ScrollView>

      {adding && (
        <Glass style={{ borderRadius: 20, marginTop: 12 }}>
          {allBrands.map((b, k) => {
            const on = followed.includes(b.name);
            return (
              <View key={b.name}>
                {k > 0 && <Divider />}
                <Pressable onPress={() => dispatch({ type: 'toggleJapanBrand', brand: b.name })} accessibilityRole="checkbox" accessibilityState={{ checked: on }} style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Txt kind="label">{b.name}</Txt>
                    <Txt kind="small" muted>{b.jp.join(' · ')}</Txt>
                  </View>
                  <Txt kind="label" color={on ? c.textSecondary : c.accent}>{on ? 'Following' : 'Follow'}</Txt>
                </Pressable>
              </View>
            );
          })}
        </Glass>
      )}

      {result?.source === 'sample' && !loading && (
        <Glass style={{ borderRadius: 16, padding: 12, marginTop: 12, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <Icon name="globe" size={18} color={c.textSecondary} />
          <Txt kind="small" muted style={{ flex: 1, lineHeight: 17 }}>Sample results. Start the Finder Japan service to see live listings (see README).</Txt>
        </Glass>
      )}

      <SectionLabel right={loading ? <ActivityIndicator size="small" /> : result ? <Txt kind="small" muted>{result.source === 'live' ? `Live · ${ago(result.fetchedAt / 1000)}` : 'Sample'}</Txt> : null}>
        {loading ? 'Searching Japan…' : `${listings.length} new since you last looked`}
      </SectionLabel>

      <Glass style={{ borderRadius: 20 }}>
        {listings.map((l, k) => (
          <View key={l.id}>
            {k > 0 && <Divider />}
            <ListingRow l={l} onPress={() => open(l)} />
          </View>
        ))}
        {!loading && listings.length === 0 && <Txt muted style={{ padding: 16 }}>Nothing new for these brands right now.</Txt>}
      </Glass>

      {doubtful.length > 0 && (
        <>
          <Pressable onPress={() => setShowDoubt(!showDoubt)} accessibilityRole="button" accessibilityState={{ expanded: showDoubt }}>
            <SectionLabel right={<Txt kind="small" muted>{doubtful.length} {showDoubt ? 'shown' : 'hidden'}</Txt>}>Probably not the real brand</SectionLabel>
          </Pressable>
          {showDoubt ? (
            <Glass style={{ borderRadius: 20 }}>
              {doubtful.map((l, k) => (
                <View key={l.id}>
                  {k > 0 && <Divider />}
                  <ListingRow l={l} onPress={() => open(l)} />
                </View>
              ))}
            </Glass>
          ) : (
            <Txt kind="small" muted style={{ marginHorizontal: 4, lineHeight: 17 }}>
              Listings that only mention the brand as a style (風, 系, っぽ) or "for fans of" (好きな方) are hidden. Tap to review them.
            </Txt>
          )}
        </>
      )}
    </>
  );
}

function ListingRow({ l, onPress }: { l: JapanListing; onPress: () => void }) {
  const c = usePalette();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => ({ flexDirection: 'row', gap: 12, padding: 12, alignItems: 'center', opacity: pressed ? 0.7 : 1 })}>
      <PieceImage piece={{ photo: l.image, tone: l.id.charCodeAt(0) + l.id.charCodeAt(1), title: l.title }} glyph={false} style={{ width: 60, height: 60, borderRadius: 12 }} />
      <View style={{ flex: 1, gap: 2 }}>
        <Txt kind="label" numberOfLines={2}>{l.title}</Txt>
        <Txt kind="small" muted numberOfLines={1}>{l.market} · {ago(l.created)}{l.reason ? ` · ${l.reason}` : ''}</Txt>
      </View>
      <Txt kind="label" color={l.doubtful ? c.textSecondary : c.text}>{yen(l.price_jpy)}</Txt>
    </Pressable>
  );
}
