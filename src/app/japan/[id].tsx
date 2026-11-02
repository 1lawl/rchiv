// Japan listing sheet: original title, price in yen and rough dollars, why it
// was flagged (if it was), and buy-through-a-proxy links.
import * as WebBrowser from 'expo-web-browser';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PieceImage } from '@/components/piece-image';
import { Glass, PrimaryButton, SecondaryButton, Txt } from '@/components/ui';
import { ago, proxyLinks, yen, yenToUsd } from '@/lib/finder-japan';
import { getJapanSelection } from '@/lib/japan-selection';
import { usePalette } from '@/theme';

export default function JapanListingSheet() {
  const l = getJapanSelection();
  const c = usePalette();
  const insets = useSafeAreaInsets();
  if (!l) return null;
  const links = proxyLinks(l);

  return (
    <View style={{ padding: 20, paddingBottom: insets.bottom + 20, gap: 14 }}>
      <View style={{ flexDirection: 'row', gap: 14 }}>
        <PieceImage piece={{ photo: l.image, tone: l.id.charCodeAt(0), title: l.title }} style={{ width: 110, height: 140, borderRadius: 16 }} />
        <View style={{ flex: 1, gap: 4 }}>
          <Txt kind="small" muted>{l.brand} · {l.market}</Txt>
          <Txt kind="heading" style={{ lineHeight: 22 }}>{l.title}</Txt>
          <Txt kind="title" style={{ fontSize: 22, marginTop: 4 }}>{yen(l.price_jpy)}</Txt>
          <Txt kind="small" muted>{yenToUsd(l.price_jpy)} before proxy and shipping · {ago(l.created)}</Txt>
        </View>
      </View>

      {l.doubtful && (
        <Glass style={{ borderRadius: 16, padding: 12 }}>
          <Txt kind="label">Flagged: {l.reason}</Txt>
          <Txt kind="small" muted style={{ marginTop: 2, lineHeight: 17 }}>The title uses the brand name as a style reference, so it is probably not by the brand.</Txt>
        </Glass>
      )}

      <Txt kind="small" muted style={{ lineHeight: 17 }}>
        rChiv does not buy for you. A proxy service buys it in Japan and ships it to you.
      </Txt>
      <PrimaryButton label={`Buy through ${links[0].name}`} onPress={() => WebBrowser.openBrowserAsync(links[0].url)} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <SecondaryButton style={{ flex: 1 }} label={links[1].name} onPress={() => WebBrowser.openBrowserAsync(links[1].url)} />
        <SecondaryButton style={{ flex: 1 }} label="Original" onPress={() => WebBrowser.openBrowserAsync(links[2].url)} />
      </View>
      <View style={{ height: 1, backgroundColor: c.divider, opacity: 0 }} />
    </View>
  );
}
