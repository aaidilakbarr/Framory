import { StyleSheet, View } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from '@/components/themed-text';

/** A compact neutral container for the Google wordmark initial. */
export function GoogleMark() {
  const theme = useTheme();

  return (
    <View style={[styles.mark, { backgroundColor: theme.background, borderColor: theme.border }]}>
      <ThemedText style={styles.letter}>G</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderRadius: Radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '800',
  },
});
