import 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { InfoCard } from './src/components/InfoCard';
import { PrimaryButton } from './src/components/PrimaryButton';
import { ComponentGalleryScreen } from './src/screens/ComponentGalleryScreen';
import { YinYangScreen } from './src/screens/YinYangScreen';
import { ConstellationScreen } from './src/screens/ConstellationScreen';
import { colors, radius, spacing, typography } from './src/theme/tokens';

type RouteKey = 'home' | 'gallery' | 'buttons' | 'cards' | 'yin-yang' | 'constellations';

const routes: { key: RouteKey; label: string; description: string }[] = [
  {
    key: 'gallery',
    label: 'Full Gallery',
    description: 'Browse all current component previews in one page.',
  },
  {
    key: 'buttons',
    label: 'Buttons',
    description: 'Focus only on button states and interactions.',
  },
  {
    key: 'cards',
    label: 'Cards',
    description: 'Review card layouts and content patterns.',
  },
  {
    key: 'yin-yang',
    label: 'Yin-Yang Meditation',
    description: 'A contemplative, animated yin-yang composition for mobile and web.',
  },
  {
    key: 'constellations',
    label: 'Constellation Splash',
    description: 'Two zodiac constellations revealed in sequence — a Western astrology motif.',
  },
];

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<RouteKey>('home');
  const [buttonClicks, setButtonClicks] = useState(0);

  const buttonClickLabel = useMemo(() => {
    if (buttonClicks === 0) return 'No button interactions yet';
    if (buttonClicks === 1) return '1 button interaction';
    return `${buttonClicks} button interactions`;
  }, [buttonClicks]);

  const showHome = currentRoute === 'home';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.topBar}>
        <Text style={styles.brand}>UI Component Navigator</Text>
        {!showHome ? (
          <Pressable accessibilityRole="button" onPress={() => setCurrentRoute('home')} style={styles.backButton}>
            <Text style={styles.backButtonLabel}>Back to Menu</Text>
          </Pressable>
        ) : null}
      </View>

      {showHome ? (
        <ScrollView contentContainerStyle={styles.menuContent}>
          <InfoCard
            title="Component Workspace"
            description="Use this page as your navigation hub to open focused preview areas while building reusable UI parts."
          />

          <View style={styles.menuGrid}>
            {routes.map((route) => (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                onPress={() => setCurrentRoute(route.key)}
                style={({ pressed }) => [styles.menuTile, pressed ? styles.menuTilePressed : null]}
              >
                <Text style={styles.menuTitle}>{route.label}</Text>
                <Text style={styles.menuDescription}>{route.description}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      ) : null}

      {currentRoute === 'gallery' ? <ComponentGalleryScreen /> : null}

      {currentRoute === 'buttons' ? (
        <ScrollView contentContainerStyle={styles.previewContent}>
          <Text style={styles.previewTitle}>Buttons</Text>
          <View style={styles.buttonRow}>
            <PrimaryButton label="Primary" onPress={() => setButtonClicks((count) => count + 1)} />
            <PrimaryButton label="Disabled" disabled />
          </View>
          <Text style={styles.previewCaption}>{buttonClickLabel}</Text>
        </ScrollView>
      ) : null}

      {currentRoute === 'cards' ? (
        <ScrollView contentContainerStyle={styles.previewContent}>
          <Text style={styles.previewTitle}>Cards</Text>
          <InfoCard
            title="Product Card"
            description="Use this preview area to test spacing, typography, and action hierarchy before exporting components to another project."
            footer={<PrimaryButton label="Card Action" onPress={() => setButtonClicks((count) => count + 1)} />}
          />
        </ScrollView>
      ) : null}

      {currentRoute === 'yin-yang' ? <YinYangScreen /> : null}
      {currentRoute === 'constellations' ? <ConstellationScreen /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  topBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  brand: {
    color: colors.ink,
    fontSize: typography.subtitle,
    fontWeight: '700',
    flexShrink: 1,
  },
  backButton: {
    backgroundColor: '#F1ECE3',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  backButtonLabel: {
    color: colors.ink,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  menuContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  menuGrid: {
    gap: spacing.md,
  },
  menuTile: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  menuTilePressed: {
    opacity: 0.8,
  },
  menuTitle: {
    color: colors.ink,
    fontSize: typography.subtitle,
    fontWeight: '700',
  },
  menuDescription: {
    color: colors.mutedInk,
    fontSize: typography.body,
    lineHeight: 24,
  },
  previewContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  previewTitle: {
    color: colors.ink,
    fontSize: typography.title,
    fontWeight: '700',
  },
  previewCaption: {
    color: colors.mutedInk,
    fontSize: typography.caption,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
});
