import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { onlineManager, QueryClient } from "@tanstack/react-query";
import { Platform } from "react-native";

import { isRetryableError } from "@/utils/errors";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 30 * 60_000,
      refetchOnWindowFocus: false,
      networkMode: "offlineFirst",
      retry: (failureCount, error) => failureCount < 2 && isRetryableError(error),
    },
    mutations: {
      networkMode: "online",
      retry: false,
    },
  },
});

export const queryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "stampcut-query-cache",
  throttleTime: 1_000,
});

if (Platform.OS !== "web") {
  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => setOnline(Boolean(state.isConnected))),
  );
}

export const queryKeys = {
  all: ["stampcut"] as const,
  albums: {
    all: () => [...queryKeys.all, "albums"] as const,
    list: () => [...queryKeys.albums.all(), "list"] as const,
    detail: (id: string) => [...queryKeys.albums.all(), "detail", id] as const,
  },
  photos: {
    all: () => [...queryKeys.all, "photos"] as const,
    list: (filters: Record<string, unknown> = {}) =>
      [...queryKeys.photos.all(), "list", filters] as const,
    detail: (id: string) => [...queryKeys.photos.all(), "detail", id] as const,
  },
  favorites: {
    all: () => [...queryKeys.all, "favorites"] as const,
    list: () => [...queryKeys.favorites.all(), "list"] as const,
  },
  tags: {
    all: () => [...queryKeys.all, "tags"] as const,
    list: () => [...queryKeys.tags.all(), "list"] as const,
  },
  profile: {
    all: () => [...queryKeys.all, "profile"] as const,
    current: () => [...queryKeys.profile.all(), "current"] as const,
    stats: () => [...queryKeys.profile.all(), "stats"] as const,
  },
  search: (query: string) => [...queryKeys.all, "search", query] as const,
} as const;

export function clearUserQueryCache() {
  queryClient.removeQueries({ queryKey: queryKeys.all });
  void queryPersister.removeClient();
}

export async function invalidateMemoryQueries() {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.photos.all() }),
    queryClient.invalidateQueries({ queryKey: queryKeys.albums.all() }),
    queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all() }),
    queryClient.invalidateQueries({ queryKey: queryKeys.profile.stats() }),
  ]);
}
