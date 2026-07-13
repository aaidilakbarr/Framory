import { StyleSheet, View } from 'react-native';

import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from '@/components/themed-text';

export type PhotoStripProps = {
  size?: 'small' | 'large';
  tilt?: 'left' | 'right' | 'none';
};

export function PhotoStrip({ size = 'large', tilt = 'right' }: PhotoStripProps) {
  const theme = useTheme();
  const compact = size === 'small';
  const frames = compact ? [0, 1] : [0, 1, 2];
  const rotation = tilt === 'left' ? '-5deg' : tilt === 'right' ? '5deg' : '0deg';

  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.strip,
        compact ? styles.stripSmall : styles.stripLarge,
        {
          backgroundColor: theme.surfaceRaised,
          borderColor: theme.borderStrong,
          shadowColor: theme.shadow,
          transform: [{ rotate: rotation }],
        },
      ]}>
      {frames.map((frame) => (
        <View
          key={frame}
          style={[
            styles.frame,
            compact ? styles.frameSmall : styles.frameLarge,
            { backgroundColor: theme.action },
          ]}>
          <View
            style={[
              styles.halo,
              compact ? styles.haloSmall : styles.haloLarge,
              { backgroundColor: theme.accent },
            ]}
          />
          <View
            style={[
              styles.head,
              compact ? styles.headSmall : styles.headLarge,
              { backgroundColor: theme.onAction },
            ]}
          />
          <View
            style={[
              styles.shoulders,
              compact ? styles.shouldersSmall : styles.shouldersLarge,
              { backgroundColor: theme.onAction },
            ]}
          />
        </View>
      ))}
      {!compact ? (
        <ThemedText type="mono" themeColor="textTertiary" style={styles.printDate}>
          JUL · 13 · 26
        </ThemedText>
      ) : null}
    </View>
  );
}

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.brandRow} accessibilityRole="header">
      <PhotoStrip size="small" tilt="left" />
      {compact ? null : (
        <View style={styles.wordmarkBlock}>
          <ThemedText style={styles.wordmark}>StampCut</ThemedText>
          <ThemedText type="overline" themeColor="textSecondary" style={styles.tagline}>
            private memory journal
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  wordmarkBlock: {
    gap: 1,
  },
  wordmark: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    lineHeight: 27,
    fontWeight: '700',
    letterSpacing: -0.45,
  },
  tagline: {
    fontSize: 8,
    lineHeight: 11,
    letterSpacing: 1.05,
  },
  strip: {
    borderWidth: 1,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 4,
  },
  stripSmall: {
    width: 38,
    height: 50,
    padding: 3,
    gap: 3,
    borderRadius: Radius.xs,
  },
  stripLarge: {
    width: 94,
    height: 205,
    padding: 8,
    gap: 7,
    borderRadius: Radius.sm,
  },
  frame: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  frameSmall: {
    width: 30,
    height: 19,
    borderRadius: 2,
  },
  frameLarge: {
    width: 76,
    height: 52,
    borderRadius: Radius.xs,
  },
  halo: {
    position: 'absolute',
    borderRadius: Radius.pill,
    opacity: 0.72,
  },
  haloSmall: {
    width: 20,
    height: 20,
    top: -5,
    right: -3,
  },
  haloLarge: {
    width: 58,
    height: 58,
    top: -20,
    right: -12,
  },
  head: {
    position: 'absolute',
    borderRadius: Radius.pill,
    opacity: 0.9,
  },
  headSmall: {
    width: 7,
    height: 7,
    bottom: 7,
  },
  headLarge: {
    width: 20,
    height: 20,
    bottom: 18,
  },
  shoulders: {
    opacity: 0.86,
  },
  shouldersSmall: {
    width: 18,
    height: 7,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  shouldersLarge: {
    width: 50,
    height: 18,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  printDate: {
    marginTop: 1,
    fontSize: 8,
    lineHeight: 10,
    letterSpacing: 0.55,
  },
});
