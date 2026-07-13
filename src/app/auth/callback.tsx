import { Link, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth-store";
import { toAppError } from "@/utils/errors";

export default function AuthCallbackScreen() {
  const [error, setError] = useState<string | null>(null);
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    async function handleCallback() {
      if (Platform.OS !== "web") return;

      const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const hashError = params.get("error_description");
      if (hashError) {
        setError(decodeURIComponent(hashError.replace(/\+/g, " ")));
        return;
      }

      try {
        const { error } = await supabase.auth.getSession();
        if (error) throw toAppError(error, "Could not complete sign in.");

        await initialize();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not complete sign in.");
      }
    }

    handleCallback();
  }, [initialize]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {error ? (
        <View style={styles.content}>
          <Link href="/(auth)/sign-in" style={styles.link}>
            Back to sign in
          </Link>
        </View>
      ) : (
        <ActivityIndicator size="large" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    gap: 16,
  },
  link: {
    fontSize: 16,
    color: "#B98962",
  },
});
