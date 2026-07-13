import { useRef, useState } from 'react';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AuthShell } from '@/components/auth-shell';
import { GoogleMark } from '@/components/google-mark';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Notice } from '@/components/ui/notice';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/hooks';

type SignInField = 'email' | 'password';
type FieldErrors = Partial<Record<SignInField, string>>;
type PendingAction = 'email' | 'google' | null;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function authErrorMessage(error: unknown) {
  if (!error) return undefined;
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return 'Sign in could not be completed. Check your details and try again.';
}

export default function SignInScreen() {
  const { isPending, error, signIn, signInWithGoogle, clearError } = useAuth();
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string>();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const busy = isPending || pendingAction !== null;
  const visibleError = submitError ?? authErrorMessage(error);

  function clearFieldError(field: SignInField) {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError(undefined);
    if (error) clearError();
  }

  function validate() {
    const nextErrors: FieldErrors = {};
    if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!password) {
      nextErrors.password = 'Enter your password.';
    }
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleEmailSignIn() {
    clearError();
    setSubmitError(undefined);
    if (!validate()) return;

    setPendingAction('email');
    try {
      await signIn(email.trim(), password);
    } catch (caughtError) {
      setSubmitError(authErrorMessage(caughtError));
    } finally {
      setPendingAction(null);
    }
  }

  async function handleGoogleSignIn() {
    clearError();
    setSubmitError(undefined);
    setPendingAction('google');
    try {
      await signInWithGoogle();
    } catch (caughtError) {
      setSubmitError(authErrorMessage(caughtError));
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <AuthShell
      eyebrow="Your private archive"
      title="Welcome back to your memories."
      description="Pick up where you left off. Your photo strips stay personal, organized, and ready to revisit."
      footer={
        <Link href="/(auth)/sign-up" asChild>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Create a StampCut account"
            style={({ pressed }) => [styles.footerLink, pressed && styles.pressed]}>
            <ThemedText type="body" themeColor="textSecondary">
              New here?{' '}
              <ThemedText type="bodyStrong" themeColor="accentStrong">
                Create your journal
              </ThemedText>
            </ThemedText>
          </Pressable>
        </Link>
      }>
      <View style={styles.formHeader}>
        <ThemedText type="heading">Sign in</ThemedText>
        <ThemedText type="body" themeColor="textSecondary">
          Enter the details you used for StampCut.
        </ThemedText>
      </View>

      <View style={styles.fields}>
        <TextField
          label="Email"
          placeholder="you@example.com"
          value={email}
          error={fieldErrors.email}
          editable={!busy}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          keyboardType="email-address"
          returnKeyType="next"
          textContentType="emailAddress"
          onChangeText={(value) => {
            setEmail(value);
            clearFieldError('email');
          }}
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <TextField
          ref={passwordRef}
          label="Password"
          placeholder="Your password"
          value={password}
          error={fieldErrors.password}
          editable={!busy}
          autoCapitalize="none"
          autoComplete="current-password"
          returnKeyType="go"
          secureTextEntry
          textContentType="password"
          onChangeText={(value) => {
            setPassword(value);
            clearFieldError('password');
          }}
          onSubmitEditing={() => void handleEmailSignIn()}
        />
      </View>

      {visibleError ? <Notice variant="error" message={visibleError} /> : null}

      <Button
        label="Open my journal"
        loading={busy && pendingAction === 'email'}
        disabled={busy}
        onPress={() => void handleEmailSignIn()}
      />

      <Divider label="or continue with" />

      <Button
        label="Continue with Google"
        variant="secondary"
        leftElement={<GoogleMark />}
        loading={busy && pendingAction === 'google'}
        disabled={busy}
        onPress={() => void handleGoogleSignIn()}
      />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  formHeader: {
    gap: Spacing.xs,
  },
  fields: {
    width: '100%',
    gap: Spacing.three,
  },
  footerLink: {
    minHeight: 48,
    paddingHorizontal: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.58,
  },
});
