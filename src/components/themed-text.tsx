import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, TypeScale, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type TextVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'subheading'
  | 'body'
  | 'bodyStrong'
  | 'label'
  | 'caption'
  | 'overline'
  | 'mono'
  // Expo scaffold aliases kept to avoid surprising downstream callers.
  | 'default'
  | 'small'
  | 'smallBold'
  | 'subtitle'
  | 'link'
  | 'linkPrimary'
  | 'code';

export type ThemedTextProps = TextProps & {
  type?: TextVariant;
  themeColor?: ThemeColor;
};

export function ThemedText({
  style,
  type = 'body',
  themeColor,
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        styles.base,
        { color: theme[themeColor ?? 'text'] },
        variantStyles[type],
        type === 'linkPrimary' && { color: theme.accentStrong },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: Fonts.sans,
  },
  display: {
    fontFamily: Fonts.serif,
    fontSize: TypeScale.display,
    lineHeight: 46,
    fontWeight: '600',
    letterSpacing: -1.2,
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: TypeScale.title,
    lineHeight: 38,
    fontWeight: '600',
    letterSpacing: -0.6,
  },
  heading: {
    fontFamily: Fonts.serif,
    fontSize: TypeScale.heading,
    lineHeight: 30,
    fontWeight: '600',
    letterSpacing: -0.25,
  },
  subheading: {
    fontSize: TypeScale.subheading,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  body: {
    fontSize: TypeScale.body,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodyStrong: {
    fontSize: TypeScale.body,
    lineHeight: 24,
    fontWeight: '600',
  },
  label: {
    fontSize: TypeScale.label,
    lineHeight: 20,
    fontWeight: '700',
  },
  caption: {
    fontSize: TypeScale.caption,
    lineHeight: 18,
    fontWeight: '500',
  },
  overline: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  mono: {
    fontFamily: Fonts.mono,
    fontSize: TypeScale.caption,
    lineHeight: 18,
    fontWeight: Platform.select({ android: '700' as const }) ?? '500',
  },
});

const variantStyles: Record<TextVariant, object> = {
  display: styles.display,
  title: styles.title,
  heading: styles.heading,
  subheading: styles.subheading,
  body: styles.body,
  bodyStrong: styles.bodyStrong,
  label: styles.label,
  caption: styles.caption,
  overline: styles.overline,
  mono: styles.mono,
  default: styles.body,
  small: styles.label,
  smallBold: styles.label,
  subtitle: styles.title,
  link: styles.label,
  linkPrimary: styles.label,
  code: styles.mono,
};
