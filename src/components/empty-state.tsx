import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from '@/components/themed-text';

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.memoryOutline, { borderColor: theme.borderStrong }]}>
        <View style={[styles.memoryWindow, { backgroundColor: theme.accentSoft }]} />
      </View>
      <View style={styles.copy}>
        <ThemedText type="heading" style={styles.centerText}>
          {title}
        </ThemedText>
        <ThemedText type="body" themeColor="textSecondary" style={styles.centerText}>
          {description}
        </ThemedText>
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.xl,
  },
  memoryOutline: {
    width: 58,
    height: 72,
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: 7,
    transform: [{ rotate: '-3deg' }],
  },
  memoryWindow: {
    flex: 1,
    borderRadius: Radius.xs,
  },
  copy: {
    maxWidth: 380,
    gap: Spacing.two,
  },
  centerText: {
    textAlign: 'center',
  },
});
