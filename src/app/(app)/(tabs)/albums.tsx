import { Link, useRouter } from "expo-router";
import { FolderPlus, Image as ImageIcon, MoreVertical, Plus } from "lucide-react-native";
import { Alert, FlatList, Pressable, StyleSheet, View } from "react-native";

import { EmptyState } from "@/components/empty-state";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Radius, Spacing } from "@/constants/theme";
import { useAlbums, useCreateAlbum, useDeleteAlbum } from "@/features/albums/hooks";
import { useTheme } from "@/hooks/use-theme";
import { Image } from "expo-image";

export default function AlbumsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: albums, isLoading, refetch, isRefetching } = useAlbums();
  const deleteAlbum = useDeleteAlbum();
  const createAlbum = useCreateAlbum();

  function confirmDelete(id: string, name: string) {
    Alert.alert("Delete album", `Delete “${name}”? Photos inside will stay in your journal.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteAlbum.mutate(id),
      },
    ]);
  }

  return (
    <ThemedView style={styles.page}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View>
          <ThemedText type="title">Albums</ThemedText>
          <ThemedText type="caption" themeColor="textSecondary">
            Keep the chapters of your journal close.
          </ThemedText>
        </View>
        <Pressable
          accessibilityLabel="Create album"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => router.push("/(app)/album/new")}>
          <Plus color={theme.text} size={23} strokeWidth={1.8} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ThemedText themeColor="textSecondary">Loading albums...</ThemedText>
        </View>
      ) : !albums?.length ? (
        <View style={styles.empty}>
          <EmptyState
            title="Create your first album"
            description="Group your favorite strips by people, places, or seasons."
            action={
              <Button label="New album" onPress={() => router.push("/(app)/album/new")} />
            }
          />
        </View>
      ) : (
        <FlatList
          data={albums}
          keyExtractor={(item) => item.id}
          numColumns={2}
          refreshing={isRefetching}
          onRefresh={refetch}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.columns}
          renderItem={({ item }) => (
            <Card padded={false} style={styles.albumCard}>
              <Link href={`/(app)/album/${item.id}`} asChild>
                <Pressable
                  accessibilityLabel={`Open ${item.name} album`}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.coverButton, pressed && styles.pressed]}>
                  {item.cover_url ? (
                    <Image source={{ uri: item.cover_url }} contentFit="cover" style={styles.cover} />
                  ) : (
                    <View style={[styles.coverPlaceholder, { backgroundColor: theme.accentSoft }]}>
                      <FolderPlus color={theme.accentStrong} size={26} strokeWidth={1.5} />
                    </View>
                  )}
                  <View style={[styles.count, { backgroundColor: theme.overlay }]}>
                    <ImageIcon color="#FFFFFF" size={12} strokeWidth={1.8} />
                    <ThemedText type="caption" style={styles.countText}>
                      {item.photo_count}
                    </ThemedText>
                  </View>
                </Pressable>
              </Link>
              <View style={styles.albumInfo}>
                <View style={styles.albumCopy}>
                  <ThemedText type="bodyStrong" numberOfLines={1}>
                    {item.name}
                  </ThemedText>
                  <ThemedText type="caption" themeColor="textSecondary">
                    {item.photo_count} {item.photo_count === 1 ? "memory" : "memories"}
                  </ThemedText>
                </View>
                <Pressable
                  accessibilityLabel={`Options for ${item.name}`}
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() =>
                    Alert.alert(item.name, undefined, [
                      { text: "Edit album", onPress: () => router.push(`/(app)/album/${item.id}/edit`) },
                      { text: "Delete album", style: "destructive", onPress: () => confirmDelete(item.id, item.name) },
                      { text: "Cancel", style: "cancel" },
                    ])
                  }>
                  <MoreVertical color={theme.textTertiary} size={18} />
                </Pressable>
              </View>
            </Card>
          )}
          ListFooterComponent={
            <Pressable onPress={() => createAlbum.mutateAsync({ name: "New album" }).then((album) => album && router.push(`/(app)/album/${album.id}/edit`))} style={styles.quickAdd}>
              <ThemedText type="caption" themeColor="accentStrong">
                + Start another album
              </ThemedText>
            </Pressable>
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
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  list: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  columns: {
    gap: Spacing.three,
  },
  albumCard: {
    flex: 1,
    overflow: "hidden",
  },
  coverButton: {
    aspectRatio: 1,
    position: "relative",
  },
  cover: {
    width: "100%",
    height: "100%",
  },
  coverPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  count: {
    position: "absolute",
    bottom: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  countText: {
    color: "#FFFFFF",
  },
  albumInfo: {
    padding: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  albumCopy: {
    flex: 1,
    gap: 2,
  },
  quickAdd: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.6,
  },
});
