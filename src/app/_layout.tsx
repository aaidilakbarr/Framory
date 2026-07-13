import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";

import { queryClient } from "@/lib/query-client";
import { useAuthStore } from "@/store/auth-store";

SplashScreen.preventAutoHideAsync();

function useHydratedAuth() {
  const [hydrated, setHydrated] = useState(false);
  const initialize = useAuthStore((s) => s.initialize);
  const isInitializing = useAuthStore((s) => s.isInitializing);

  useEffect(() => {
    if (!hydrated) {
      initialize().finally(() => setHydrated(true));
    }
  }, [initialize, hydrated]);

  return { isInitializing: isInitializing || !hydrated };
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isInitializing } = useHydratedAuth();

  useEffect(() => {
    if (!isInitializing) {
      SplashScreen.hideAsync();
    }
  }, [isInitializing]);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </QueryClientProvider>
  );
}
