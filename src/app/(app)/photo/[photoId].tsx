import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Heart, Trash2 } from 'lucide-react-native';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Radius, Spacing } from '@/constants/theme';
import { useDeletePhoto, usePhoto } from '@/features/photos/hooks';
import { useToggleFavorite } from '@/features/favorites/hooks';
import { useTheme } from '@/hooks/use-theme';

export default function PhotoDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { photoId } = useLocalSearchParams<{ photoId: string }>();
  const { data: photo, isLoading } = usePhoto(photoId);
  const toggleFavorite = useToggleFavorite();
  const deletePhoto = useDeletePhoto();

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText themeColor="textSecondary">Loading memory…</ThemedText>
      </ThemedView>
    );
  }

  if (!photo) {
    return (
      <ThemedView style={styles.center}>
        <EmptyState
          title="Memory not found"
          description="This photo may have been deleted."
          action={<Button label="Back to memories" onPress={() => router.replace('/(app)/(tabs)')} />}
        />
      </ThemedView>
    );
  }

  const date = new Date(photo.captured_at).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  function handleDelete() {
    Alert.alert('Delete memory', 'This cannot be undone. The photo will be removed from your archive.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deletePhoto.mutate(photo!.id, {
            onSuccess: () => router.back(),
          });
        },
      },
    ]);
  }

  function handleEditCaption() {
    Alert.alert('Edit caption', 'Use the album page to update details for this memory.');
  }

  return (
    <ThemedView style={styles.page}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable accessibilityLabel="Go back" accessibilityRole="button" hitSlop={8} onPress={() => router.back()}>
          <ArrowLeft color={theme.text} size={22} strokeWidth={1.8} />
        </Pressable>
        <Pressable
          accessibilityLabel={photo.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          accessibilityRole="button"
          hitSlop={8}
          onPress={() =>
            toggleFavorite.mutate({
              photoId: photo.id,
              isFavorite: !photo.is_favorite,
            })
          }>
          <Heart
            color={photo.is_favorite ? theme.accentStrong : theme.text}
            fill={photo.is_favorite ? theme.accentStrong : 'transparent'}
            size={22}
            strokeWidth={1.6}
          />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {photo.image_url ? (
          <Image
            source={{ uri: photo.image_url }}
            contentFit="contain"
            transition={200}
            style={styles.image}
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder, { backgroundColor: theme.surfaceMuted }]} />
        )}

        <Card style={styles.metaCard}>
          <Pressable onPress={handleEditCaption} style={({ pressed }) => [styles.captionRow, pressed && styles.pressed]}>
            <ThemedText type="heading" style={styles.captionText}>
              {photo.caption || 'Untitled memory'}
            </ThemedText>
            <ThemedText type="caption" themeColor="accentStrong">
              Tap to edit
            </ThemedText>
          </Pressable>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.metaRow}>
            <Calendar color={theme.textTertiary} size={16} strokeWidth={1.8} />
            <ThemedText type="body" themeColor="textSecondary">
              {date}
            </ThemedText>
          </View>

          {photo.album ? (
            <View style={styles.metaRow}>
              <ThemedText type="caption" themeColor="textTertiary">
                in
              </ThemedText>
              <Pressable onPress={() => router.push(`/(app)/album/${photo.album!.id}`)}>
                <ThemedText type="bodyStrong" themeColor="accentStrong">
                  {photo.album.name}
                </ThemedText>
              </Pressable>
            </View>
          ) : null}

          {photo.tags.length > 0 ? (
            <View style={styles.tagRow}>
              {photo.tags.map((tag) => (
                <View key={tag.id} style={[styles.tag, { backgroundColor: theme.accentSoft }]}>
                  <ThemedText type="caption" themeColor="accentStrong">
                    {tag.name}
                  </ThemedText>
                </View>
              ))}
            </View>
          ) : null}
        </Card>

        <Button
          label="Delete memory"
          variant="danger"
          loading={deletePhoto.isPending}
          leftElement={<Trash2 color="#FFFFFF" size={17} />}
          onPress={handleDelete}
        />
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: Spacing.xl,
  },
  image: {
    width: '100%',
    aspectRatio: 0.75,
    borderRadius: Radius.lg,
  },
  imagePlaceholder: {
    borderRadius: Radius.lg,
  },
  metaCard: {
    gap: Spacing.sm,
  },
  captionRow: {
    gap: Spacing.xs,
  },
  captionText: {
    flexShrink: 1,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.xs,
  },
  tag: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  pressed: {
    opacity: 0.6,
  },
});
