import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

// A gallery is the one screen that legitimately needs every icon, so it imports
// the barrel. Apps that use a handful should import them by name — the package
// tree-shakes, and `runeicons-react-native/<slug>` deep imports work under
// Metro, which does not.
import * as Icons from 'runeicons-react-native';
import type {
  RuneIconComponent,
  RuneIconMeta,
  RuneIconStyle,
} from 'runeicons-react-native';
import { RUNE_ICONS } from 'runeicons-react-native/manifest';

import { IconDetail } from './IconDetail';
import {
  ACCENT_SWATCHES,
  SIZES,
  SWATCHES,
  radius,
  space,
  themes,
} from './theme';

const STYLES: RuneIconStyle[] = [
  'normal',
  'duotone',
  'fill',
  'pixelated',
  'glass',
];
const TWO_TONE: RuneIconStyle[] = ['duotone', 'fill'];

type Entry = RuneIconMeta & { slug: string; Component: RuneIconComponent };

const registry = Icons as unknown as Record<string, RuneIconComponent>;

const pascal = (slug: string) =>
  slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');

/** Icons available in one style, resolved to their components once per style. */
const byStyle = new Map<RuneIconStyle, Entry[]>(
  STYLES.map((style) => [
    style,
    RUNE_ICONS.flatMap((meta) => {
      const slug = meta.styles[style];
      const Component = slug ? registry[pascal(slug)] : undefined;
      return slug && Component ? [{ ...meta, slug, Component }] : [];
    }),
  ])
);

