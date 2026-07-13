import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera, ImagePlus, Tag } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { Spacing } from '@/constants/theme';
import { useAlbums } from '@/features/albums/hooks';
import { useUploadPhoto } from '@/features/photos/hooks';
import { useTheme } from '@/hooks/use-theme';
import type { PickedImage } from '@/utils/pick-image';
import { pickImage, captureImage } from '@/utils/pick-image';

export default function UploadPhotoScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: albums } = useAlbums();
  const uploadPhoto = useUploadPhoto();

  const [image, setImage] = useState<PickedImage | null>(null);
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [albumId, setAlbumId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const captionRef = useRef<TextInput>(null);

  async function handlePick() {
    setError(null);
    try {
      const picked = await pickImage();
      if (picked) setImage(picked);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not pick an image.');
    }
  }

  async function handleCapture() {
    setError(null);
    try {
      const captured = await captureImage();
      if (captured) setImage(captured);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not capture an image.');
    }
  }

  async function handleUpload() {
    if (!image) {
      setError('Choose a photo first.');
      return;
    }

    setError(null);
    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    uploadPhoto.mutate(
      {
        source: image.source,
        mimeType: image.mimeType,
        fileName: image.fileName,
        size: image.size,
        caption,
        tags: tagList,
        albumId,
      },
      {
        onSuccess: (photo) => {
          if (photo) {
            router.replace(`/(app)/photo/${photo.id}`);
          } else {
            router.back();
          }
        },
        onError: (e) => {
          setError(e instanceof Error ? e.message : 'Could not upload the photo.');
        },
      },
    );
  }

  return (
    <ThemedView style={styles.page}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable accessibilityLabel="Close" accessibilityRole="button" hitSlop={8} onPress={() => router.back()}>
          <ArrowLeft color={theme.text} size={22} strokeWidth={1.8} />
        </Pressable>
        <ThemedText type="heading">New memory</ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {image ? (
          <Pressable onPress={handlePick} style={({ pressed }) => [styles.imageButton, pressed && styles.pressed]}>
            <Image source={{ uri: image.source }} contentFit="contain" style={styles.preview} />
          </Pressable>
        ) : (
          <View style={[styles.placeholder, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
            <ImagePlus color={theme.textTertiary} size={36} strokeWidth={1.5} />
            <ThemedText type="caption" themeColor="textTertiary">
              Choose a stamp cut photo
            </ThemedText>
          </View>
        )}

        <View style={styles.actions}>
          <Button label="Pick from library" variant="secondary" leftElement={<ImagePlus color={theme.text} size={17} />} onPress={() => void handlePick()} />
          <Button label="Take photo" variant="secondary" leftElement={<Camera color={theme.text} size={17} />} onPress={() => void handleCapture()} />
        </View>

        <View style={styles.field}>
          <ThemedText type="label">Caption</ThemedText>
          <TextInput
            ref={captionRef}
            value={caption}
            onChangeText={setCaption}
            placeholder="What made this moment special?"
            placeholderTextColor={theme.textTertiary}
            style={[styles.textInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
            multiline
            maxLength={2000}
          />
        </View>

        {albums && albums.length > 0 ? (
          <View style={styles.field}>
            <ThemedText type="label">Album</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.albumChips}>
              <Pressable
                onPress={() => setAlbumId(null)}
                style={[
                  styles.chip,
                  { borderColor: theme.border, backgroundColor: albumId === null ? theme.accentSoft : theme.surface },
                ]}>
                <ThemedText type="caption" themeColor={albumId === null ? 'accentStrong' : 'textSecondary'}>
                  Unsorted
                </ThemedText>
              </Pressable>
              {albums.map((album) => (
                <Pressable
                  key={album.id}
                  onPress={() => setAlbumId(album.id)}
                  style={[
                    styles.chip,
                    { borderColor: theme.border, backgroundColor: albumId === album.id ? theme.accentSoft : theme.surface },
                  ]}>
                  <ThemedText type="caption" themeColor={albumId === album.id ? 'accentStrong' : 'textSecondary'}>
                    {album.name}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.field}>
          <ThemedText type="label">Tags</ThemedText>
          <View style={[styles.tagWrap, { borderColor: theme.border }]}>
            <Tag color={theme.textTertiary} size={16} strokeWidth={1.8} />
            <TextInput
              value={tags}
              onChangeText={setTags}
              placeholder="date, friends, cafe…"
              placeholderTextColor={theme.textTertiary}
              style={[styles.tagInput, { color: theme.text }]}
              autoCapitalize="none"
            />
          </View>
          <ThemedText type="caption" themeColor="textTertiary">
            Separate tags with commas.
          </ThemedText>
        </View>

        {error ? <Notice variant="error" message={error} /> : null}

        <Button
          label="Save memory"
          loading={uploadPhoto.isPending}
          disabled={!image}
          onPress={() => void handleUpload()}
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
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: Spacing.xl,
  },
  imageButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    aspectRatio: 0.75,
    borderRadius: 16,
  },
  placeholder: {
    aspectRatio: 0.75,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  actions: {
    gap: Spacing.two,
  },
  field: {
    gap: Spacing.xs,
  },
  textInput: {
    minHeight: 80,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    lineHeight: 22,
  },
  albumChips: {
    gap: Spacing.two,
    paddingVertical: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
    borderWidth: 1,
  },
  tagWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    backgroundColor: 'transparent',
    minHeight: 48,
  },
  tagInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.sm,
  },
  pressed: {
    opacity: 0.8,
  },
});
