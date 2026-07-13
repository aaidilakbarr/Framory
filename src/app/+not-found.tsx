import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="heading" style={styles.title}>
        This page wandered off.
      </ThemedText>
      <ThemedText type="body" themeColor="textSecondary" style={styles.subtitle}>
        The memory you were looking for may have been moved or deleted.
      </ThemedText>
      <Link href="/" asChild>
        <Button label="Back to your journal" />
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 280,
  },
});