function Gallery() {
  const scheme = useColorScheme();
  const theme = themes[scheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [style, setStyle] = useState<RuneIconStyle>('normal');
  const [query, setQuery] = useState('');
  const [size, setSize] = useState<number>(24);
  const [color, setColor] = useState<string>(SWATCHES[0]);
  const [secondaryColor, setSecondaryColor] = useState<string>(
    ACCENT_SWATCHES[0]
  );
  const [selected, setSelected] = useState<Entry | null>(null);

  const columns = Math.max(3, Math.min(8, Math.floor(width / 92)));
  const twoTone = TWO_TONE.includes(style);
  // Ink reads as ink in both themes; the other swatches are literal.
  const inkAware = color === SWATCHES[0] ? theme.foreground : color;

  const results = useMemo(() => {
    const all = byStyle.get(style) ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.id.includes(q) ||
        i.slug.includes(q) ||
        i.tags.some((t) => t.includes(q))
    );
  }, [style, query]);

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      <FlatList
        data={results}
        key={columns}
        numColumns={columns}
        keyExtractor={(item) => item.slug}
        contentContainerStyle={{
          paddingTop: insets.top + space(2),
          paddingBottom: insets.bottom + space(6),
          paddingHorizontal: space(4),
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        removeClippedSubviews
        windowSize={7}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.foreground }]}>
              Rune Icons
            </Text>
            <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
              {RUNE_ICONS.length} icons · {STYLES.length} styles
            </Text>

            <TextInput
              defaultValue={query}
              onChangeText={setQuery}
              placeholder="Search icons"
              placeholderTextColor={theme.mutedForeground}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              style={[
                styles.search,
                {
                  backgroundColor: theme.muted,
                  borderColor: theme.border,
                  color: theme.foreground,
                },
              ]}
            />

            <ChipRow>
              {STYLES.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  count={byStyle.get(s)?.length ?? 0}
                  active={s === style}
                  theme={theme}
                  onPress={() => setStyle(s)}
                />
              ))}
            </ChipRow>

            <ChipRow>
              {SIZES.map((s) => (
                <Chip
                  key={s}
                  label={`${s}`}
                  active={s === size}
                  theme={theme}
                  onPress={() => setSize(s)}
                />
              ))}
            </ChipRow>

            <ChipRow>
              {SWATCHES.map((c) => (
                <Swatch
                  key={c}
                  color={c === SWATCHES[0] ? theme.foreground : c}
                  active={c === color}
                  theme={theme}
                  onPress={() => setColor(c)}
                />
              ))}
            </ChipRow>

            {twoTone ? (
              <ChipRow>
                {ACCENT_SWATCHES.map((c) => (
                  <Swatch
                    key={c}
                    color={c}
                    active={c === secondaryColor}
                    theme={theme}
                    onPress={() => setSecondaryColor(c)}
                  />
                ))}
              </ChipRow>
            ) : null}

            <Text style={[styles.count, { color: theme.mutedForeground }]}>
              {results.length} {results.length === 1 ? 'icon' : 'icons'}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icons.Search size={32} color={theme.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: theme.foreground }]}>
              Nothing matches “{query.trim()}”
            </Text>
            <Text style={[styles.emptyBody, { color: theme.mutedForeground }]}>
              Try a shorter word, or search by category such as “navigation”.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setSelected(item)}
            style={({ pressed }) => [
              styles.tile,
              {
                backgroundColor: pressed ? theme.cardPressed : theme.card,
                borderColor: theme.border,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${item.name}, ${style}`}
          >
            <View style={styles.tileIcon}>
              <item.Component
                size={size}
                color={inkAware}
                secondaryColor={secondaryColor}
              />
            </View>
            <Text
              numberOfLines={1}
              style={[styles.tileLabel, { color: theme.mutedForeground }]}
            >
              {item.name}
            </Text>
          </Pressable>
        )}
      />

      <IconDetail
        icon={selected}
        style={style}
        color={inkAware}
        secondaryColor={secondaryColor}
        theme={theme}
        onClose={() => setSelected(null)}
      />
    </View>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}
    >
      {children}
    </ScrollView>
  );
}

function Chip({
  label,
  count,
  active,
  theme,
  onPress,
}: {
  label: string;
  count?: number;
  active: boolean;
  theme: (typeof themes)['light'];
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: active ? theme.foreground : theme.muted,
          borderColor: active ? theme.foreground : theme.border,
          opacity: pressed && !active ? 0.7 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text
        style={[
          styles.chipText,
          { color: active ? theme.inverseText : theme.mutedForeground },
        ]}
      >
        {label}
        {count === undefined ? '' : `  ${count}`}
      </Text>
    </Pressable>
  );
}

function Swatch({
  color,
  active,
  theme,
  onPress,
}: {
  color: string;
  active: boolean;
  theme: (typeof themes)['light'];
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={space(2)}
      style={[styles.swatchHit, active && { borderColor: theme.foreground }]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`Colour ${color}`}
    >
      <View
        style={[
          styles.swatch,
          { backgroundColor: color, borderColor: theme.border },
        ]}
      />
    </Pressable>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Gallery />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { gap: space(3), paddingBottom: space(2) },
  title: { fontSize: 34, fontWeight: '700', letterSpacing: -0.8 },
  subtitle: {
    fontSize: 15,
    marginTop: -space(2),
    fontVariant: ['tabular-nums'],
  },
  search: {
    height: 44,
    paddingHorizontal: space(4),
    borderRadius: radius.input,
    borderWidth: StyleSheet.hairlineWidth,
    borderCurve: 'continuous',
    fontSize: 16,
  },
  chipRow: { gap: space(2), paddingRight: space(4) },
  chip: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: space(3.5),
    borderRadius: radius.chip,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
    fontVariant: ['tabular-nums'],
  },
  swatchHit: {
    width: 36,
    height: 36,
    borderRadius: radius.chip,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatch: {
    width: 24,
    height: 24,
    borderRadius: radius.chip,
    borderWidth: StyleSheet.hairlineWidth,
  },
  count: { fontSize: 13, fontVariant: ['tabular-nums'] },
  tile: {
    flex: 1,
    margin: space(1),
    paddingVertical: space(3),
    paddingHorizontal: space(1),
    alignItems: 'center',
    gap: space(2),
    borderRadius: radius.tile,
    borderWidth: StyleSheet.hairlineWidth,
    borderCurve: 'continuous',
  },
  tileIcon: { height: 44, alignItems: 'center', justifyContent: 'center' },
  tileLabel: { fontSize: 11, textAlign: 'center' },
  empty: {
    alignItems: 'center',
    gap: space(2),
    paddingTop: space(16),
    paddingHorizontal: space(8),
  },
  emptyTitle: { fontSize: 17, fontWeight: '600', textAlign: 'center' },
  emptyBody: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
