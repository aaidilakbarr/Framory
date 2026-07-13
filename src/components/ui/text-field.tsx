import { forwardRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { Layout, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from '@/components/themed-text';

export type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  {
    label,
    error,
    hint,
    style,
    onFocus,
    onBlur,
    secureTextEntry,
    editable = true,
    ...inputProps
  },
  ref,
) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(Boolean(secureTextEntry));

  return (
    <View style={styles.group}>
      <ThemedText type="label" style={styles.label}>
        {label}
      </ThemedText>
      <View
        style={[
          styles.fieldShell,
          {
            backgroundColor: theme.surface,
            borderColor: error
              ? theme.danger
              : isFocused
                ? theme.accentStrong
                : theme.border,
          },
          !editable && styles.disabled,
        ]}>
        <TextInput
          ref={ref}
          accessibilityLabel={inputProps.accessibilityLabel ?? label}
          accessibilityState={{ disabled: !editable }}
          editable={editable}
          placeholderTextColor={theme.textTertiary}
          selectionColor={theme.accent}
          secureTextEntry={secureTextEntry ? isSecure : false}
          style={[styles.input, { color: theme.text }, style]}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          {...inputProps}
        />
        {secureTextEntry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isSecure ? 'Show password' : 'Hide password'}
            hitSlop={8}
            onPress={() => setIsSecure((value) => !value)}
            style={({ pressed }) => [styles.revealButton, pressed && styles.pressed]}>
            <ThemedText type="caption" themeColor="accentStrong">
              {isSecure ? 'Show' : 'Hide'}
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
      {error || hint ? (
        <ThemedText
          accessibilityRole={error ? 'alert' : undefined}
          type="caption"
          themeColor={error ? 'danger' : 'textSecondary'}>
          {error ?? hint}
        </ThemedText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  group: {
    width: '100%',
    gap: Spacing.xs,
  },
  label: {
    marginLeft: 1,
  },
  fieldShell: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    minHeight: Layout.minTouchTarget,
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    lineHeight: 22,
  },
  revealButton: {
    minWidth: Layout.minTouchTarget,
    minHeight: Layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
  },
  pressed: {
    opacity: 0.58,
  },
  disabled: {
    opacity: 0.55,
  },
});
