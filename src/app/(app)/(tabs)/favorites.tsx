import { useRouter } from "expo-router";
import { Heart } from "lucide-react-native";
import { RefreshControl, StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { EmptyState } from "@/components/empty-state";
import { MemoryThumb } from "@/components/memory-thumb";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Spacing } from "@/constants/theme";
import { useFavorites, useToggleFavorite } from "@/features/favorites/hooks";
import { useTheme } from "@/hooks/use-theme";

export default function FavoritesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isRefetching,
    refetch,
  } = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const photos = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <ThemedView style={styles.page}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View>
          <ThemedText type="title">Favorites</ThemedText>
          <ThemedText type="caption" themeColor="textSecondary">
            {photos.length} {photos.length === 1 ? "treasured memory" : "treasured memories"}
          </ThemedText>
        </View>
        <Heart color={theme.accentStrong} fill={theme.accentStrong} size={22} strokeWidth={1.6} />
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ThemedText themeColor="textSecondary">Loading favorites...</ThemedText>
        </View>
      ) : photos.length === 0 ? (
        <View style={styles.empty}>
          <EmptyState
            title="Nothing favorited yet"
            description="Tap and hold a photo on the Home screen to save it here."
            action={
              <Button label="Browse memories" onPress={() => router.push("/(app)/(tabs)")} />
            }
          />
        </View>
      ) : (
        <Animated.FlatList
          entering={FadeIn.duration(300)}
          data={photos}
          numColumns={3}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MemoryThumb
              photo={item}
              onPress={() => router.push(`/(app)/photo/${item.id}`)}
              onFavorite={() =>
                toggleFavorite.mutate({
                  photoId: item.id,
                  isFavorite: !item.is_favorite,
                })
              }
            />
          )}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={theme.accentStrong}
            />
          }
          contentContainerStyle={styles.grid}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.loadingMore}>
                <ThemedText type="caption" themeColor="textTertiary">
                  Loading more...
                </ThemedText>
              </View>
            ) : null
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
  },
  grid: {
    paddingTop: Spacing.two,
  },
  loadingMore: {
    paddingVertical: Spacing.four,
    alignItems: "center",
  },
});
