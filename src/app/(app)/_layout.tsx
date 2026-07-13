import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAuthStore } from "@/store/auth-store";
import { useTheme } from "@/hooks/use-theme";

export default function AppLayout() {
  const theme = useTheme();
  const session = useAuthStore((state) => state.session);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  if (isInitializing) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.accentStrong} />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/sign-in" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
      }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="search" options={{ presentation: "modal" }} />
      <Stack.Screen name="photo/new" options={{ presentation: "modal" }} />
      <Stack.Screen name="photo/[photoId]" />
      <Stack.Screen name="album/new" options={{ presentation: "modal" }} />
      <Stack.Screen name="album/[albumId]" />
      <Stack.Screen name="profile/edit" options={{ presentation: "modal" }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
