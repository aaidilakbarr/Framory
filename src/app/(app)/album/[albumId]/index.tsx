import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MoreVertical, Plus } from 'lucide-react-native';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { MemoryThumb } from '@/components/memory-thumb';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useAlbum, useDeleteAlbum } from '@/features/albums/hooks';
import { usePhotos } from '@/features/photos/hooks';
import { useToggleFavorite } from '@/features/favorites/hooks';
import { useTheme } from '@/hooks/use-theme';

export default function AlbumDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { albumId } = useLocalSearchParams<{ albumId: string }>();
  const { data: album, isLoading: albumLoading } = useAlbum(albumId);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: photosLoading,
    isRefetching,
    refetch,
  } = usePhotos({ albumId });
  const toggleFavorite = useToggleFavorite();
  const deleteAlbum = useDeleteAlbum();

  const photos = data?.pages.flatMap((page) => page.items) ?? [];
  const isLoading = albumLoading || photosLoading;

  function handleMenu() {
    Alert.alert(album?.name ?? 'Album', undefined, [
      { text: 'Edit album', onPress: () => router.push(`/(app)/album/${albumId}/edit`) },
      {
        text: 'Delete album',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Delete album', `Delete “${album?.name}”? Photos inside will stay in your journal.`, [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () =>
                deleteAlbum.mutate(albumId, {
                  onSuccess: () => router.replace('/(app)/(tabs)/albums'),
                }),
            },
          ]),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText themeColor="textSecondary">Loading album…</ThemedText>
      </ThemedView>
    );
  }

  if (!album) {
    return (
      <ThemedView style={styles.center}>
        <EmptyState
          title="Album not found"
          description="This album may have been deleted."
          action={<Button label="Back to albums" onPress={() => router.replace('/(app)/(tabs)/albums')} />}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.page}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable accessibilityLabel="Go back" accessibilityRole="button" hitSlop={8} onPress={() => router.back()}>
          <ArrowLeft color={theme.text} size={22} strokeWidth={1.8} />
        </Pressable>
        <View style={styles.headerTitle}>
          <ThemedText type="heading" numberOfLines={1}>
            {album.name}
          </ThemedText>
          <ThemedText type="caption" themeColor="textSecondary">
            {album.photo_count} {album.photo_count === 1 ? 'memory' : 'memories'}
          </ThemedText>
        </View>
        <Pressable accessibilityLabel="Album options" accessibilityRole="button" hitSlop={8} onPress={handleMenu}>
          <MoreVertical color={theme.text} size={20} />
        </Pressable>
      </View>

      {photos.length === 0 ? (
        <View style={styles.emptyScroll}>
          <EmptyState
            title="No memories in this album"
            description="Add your first stamp cut photo to start this collection."
            action={<Button label="Upload a memory" onPress={() => router.push('/(app)/photo/new')} />}
          />
        </View>
      ) : (
        <FlatList
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
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.accentStrong} />
          }
          contentContainerStyle={styles.grid}
        />
      )}

      <Pressable
        accessibilityLabel="Upload to this album"
        accessibilityRole="button"
        onPress={() => router.push('/(app)/photo/new')}
        style={({ pressed }) => [styles.fab, { backgroundColor: theme.action }, pressed && styles.pressed]}>
        <Plus color={theme.onAction} size={26} strokeWidth={2} />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  headerTitle: {
    flex: 1,
    gap: 2,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  emptyScroll: {
    flex: 1,
    justifyContent: 'center',
  },
  grid: {
    paddingTop: Spacing.two,
  },
  fab: {
    position: 'absolute',
    right: Spacing.four,
    bottom: Spacing.four,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});
