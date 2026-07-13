import { useRouter } from 'expo-router';
import { ArrowLeft, Search, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { MemoryCard } from '@/components/memory-card';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useMemorySearch } from '@/features/search/hooks';
import { useToggleFavorite } from '@/features/favorites/hooks';
import { useTheme } from '@/hooks/use-theme';

export default function SearchScreen() {
  const theme = useTheme();
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const { data, isLoading, isFetching } = useMemorySearch(query);
  const toggleFavorite = useToggleFavorite();

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  const results = data ?? [];
  const trimmed = query.trim();

  return (
    <ThemedView style={styles.page}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable accessibilityLabel="Go back" accessibilityRole="button" hitSlop={8} onPress={() => router.back()}>
          <ArrowLeft color={theme.text} size={22} strokeWidth={1.8} />
        </Pressable>
        <View style={[styles.inputWrap, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
          <Search color={theme.textTertiary} size={17} strokeWidth={1.8} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search captions, albums, tags…"
            placeholderTextColor={theme.textTertiary}
            style={[styles.input, { color: theme.text }]}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query ? (
            <Pressable accessibilityLabel="Clear search" accessibilityRole="button" hitSlop={8} onPress={() => setQuery('')}>
              <X color={theme.textTertiary} size={16} strokeWidth={2} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {!trimmed ? (
        <View style={styles.hint}>
          <EmptyState
            title="Find a memory"
            description="Type a caption, album name, or tag to revisit a moment."
          />
        </View>
      ) : isLoading || isFetching ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.accentStrong} />
        </View>
      ) : results.length === 0 ? (
        <View style={styles.hint}>
          <EmptyState
            title="No matches"
            description={`Nothing found for “${trimmed}.” Try a different word.`}
          />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <MemoryCard
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    flex: 1,
    justifyContent: 'center',
  },
  list: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
});
