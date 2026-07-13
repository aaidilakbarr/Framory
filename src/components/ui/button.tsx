import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { Layout, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from '@/components/themed-text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  leftElement?: ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function Button({
  label,
  variant = 'primary',
  loading = false,
  disabled = false,
  leftElement,
  fullWidth = true,
  style,
  textStyle,
  ...pressableProps
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const backgroundColor = {
    primary: theme.action,
    secondary: theme.surface,
    ghost: 'transparent',
    danger: theme.danger,
  }[variant];
  const pressedBackground = {
    primary: theme.actionPressed,
    secondary: theme.surfaceMuted,
    ghost: theme.surfaceMuted,
    danger: theme.danger,
  }[variant];
  const foregroundColor = {
    primary: theme.onAction,
    secondary: theme.text,
    ghost: theme.accentStrong,
    danger: '#FFFFFF',
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={pressableProps.accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        {
          backgroundColor: pressed ? pressedBackground : backgroundColor,
          borderColor: variant === 'secondary' ? theme.borderStrong : 'transparent',
        },
        isDisabled && styles.disabled,
        style,
      ]}
      {...pressableProps}>
      {loading ? (
        <ActivityIndicator color={foregroundColor} size="small" />
      ) : (
        leftElement
      )}
      <ThemedText type="label" style={[{ color: foregroundColor }, textStyle]}>
        {loading ? `${label}…` : label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: Layout.minTouchTarget,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.52,
  },
});
