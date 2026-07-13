import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useAlbum, useDeleteAlbum, useUpdateAlbum } from '@/features/albums/hooks';
import { useTheme } from '@/hooks/use-theme';

export default function EditAlbumScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { albumId } = useLocalSearchParams<{ albumId: string }>();
  const { data: album } = useAlbum(albumId);
  const updateAlbum = useUpdateAlbum();
  const deleteAlbum = useDeleteAlbum();
  const [name, setName] = useState(album?.name ?? '');

  const currentName = album?.name ?? '';
  const hasChanges = name.trim() !== currentName && name.trim().length > 0;

  function handleSave() {
    if (!hasChanges) return;
    updateAlbum.mutate(
      { id: albumId, name: name.trim() },
      {
        onSuccess: () => {
          Alert.alert('Saved', 'Album name updated.');
          router.back();
        },
      },
    );
  }

  function handleDelete() {
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
    ]);
  }

  return (
    <ThemedView style={styles.page}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable accessibilityLabel="Go back" accessibilityRole="button" hitSlop={8} onPress={() => router.back()}>
          <ArrowLeft color={theme.text} size={22} strokeWidth={1.8} />
        </Pressable>
        <ThemedText type="heading">Edit album</ThemedText>
      </View>

      <View style={styles.content}>
        <View style={styles.field}>
          <ThemedText type="label">Album name</ThemedText>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Album name"
            placeholderTextColor={theme.textTertiary}
            style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
            autoCapitalize="words"
            maxLength={100}
          />
          <ThemedText type="caption" themeColor="textTertiary">
            {name.length}/100
          </ThemedText>
        </View>

        <Button label="Save changes" loading={updateAlbum.isPending} disabled={!hasChanges} onPress={handleSave} />

        <Button label="Delete album" variant="danger" loading={deleteAlbum.isPending} onPress={handleDelete} />
      </View>
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
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  field: {
    gap: Spacing.xs,
  },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
});
