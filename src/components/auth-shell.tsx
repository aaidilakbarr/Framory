import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { BrandMark, PhotoStrip } from '@/components/brand-mark';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Layout, Radius, Spacing } from '@/constants/theme';
import { useTheme, useThemeName } from '@/hooks/use-theme';

export type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthShell({ eyebrow, title, description, children, footer }: AuthShellProps) {
  const theme = useTheme();
  const themeName = useThemeName();
  const { width } = useWindowDimensions();
  const isWide = width >= 840;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar style={themeName === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.page}>
            <View style={styles.brandHeader}>
              <BrandMark />
            </View>

            <View style={[styles.layout, isWide && styles.layoutWide]}>
              <View
                style={[
                  styles.hero,
                  isWide && styles.heroWide,
                  { backgroundColor: theme.accentSoft, borderColor: theme.border },
                ]}>
                <View style={[styles.archiveRule, { backgroundColor: theme.accent }]} />
                <ThemedText type="overline" themeColor="accentStrong">
                  {eyebrow}
                </ThemedText>
                <ThemedText
                  type={isWide ? 'display' : 'title'}
                  style={[styles.heroTitle, !isWide && styles.heroTitleNarrow]}>
                  {title}
                </ThemedText>
                <ThemedText
                  type="body"
                  themeColor="textSecondary"
                  style={[styles.heroDescription, !isWide && styles.heroDescriptionNarrow]}>
                  {description}
                </ThemedText>

                <View style={styles.archiveIndex}>
                  <View style={[styles.privacyDot, { backgroundColor: theme.success }]} />
                  <ThemedText type="mono" themeColor="textSecondary">
                    PRIVATE · SC—0001
                  </ThemedText>
                </View>

                <View style={[styles.photoStrip, isWide && styles.photoStripWide]}>
                  <PhotoStrip size="large" tilt="right" />
                </View>
              </View>

              <View style={[styles.formColumn, isWide && styles.formColumnWide]}>
                <Card elevated style={styles.formCard}>
                  {children}
                </Card>
                {footer ? <View style={styles.footer}>{footer}</View> : null}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  page: {
    width: '100%',
    maxWidth: Layout.maxContentWidth,
    minHeight: '100%',
    alignSelf: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.five,
  },
  brandHeader: {
    marginBottom: Spacing.four,
  },
  layout: {
    width: '100%',
    gap: Spacing.four,
  },
  layoutWide: {
    flex: 1,
    minHeight: 560,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Spacing.five,
  },
  hero: {
    minHeight: 278,
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.four,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  heroWide: {
    flex: 1,
    minHeight: 540,
    padding: Spacing.xl,
  },
  archiveRule: {
    width: 36,
    height: 3,
    borderRadius: 2,
    marginBottom: Spacing.three,
  },
  heroTitle: {
    maxWidth: 420,
    marginTop: Spacing.sm,
  },
  heroTitleNarrow: {
    maxWidth: '74%',
  },
  heroDescription: {
    maxWidth: 390,
    marginTop: Spacing.sm,
  },
  heroDescriptionNarrow: {
    maxWidth: '72%',
    fontSize: 14,
    lineHeight: 21,
  },
  archiveIndex: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  privacyDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  photoStrip: {
    position: 'absolute',
    right: -5,
    top: 35,
    opacity: 0.98,
  },
  photoStripWide: {
    right: 32,
    top: 54,
  },
  formColumn: {
    width: '100%',
    justifyContent: 'center',
  },
  formColumnWide: {
    width: 420,
  },
  formCard: {
    width: '100%',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  footer: {
    alignItems: 'center',
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
});
