import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

import { supabase } from "@/lib/supabase";
import { AppError, toAppError } from "@/utils/errors";

WebBrowser.maybeCompleteAuthSession();

export type AuthCredentials = {
  email: string;
  password: string;
};

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw toAppError(error, "Could not restore your session.");
  return data.session;
}

export async function requireUser(): Promise<User> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw toAppError(error, "Could not verify your session.");
  if (!data.user) throw new AppError("Please sign in to continue.", { code: "AUTH_REQUIRED", status: 401 });
  return data.user;
}

export async function requireUserId() {
  return (await requireUser()).id;
}

export async function signInWithPassword({ email, password }: AuthCredentials) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) throw toAppError(error, "Could not sign in.");
  return data;
}

export async function signUpWithPassword({
  email,
  password,
  username,
}: AuthCredentials & { username: string }) {
  const normalizedUsername = username.trim();
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { data: { username: normalizedUsername } },
  });

  if (error) throw toAppError(error, "Could not create your account.");

  if (data.session && data.user) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ username: normalizedUsername })
      .eq("id", data.user.id);
    if (profileError) throw toAppError(profileError, "Your account was created, but the profile could not be saved.");
  }

  return data;
}

function extractOAuthParams(url: string) {
  const parsed = new URL(url);
  const hash = new URLSearchParams(parsed.hash.replace(/^#/, ""));

  return {
    code: parsed.searchParams.get("code"),
    accessToken: hash.get("access_token") ?? parsed.searchParams.get("access_token"),
    refreshToken: hash.get("refresh_token") ?? parsed.searchParams.get("refresh_token"),
    errorDescription:
      hash.get("error_description") ?? parsed.searchParams.get("error_description"),
  };
}

export async function signInWithGoogle(): Promise<Session | null> {
  const redirectTo = Linking.createURL("auth/callback");
  const isWeb = Platform.OS === "web";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: !isWeb,
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });

  if (error) throw toAppError(error, "Could not start Google sign in.");
  if (isWeb || !data.url) return null;

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type === "cancel" || result.type === "dismiss") {
    throw new AppError("Google sign in was cancelled.", { code: "OAUTH_CANCELLED" });
  }
  if (result.type !== "success") {
    throw new AppError("Google sign in did not complete.", { code: "OAUTH_INCOMPLETE" });
  }

  const params = extractOAuthParams(result.url);
  if (params.errorDescription) throw new AppError(params.errorDescription, { code: "OAUTH_ERROR" });

  if (params.code) {
    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(
      params.code,
    );
    if (exchangeError) throw toAppError(exchangeError, "Could not finish Google sign in.");
    return sessionData.session;
  }

  if (params.accessToken && params.refreshToken) {
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: params.accessToken,
      refresh_token: params.refreshToken,
    });
    if (sessionError) throw toAppError(sessionError, "Could not finish Google sign in.");
    return sessionData.session;
  }

  throw new AppError("Google did not return a usable session.", { code: "OAUTH_SESSION_MISSING" });
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw toAppError(error, "Could not sign out.");
}

export function onAuthStateChange(
  listener: (event: AuthChangeEvent, session: Session | null) => void,
) {
  return supabase.auth.onAuthStateChange(listener).data.subscription;
}
