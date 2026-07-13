import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useCreateAlbum } from '@/features/albums/hooks';
import { useTheme } from '@/hooks/use-theme';

export default function NewAlbumScreen() {
  const theme = useTheme();
  const router = useRouter();
  const createAlbum = useCreateAlbum();
  const [name, setName] = useState('');
  const inputRef = useRef<TextInput>(null);

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Album name is required.');
      return;
    }

    const album = await createAlbum.mutateAsync({ name: trimmed });
    if (album) {
      router.replace(`/(app)/album/${album.id}`);
    }
  }

  return (
    <ThemedView style={styles.page}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable accessibilityLabel="Close" accessibilityRole="button" hitSlop={8} onPress={() => router.back()}>
          <ArrowLeft color={theme.text} size={22} strokeWidth={1.8} />
        </Pressable>
        <ThemedText type="heading">New album</ThemedText>
      </View>

      <View style={styles.content}>
        <View style={styles.field}>
          <ThemedText type="label">Album name</ThemedText>
          <TextInput
            ref={inputRef}
            value={name}
            onChangeText={setName}
            placeholder="Date, Travel, Friends…"
            placeholderTextColor={theme.textTertiary}
            style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
            autoCapitalize="words"
            returnKeyType="done"
            maxLength={100}
            onSubmitEditing={() => void handleCreate()}
          />
          <ThemedText type="caption" themeColor="textTertiary">
            {name.length}/100
          </ThemedText>
        </View>

        <Button label="Create album" loading={createAlbum.isPending} disabled={!name.trim()} onPress={() => void handleCreate()} />
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
