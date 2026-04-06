import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/tokens';

type InfoCardProps = {
  title: string;
  description: string;
  footer?: ReactNode;
};

export function InfoCard({ title, description, footer }: InfoCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    shadowColor: '#241F17',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 2,
  },
  title: {
    color: colors.ink,
    fontSize: typography.subtitle,
    fontWeight: '700',
  },
  description: {
    color: colors.mutedInk,
    fontSize: typography.body,
    lineHeight: 24,
  },
  footer: {
    marginTop: spacing.xs,
  },
});
