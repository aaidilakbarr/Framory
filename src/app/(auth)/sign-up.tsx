import { useRef, useState } from 'react';
import { Link, type Href } from 'expo-router';
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

type SignUpField = 'username' | 'email' | 'password' | 'confirmPassword';
type FieldErrors = Partial<Record<SignUpField, string>>;
type PendingAction = 'email' | 'google' | null;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function authErrorMessage(error: unknown) {
  if (!error) return undefined;
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return 'Your account could not be created. Review your details and try again.';
}

export default function SignUpScreen() {
  const { isPending, error, signUp, signInWithGoogle, clearError } = useAuth();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string>();
  const [created, setCreated] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const busy = isPending || pendingAction !== null;
  const visibleError = submitError ?? authErrorMessage(error);

  function clearFieldError(field: SignUpField) {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError(undefined);
    setCreated(false);
    if (error) clearError();
  }

  function validate() {
    const nextErrors: FieldErrors = {};
    const cleanUsername = username.trim();
    if (cleanUsername.length < 2) {
      nextErrors.username = 'Choose a username with at least 2 characters.';
    } else if (cleanUsername.length > 32) {
      nextErrors.username = 'Keep your username under 32 characters.';
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (password.length < 8) {
      nextErrors.password = 'Use at least 8 characters.';
    }
    if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'The passwords do not match.';
    }
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleEmailSignUp() {
    clearError();
    setSubmitError(undefined);
    setCreated(false);
    if (!validate()) return;

    setPendingAction('email');
    try {
      await signUp(email.trim(), password, username.trim());
      setCreated(true);
    } catch (caughtError) {
      setSubmitError(authErrorMessage(caughtError));
    } finally {
      setPendingAction(null);
    }
  }

  async function handleGoogleSignIn() {
    clearError();
    setSubmitError(undefined);
    setCreated(false);
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
      eyebrow="Begin a private collection"
      title="Give the little moments a home."
      description="Create a quiet archive for every booth strip, favorite frame, and date worth remembering."
      footer={
        <Link href={'/(auth)/sign-in' as Href} asChild>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Go to StampCut sign in"
            style={({ pressed }) => [styles.footerLink, pressed && styles.pressed]}>
            <ThemedText type="body" themeColor="textSecondary">
              Already have a journal?{' '}
              <ThemedText type="bodyStrong" themeColor="accentStrong">
                Sign in
              </ThemedText>
            </ThemedText>
          </Pressable>
        </Link>
      }>
      <View style={styles.formHeader}>
        <ThemedText type="heading">Create your journal</ThemedText>
        <ThemedText type="body" themeColor="textSecondary">
          Only you can see the memories you add.
        </ThemedText>
      </View>

      <View style={styles.fields}>
        <TextField
          label="Username"
          placeholder="How should we address you?"
          value={username}
          error={fieldErrors.username}
          editable={!busy}
          autoCapitalize="words"
          autoComplete="username-new"
          returnKeyType="next"
          textContentType="username"
          onChangeText={(value) => {
            setUsername(value);
            clearFieldError('username');
          }}
          onSubmitEditing={() => emailRef.current?.focus()}
        />
        <TextField
          ref={emailRef}
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
          placeholder="At least 8 characters"
          value={password}
          error={fieldErrors.password}
          editable={!busy}
          hint="Use 8 or more characters."
          autoCapitalize="none"
          autoComplete="new-password"
          returnKeyType="next"
          secureTextEntry
          textContentType="newPassword"
          onChangeText={(value) => {
            setPassword(value);
            clearFieldError('password');
          }}
          onSubmitEditing={() => confirmPasswordRef.current?.focus()}
        />
        <TextField
          ref={confirmPasswordRef}
          label="Confirm password"
          placeholder="Repeat your password"
          value={confirmPassword}
          error={fieldErrors.confirmPassword}
          editable={!busy}
          autoCapitalize="none"
          autoComplete="new-password"
          returnKeyType="go"
          secureTextEntry
          textContentType="newPassword"
          onChangeText={(value) => {
            setConfirmPassword(value);
            clearFieldError('confirmPassword');
          }}
          onSubmitEditing={() => void handleEmailSignUp()}
        />
      </View>

      {visibleError ? <Notice variant="error" message={visibleError} /> : null}
      {created && !visibleError ? (
        <Notice
          variant="success"
          message="Your journal is ready. If email verification is enabled, check your inbox before signing in."
        />
      ) : null}

      <Button
        label="Create my journal"
        loading={busy && pendingAction === 'email'}
        disabled={busy}
        onPress={() => void handleEmailSignUp()}
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
