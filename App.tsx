import 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { InfoCard } from './src/components/InfoCard';
import { PrimaryButton } from './src/components/PrimaryButton';
import { ComponentGalleryScreen } from './src/screens/ComponentGalleryScreen';
import { YinYangScreen } from './src/screens/YinYangScreen';
import { ConstellationScreen } from './src/screens/ConstellationScreen';
import { VedicScreen } from './src/screens/VedicScreen';
import { NumerologyScreen } from './src/screens/NumerologyScreen';
import { colors, radius, spacing, typography } from './src/theme/tokens';

type RouteKey = 'home' | 'gallery' | 'buttons' | 'cards' | 'yin-yang' | 'constellations' | 'vedic' | 'numerology';

type RouteItem = { key: RouteKey; label: string; description: string };

type Section = {
  title: string;
  subtitle: string;
  items: RouteItem[];
};

const sections: Section[] = [
  {
    title: 'Splash & Animation',
    subtitle: 'Immersive entry experiences',
    items: [
      {
        key: 'yin-yang',
        label: 'Yin-Yang Meditation',
        description: 'Contemplative animated composition.',
      },
      {
        key: 'constellations',
        label: 'Constellation Splash',
        description: 'Western astrology star reveal.',
      },
      {
        key: 'vedic',
        label: 'Vedic Lotus',
        description: 'Tiered lotus bloom for Vedic astrology.',
      },
      {
        key: 'numerology',
        label: 'Numerology Mesh',
        description: 'Alchemical life path number reveal.',
      },
    ],
  },
  {
    title: 'UI Primitives',
    subtitle: 'Building blocks & patterns',
    items: [
      {
        key: 'buttons',
        label: 'Buttons',
        description: 'States, interactions, and disabled variants.',
      },
      {
        key: 'cards',
        label: 'Cards',
        description: 'Content layout and action hierarchy.',
      },
      {
        key: 'gallery',
        label: 'Full Gallery',
        description: 'Browse all component previews in one page.',
      },
    ],
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
        {!showHome ? (
          <Pressable accessibilityRole="button" onPress={() => setCurrentRoute('home')} style={styles.backButton}>
            <Text style={styles.backButtonLabel}>← Back</Text>
          </Pressable>
        ) : <View />}
      </View>

      {showHome ? (
        <ScrollView contentContainerStyle={styles.menuContent}>
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>UI Components</Text>
            <Text style={styles.heroSub}>Design workspace for component exploration</Text>
          </View>

          {sections.map((section) => (
            <View key={section.title} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionSub}>{section.subtitle}</Text>
              </View>
              <View style={styles.sectionGrid}>
                {section.items.map((route) => (
                  <Pressable
                    key={route.key}
                    accessibilityRole="button"
                    onPress={() => setCurrentRoute(route.key)}
                    style={({ pressed }) => [styles.menuTile, pressed && styles.menuTilePressed]}
                  >
                    <Text style={styles.menuTitle}>{route.label}</Text>
                    <Text style={styles.menuDescription}>{route.description}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
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
      {currentRoute === 'vedic' ? <VedicScreen /> : null}
      {currentRoute === 'numerology' ? <NumerologyScreen /> : null}
    </SafeAreaView>
  );
}

const serifFont = Platform.select({
  web: '"Cormorant Garamond", serif',
  default: 'serif',
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F5',
  },
  topBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  backButtonLabel: {
    color: colors.mutedInk,
    fontSize: typography.body,
    fontWeight: '500',
  },
  menuContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  hero: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    gap: 6,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: '#2E2A27',
    letterSpacing: 0.4,
    fontFamily: serifFont,
  },
  heroSub: {
    fontSize: typography.body,
    color: colors.mutedInk,
    letterSpacing: 0.2,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    gap: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.mutedInk,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  sectionSub: {
    fontSize: typography.caption,
    color: 'rgba(94,87,79,0.6)',
  },
  sectionGrid: {
    gap: spacing.sm,
  },
  menuTile: {
    backgroundColor: '#FFFDF8',
    borderWidth: 1,
    borderColor: '#E8E5E0',
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    gap: 4,
  },
  menuTilePressed: {
    backgroundColor: '#F5F2ED',
  },
  menuTitle: {
    color: '#2E2A27',
    fontSize: typography.body,
    fontWeight: '600',
    letterSpacing: 0.15,
  },
  menuDescription: {
    color: colors.mutedInk,
    fontSize: typography.caption,
    lineHeight: 18,
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
