import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { InfoCard } from '../components/InfoCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { PromoSection } from '../components/PromoSection';
import SplooshBounce from '../components/Surface/SplooshBounce';
import { colors, radius, spacing, typography } from '../theme/tokens';

export function ComponentGalleryScreen() {
  const [clicks, setClicks] = useState(0);

  const clickLabel = useMemo(() => {
    if (clicks === 0) return 'No clicks yet';
    if (clicks === 1) return '1 click';
    return `${clicks} clicks`;
  }, [clicks]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>UI COMPONENT LAB</Text>
        <Text style={styles.title}>Expo + React Native Web Design Workspace</Text>
        <Text style={styles.subtitle}>
          Build and refine reusable UI components here, then copy them into product projects.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Motion</Text>
        <View style={styles.motionPreview}>
          <Text style={styles.motionTitle}>Bounce Into Sploosh</Text>
          <Text style={styles.motionCaption}>
            Two clean rebounds give way to a soft liquid ripple on the third impact.
          </Text>
          <SplooshBounce size={280} showMessage={false} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Buttons</Text>
        <View style={styles.row}>
          <PrimaryButton label="Primary Action" onPress={() => setClicks((v) => v + 1)} />
          <PrimaryButton label="Disabled" disabled />
        </View>
        <Text style={styles.caption}>{clickLabel}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cards</Text>
        <InfoCard
          title="Feature Card"
          description="A simple card component for previews. Treat each section in this project as a mini catalog entry for a UI pattern."
          footer={<PrimaryButton label="Card CTA" onPress={() => setClicks((v) => v + 1)} />}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Promo</Text>
        <PromoSection />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  eyebrow: {
    fontSize: typography.caption,
    color: colors.accent,
    letterSpacing: 1.6,
    fontWeight: '700',
  },
  title: {
    fontSize: typography.title,
    color: colors.ink,
    fontWeight: '700',
    lineHeight: 38,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.mutedInk,
    lineHeight: 24,
    maxWidth: 700,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: typography.subtitle,
    fontWeight: '700',
  },
  motionPreview: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
    overflow: 'hidden',
  },
  motionTitle: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: '600',
  },
  motionCaption: {
    color: colors.mutedInk,
    fontSize: typography.caption,
    lineHeight: 18,
    maxWidth: 520,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    alignItems: 'center',
  },
  caption: {
    fontSize: typography.caption,
    color: colors.mutedInk,
  },
});
