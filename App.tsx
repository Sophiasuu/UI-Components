import 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Image, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { InfoCard } from './src/components/InfoCard';
import { PrimaryButton } from './src/components/PrimaryButton';
import { ComponentGalleryScreen } from './src/screens/ComponentGalleryScreen';
import { YinYangScreen } from './src/screens/YinYangScreen';
import { ConstellationScreen } from './src/screens/ConstellationScreen';
import { VedicScreen } from './src/screens/VedicScreen';
import { NumerologyScreen } from './src/screens/NumerologyScreen';
import { SplooshScreen } from './src/screens/SplooshScreen';
import { TentacleScreen } from './src/screens/TentacleScreen';
import { LumenOrbitScreen } from './src/screens/LumenOrbitScreen';
import { SineRibbonScreen } from './src/screens/SineRibbonScreen';
import { BreathPulseScreen } from './src/screens/BreathPulseScreen';
import { OceanScreen } from './src/screens/OceanScreen';
import { colors, radius, spacing, typography } from './src/theme/tokens';

type RouteKey = 'home' | 'gallery' | 'buttons' | 'cards' | 'yin-yang' | 'constellations' | 'vedic' | 'numerology' | 'sploosh' | 'tentacle' | 'lumen-orbit' | 'sine-ribbon' | 'breath-pulse' | 'ocean-personality';

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
      {
        key: 'sploosh',
        label: 'Bounce Sploosh',
        description: 'Rigid impacts that dissolve into a fluid surface ripple.',
      },
      {
        key: 'tentacle',
        label: 'Energy Tentacle',
        description: 'A calm glowing chain with elastic follow-through and tapered motion.',
      },
      {
        key: 'lumen-orbit',
        label: 'Lumen Orbit',
        description: 'Three drifting lights in layered orbital motion.',
      },
      {
        key: 'sine-ribbon',
        label: 'Sine Ribbon',
        description: 'A living wave line with flowing harmonic drift.',
      },
      {
        key: 'breath-pulse',
        label: 'Breath Pulse',
        description: 'Concentric circles that expand and settle like breath.',
      },
      {
        key: 'ocean-personality',
        label: 'OCEAN Personality',
        description: 'Deep-sea radar card with 6-scene cinematic reveal.',
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

function renderPanelThumbnail(routeKey: RouteKey) {
  switch (routeKey) {
    case 'yin-yang':
      return (
        <View style={styles.thumbCanvas}>
          <Image source={require('./src/assets/Yinyang.png')} style={styles.thumbAssetImage} resizeMode="contain" />
        </View>
      );
    case 'constellations':
      return (
        <View style={styles.thumbCanvas}>
          <Image source={require('./src/assets/westernastrology.png')} style={styles.thumbAssetImage} resizeMode="contain" />
        </View>
      );
    case 'vedic':
      return (
        <View style={styles.thumbCanvas}>
          <Image source={require('./src/assets/vediclotus.png')} style={styles.thumbAssetImage} resizeMode="contain" />
        </View>
      );
    case 'numerology':
      return (
        <View style={styles.thumbCanvas}>
          <Image source={require('./src/assets/numerology.png')} style={styles.thumbAssetImage} resizeMode="contain" />
        </View>
      );
    case 'sploosh':
      return (
        <View style={styles.thumbCanvas}>
          <Image source={require('./src/assets/bouncesplash.png')} style={styles.thumbAssetImage} resizeMode="contain" />
        </View>
      );
    case 'tentacle':
      return (
        <View style={styles.thumbCanvas}>
          <Image source={require('./src/assets/energytentacle.png')} style={styles.thumbAssetImage} resizeMode="contain" />
        </View>
      );
    case 'lumen-orbit':
      return (
        <View style={styles.thumbCanvas}>
          <Image source={require('./src/assets/lumenorbit.png')} style={styles.thumbAssetImage} resizeMode="contain" />
        </View>
      );
    case 'sine-ribbon':
      return (
        <View style={styles.thumbCanvas}>
          <Image source={require('./src/assets/waves hold a line.png')} style={styles.thumbAssetImage} resizeMode="contain" />
        </View>
      );
    case 'breath-pulse':
      return (
        <View style={styles.thumbCanvas}>
          <Image source={require('./src/assets/breathingpulse.png')} style={styles.thumbAssetImage} resizeMode="contain" />
        </View>
      );
    case 'ocean-personality':
      return (
        <View style={[styles.thumbCanvas, { backgroundColor: '#010E1E' }]}>
          <View style={styles.thumbOceanPentagon} />
          <View style={styles.thumbOceanDot} />
        </View>
      );
    case 'buttons':
      return (
        <View style={styles.thumbCanvas}>
          <View style={styles.thumbButtonPrimary} />
          <View style={styles.thumbButtonGhost} />
        </View>
      );
    case 'cards':
      return (
        <View style={styles.thumbCanvas}>
          <View style={styles.thumbCardPreview}>
            <View style={styles.thumbCardLineLong} />
            <View style={styles.thumbCardLineShort} />
          </View>
        </View>
      );
    case 'gallery':
      return (
        <View style={styles.thumbCanvas}>
          <View style={styles.thumbGalleryGrid}>
            <View style={styles.thumbGalleryCell} />
            <View style={styles.thumbGalleryCell} />
            <View style={styles.thumbGalleryCell} />
            <View style={styles.thumbGalleryCell} />
          </View>
        </View>
      );
    default:
      return null;
  }
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<RouteKey>('home');
  const [buttonClicks, setButtonClicks] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const buttonClickLabel = useMemo(() => {
    if (buttonClicks === 0) return 'No button interactions yet';
    if (buttonClicks === 1) return '1 button interaction';
    return `${buttonClicks} button interactions`;
  }, [buttonClicks]);

  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sections;

    return sections
      .map((section) => {
        const sectionMatch = section.title.toLowerCase().includes(query) || section.subtitle.toLowerCase().includes(query);
        const items = section.items.filter((item) => {
          return (
            item.label.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.key.toLowerCase().includes(query)
          );
        });

        if (sectionMatch) return section;
        return { ...section, items };
      })
      .filter((section) => section.items.length > 0);
  }, [searchQuery]);

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
            <Text style={styles.heroTitle}>Sophia's UI Component Library</Text>
            <Text style={styles.heroSub}>Design workspace for component exploration</Text>
          </View>

          <View style={styles.searchWrap}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search components"
              placeholderTextColor="rgba(46,42,39,0.45)"
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>

          {filteredSections.map((section) => (
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
                    <View style={styles.menuTileHeader}>
                      <Text style={styles.menuMeta}>{section.title}</Text>
                      <Text style={styles.menuAction}>Open</Text>
                    </View>
                    {renderPanelThumbnail(route.key)}
                    <View style={styles.menuTileBody}>
                      <Text style={styles.menuTitle}>{route.label}</Text>
                      <Text style={styles.menuDescription}>{route.description}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}

          {filteredSections.length === 0 ? (
            <View style={styles.emptySearchState}>
              <Text style={styles.emptySearchTitle}>No matches found</Text>
              <Text style={styles.emptySearchSubtitle}>Try a different keyword.</Text>
            </View>
          ) : null}
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
      {currentRoute === 'sploosh' ? <SplooshScreen /> : null}
      {currentRoute === 'tentacle' ? <TentacleScreen /> : null}
      {currentRoute === 'lumen-orbit' ? <LumenOrbitScreen /> : null}
      {currentRoute === 'sine-ribbon' ? <SineRibbonScreen /> : null}
      {currentRoute === 'breath-pulse' ? <BreathPulseScreen /> : null}
      {currentRoute === 'ocean-personality' ? <OceanScreen /> : null}
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
    backgroundColor: '#D9D9D9',
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
    maxWidth: 1120,
    width: '100%',
    alignSelf: 'center',
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
  searchWrap: {
    marginTop: -2,
  },
  searchInput: {
    backgroundColor: '#FFFDF8',
    borderWidth: 1,
    borderColor: '#E8E5E0',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: typography.body,
    color: '#2E2A27',
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  menuTile: {
    backgroundColor: '#FFFDF8',
    borderWidth: 1,
    borderColor: '#E8E5E0',
    borderRadius: radius.lg,
    paddingVertical: 16,
    paddingHorizontal: spacing.md,
    minHeight: 208,
    flexBasis: 280,
    flexGrow: 1,
    justifyContent: 'space-between',
    shadowColor: '#2D2A27',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  menuTilePressed: {
    backgroundColor: '#F5F2ED',
    borderColor: '#DAD2C6',
  },
  menuTileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuTileBody: {
    gap: spacing.xs,
  },
  thumbCanvas: {
    height: 120,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(31, 28, 24, 0.08)',
    backgroundColor: '#FAF8F3',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbAssetImage: {
    width: '100%',
    height: '100%',
  },
  thumbYinYangOuter: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#2D2926',
  },
  thumbYinHalf: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 24,
    height: 48,
    backgroundColor: '#F6F3EE',
  },
  thumbYangHalf: {
    position: 'absolute',
    left: 24,
    top: 0,
    width: 24,
    height: 48,
    backgroundColor: '#2D2926',
  },
  thumbYinDot: {
    position: 'absolute',
    left: 16,
    top: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2D2926',
  },
  thumbYangDot: {
    position: 'absolute',
    left: 24,
    top: 29,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F6F3EE',
  },
  thumbConstellationLineA: {
    position: 'absolute',
    width: 46,
    height: 1,
    backgroundColor: 'rgba(46, 42, 39, 0.34)',
    left: 24,
    top: 24,
    transform: [{ rotate: '8deg' }],
  },
  thumbConstellationLineB: {
    position: 'absolute',
    width: 42,
    height: 1,
    backgroundColor: 'rgba(46, 42, 39, 0.34)',
    left: 60,
    top: 32,
    transform: [{ rotate: '-12deg' }],
  },
  thumbConstellationLineC: {
    position: 'absolute',
    width: 34,
    height: 1,
    backgroundColor: 'rgba(46, 42, 39, 0.34)',
    left: 88,
    top: 24,
    transform: [{ rotate: '14deg' }],
  },
  thumbStar: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#2E2A27',
  },
  thumbLotusOuter: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: 'rgba(182, 138, 72, 0.32)',
  },
  thumbLotusMid: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(182, 138, 72, 0.45)',
  },
  thumbLotusCore: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#B68A48',
    opacity: 0.74,
  },
  thumbMeshGrid: {
    width: 64,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  thumbMeshDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(60, 84, 69, 0.75)',
  },
  thumbSplooshBall: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2E2A27',
    top: 18,
  },
  thumbSplooshLine: {
    position: 'absolute',
    width: 96,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(46, 42, 39, 0.9)',
    bottom: 19,
  },
  thumbTentacleHead: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(126, 223, 199, 0.92)',
    right: 42,
    top: 16,
  },
  thumbTentacleMid: {
    position: 'absolute',
    width: 48,
    height: 14,
    borderRadius: 9,
    backgroundColor: 'rgba(86, 181, 157, 0.6)',
    right: 58,
    top: 28,
    transform: [{ rotate: '14deg' }],
  },
  thumbTentacleTail: {
    position: 'absolute',
    width: 38,
    height: 10,
    borderRadius: 7,
    backgroundColor: 'rgba(86, 181, 157, 0.36)',
    right: 90,
    top: 38,
    transform: [{ rotate: '20deg' }],
  },
  thumbLumenRingA: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 1,
    borderColor: 'rgba(36, 66, 56, 0.18)',
  },
  thumbLumenRingB: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    borderColor: 'rgba(36, 66, 56, 0.14)',
  },
  thumbLumenDotA: {
    position: 'absolute',
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#1F4037',
    top: 24,
    left: 48,
  },
  thumbLumenDotB: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#729C8B',
    bottom: 24,
    right: 46,
  },
  thumbLumenDotC: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#B4CCBF',
    top: 52,
    right: 62,
  },
  thumbRibbonBase: {
    position: 'absolute',
    width: 98,
    height: 26,
    borderRadius: 16,
    backgroundColor: 'rgba(49,73,63,0.16)',
    transform: [{ rotate: '-8deg' }],
  },
  thumbRibbonLine: {
    position: 'absolute',
    width: 86,
    height: 8,
    borderRadius: 5,
    backgroundColor: 'rgba(49,73,63,0.72)',
    transform: [{ rotate: '-8deg' }],
  },
  thumbPulseOuter: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: 'rgba(42,69,58,0.24)',
  },
  thumbPulseMid: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'rgba(42,69,58,0.32)',
  },
  thumbPulseCore: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#2A453A',
  },
  thumbOceanPentagon: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(133,183,235,0.45)',
    borderRadius: 4,
    transform: [{ rotate: '0deg' }],
  },
  thumbOceanDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#85B7EB',
  },
  thumbButtonPrimary: {
    position: 'absolute',
    width: 72,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    top: 20,
  },
  thumbButtonGhost: {
    position: 'absolute',
    width: 60,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(26, 107, 82, 0.42)',
    bottom: 18,
  },
  thumbCardPreview: {
    width: 90,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(31, 28, 24, 0.12)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 8,
  },
  thumbCardLineLong: {
    width: '80%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(31, 28, 24, 0.24)',
  },
  thumbCardLineShort: {
    width: '54%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(31, 28, 24, 0.18)',
  },
  thumbGalleryGrid: {
    width: 82,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  thumbGalleryCell: {
    width: 36,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(31, 28, 24, 0.12)',
    backgroundColor: '#FFFFFF',
  },
  menuMeta: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  menuAction: {
    color: 'rgba(46,42,39,0.45)',
    fontSize: typography.caption,
  },
  menuTitle: {
    color: '#2E2A27',
    fontSize: typography.subtitle,
    fontWeight: '600',
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  menuDescription: {
    color: colors.mutedInk,
    fontSize: typography.caption,
    lineHeight: 20,
  },
  emptySearchState: {
    borderWidth: 1,
    borderColor: '#E8E5E0',
    borderRadius: radius.md,
    backgroundColor: '#FFFDF8',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
    alignItems: 'center',
  },
  emptySearchTitle: {
    color: '#2E2A27',
    fontSize: typography.body,
    fontWeight: '600',
  },
  emptySearchSubtitle: {
    color: colors.mutedInk,
    fontSize: typography.caption,
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
