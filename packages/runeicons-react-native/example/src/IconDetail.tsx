import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { RuneIconComponent, RuneIconStyle } from 'runeicons-react-native';
import type { RuneIconMeta } from 'runeicons-react-native';

import { radius, space, type Theme } from './theme';

type Props = {
  icon: (RuneIconMeta & { slug: string; Component: RuneIconComponent }) | null;
  style: RuneIconStyle;
  color: string;
  secondaryColor: string;
  theme: Theme;
  onClose: () => void;
};

const pascal = (slug: string) =>
  slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');

export function IconDetail({
  icon,
  style,
  color,
  secondaryColor,
  theme,
  onClose,
}: Props) {
  const name = icon ? pascal(icon.slug) : '';

  return (
    <Modal
      visible={icon !== null}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.sheet, { backgroundColor: theme.background }]}>
        <View style={styles.grabberRow}>
          <View style={[styles.grabber, { backgroundColor: theme.border }]} />
        </View>

        {icon ? (
          <ScrollView
            contentContainerStyle={styles.content}
            contentInsetAdjustmentBehavior="automatic"
          >
            <View
              style={[
                styles.hero,
                { backgroundColor: theme.muted, borderColor: theme.border },
              ]}
            >
              <icon.Component
                size={96}
                color={color}
                secondaryColor={secondaryColor}
              />
            </View>

            <Text style={[styles.name, { color: theme.foreground }]}>
              {icon.name}
            </Text>
            <Text style={[styles.meta, { color: theme.mutedForeground }]}>
              {icon.category} · {style}
            </Text>

            <Text style={[styles.label, { color: theme.mutedForeground }]}>
              Import
            </Text>
            <Text
              selectable
              style={[
                styles.code,
                {
                  backgroundColor: theme.muted,
                  borderColor: theme.border,
                  color: theme.foreground,
                },
              ]}
            >
              {`import { ${name} } from 'runeicons-react-native';`}
            </Text>

            <Text style={[styles.label, { color: theme.mutedForeground }]}>
              Usage
            </Text>
            <Text
              selectable
              style={[
                styles.code,
                {
                  backgroundColor: theme.muted,
                  borderColor: theme.border,
                  color: theme.foreground,
                },
              ]}
            >
              {`<${name} size={24} color="${color}" />`}
            </Text>

            <Text style={[styles.label, { color: theme.mutedForeground }]}>
              Tags
            </Text>
            <View style={styles.tags}>
              {icon.tags.map((tag) => (
                <View
                  key={tag}
                  style={[
                    styles.tag,
                    { backgroundColor: theme.muted, borderColor: theme.border },
                  ]}
                >
                  <Text
                    style={[styles.tagText, { color: theme.mutedForeground }]}
                  >
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        ) : null}

        <Pressable
          onPress={onClose}
          style={({ pressed }) => [
            styles.close,
            { backgroundColor: theme.foreground, opacity: pressed ? 0.85 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Close icon details"
        >
          <Text style={[styles.closeText, { color: theme.inverseText }]}>
            Done
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1 },
  grabberRow: { alignItems: 'center', paddingTop: space(2.5) },
  grabber: { width: space(9), height: space(1), borderRadius: radius.chip },
  content: { padding: space(5), paddingBottom: space(6), gap: space(2) },
  hero: {
    height: 176,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderCurve: 'continuous',
    marginBottom: space(2),
  },
  name: { fontSize: 24, fontWeight: '700', letterSpacing: -0.4 },
  meta: { fontSize: 14, marginBottom: space(3) },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  code: {
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
    fontSize: 12.5,
    lineHeight: 20,
    padding: space(3),
    borderRadius: radius.input,
    borderWidth: StyleSheet.hairlineWidth,
    borderCurve: 'continuous',
    marginBottom: space(2),
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2) },
  tag: {
    paddingHorizontal: space(2.5),
    paddingVertical: space(1.5),
    borderRadius: radius.chip,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tagText: { fontSize: 12 },
  close: {
    margin: space(5),
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.chip,
  },
  closeText: { fontSize: 16, fontWeight: '600' },
});
