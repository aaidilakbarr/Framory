import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ChevronRight, Plus, Search } from "lucide-react-native";
import { Pressable, RefreshControl, StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { EmptyState } from "@/components/empty-state";
import { MemoryThumb } from "@/components/memory-thumb";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Radius, Spacing } from "@/constants/theme";
import { useAlbums } from "@/features/albums/hooks";
import { usePhotos } from "@/features/photos/hooks";
import { useTheme } from "@/hooks/use-theme";
import { useToggleFavorite } from "@/features/favorites/hooks";

export default function HomeScreen() {
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
  } = usePhotos();
  const { data: albums } = useAlbums();
  const toggleFavorite = useToggleFavorite();
  const photos = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <ThemedView style={styles.page}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <ThemedText type="title">
          Memories
        </ThemedText>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityLabel="Search"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => router.push("/(app)/search")}>
            <Search color={theme.text} size={20} strokeWidth={1.8} />
          </Pressable>
          <Pressable
            accessibilityLabel="Upload new memory"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => router.push("/(app)/photo/new")}>
            <Plus color={theme.text} size={22} strokeWidth={1.8} />
          </Pressable>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ThemedText type="body" themeColor="textSecondary">
            Loading memories...
          </ThemedText>
        </View>
      ) : photos.length === 0 ? (
        <View style={styles.emptyScroll}>
          <EmptyState
            title="No memories yet"
            description="Your first stamp cut photo is just a tap away."
            action={
              <Button
                label="Upload your first memory"
                onPress={() => router.push("/(app)/photo/new")}
              />
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

      {albums && albums.length > 0 ? (
        <View style={[styles.albumsBar, { borderTopColor: theme.border }]}>
          <Pressable
            onPress={() => router.push("/(app)/(tabs)/albums")}
            style={({ pressed }) => [
              styles.albumsRow,
              pressed && styles.pressed,
            ]}>
            <View style={styles.albumAvatars}>
              {albums.slice(0, 3).map((album) =>
                album.cover_url ? (
                  <Image
                    key={album.id}
                    source={{ uri: album.cover_url }}
                    contentFit="cover"
                    style={[styles.albumDot, { borderColor: theme.border }]}
                  />
                ) : null,
              )}
            </View>
            <ThemedText type="body" numberOfLines={1}>
              {albums[0]?.name ?? "Albums"}
            </ThemedText>
            <ThemedText type="caption" themeColor="textTertiary">
              {albums.length}
            </ThemedText>
            <ChevronRight color={theme.textTertiary} size={16} strokeWidth={1.8} />
          </Pressable>
        </View>
      ) : null}
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyScroll: {
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
  albumsBar: {
    borderTopWidth: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.sm,
  },
  albumsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    minHeight: 44,
  },
  albumAvatars: {
    flexDirection: "row",
    alignItems: "center",
  },
  albumDot: {
    width: 28,
    height: 28,
    borderRadius: Radius.pill,
    borderWidth: 2,
    marginLeft: -8,
  },
  pressed: {
    opacity: 0.58,
  },
});
