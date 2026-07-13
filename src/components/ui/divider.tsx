import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from '@/components/themed-text';

export function Divider({ label }: { label?: string }) {
  const theme = useTheme();

  return (
    <View style={styles.row} accessibilityElementsHidden>
      <View style={[styles.line, { backgroundColor: theme.border }]} />
      {label ? (
        <ThemedText type="caption" themeColor="textTertiary">
          {label}
        </ThemedText>
      ) : null}
      <View style={[styles.line, { backgroundColor: theme.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
});
