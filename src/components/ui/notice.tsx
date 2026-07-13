import { StyleSheet, View, type ViewProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from '@/components/themed-text';

export type NoticeVariant = 'error' | 'success' | 'info';

export type NoticeProps = ViewProps & {
  message: string;
  variant?: NoticeVariant;
};

export function Notice({ message, variant = 'info', style, ...props }: NoticeProps) {
  const theme = useTheme();
  const backgroundColor = {
    error: theme.dangerSoft,
    success: theme.successSoft,
    info: theme.accentSoft,
  }[variant];
  const color = {
    error: theme.danger,
    success: theme.success,
    info: theme.text,
  }[variant];

  return (
    <View
      accessibilityRole={variant === 'error' ? 'alert' : undefined}
      style={[styles.base, { backgroundColor }, style]}
      {...props}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <ThemedText type="caption" style={[styles.message, { color }]}>
        {message}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.two,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  message: {
    flex: 1,
  },
});
