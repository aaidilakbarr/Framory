import { Image } from "expo-image";
import { Heart, MoreHorizontal, Trash2 } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { PhotoWithRelations } from "@/types/database";

export function MemoryCard({
  photo,
  onPress,
  onFavorite,
  onDelete,
  compact = false,
}: {
  photo: PhotoWithRelations;
  onPress: () => void;
  onFavorite: () => void;
  onDelete?: () => void;
  compact?: boolean;
}) {
  const theme = useTheme();
  const date = new Date(photo.captured_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Pressable
        accessibilityLabel={photo.caption ? `Open ${photo.caption}` : "Open memory"}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.imageButton, pressed && styles.pressed]}>
        {photo.image_url ? (
          <Image
            source={{ uri: photo.image_url }}
            contentFit="cover"
            transition={180}
            style={[styles.image, compact && styles.compactImage]}
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: theme.accentSoft }]}>
            <ThemedText type="overline" themeColor="accentStrong">
              Memory
            </ThemedText>
          </View>
        )}
        <View style={[styles.dateBadge, { backgroundColor: theme.overlay }]}>
          <ThemedText type="caption" style={styles.dateText}>
            {date}
          </ThemedText>
        </View>
      </Pressable>
      <View style={styles.info}>
        <View style={styles.copy}>
          <ThemedText numberOfLines={1} type="bodyStrong">
            {photo.caption || "Untitled memory"}
          </ThemedText>
          <ThemedText numberOfLines={1} type="caption" themeColor="textSecondary">
            {photo.album?.name ?? "Unsorted"}
          </ThemedText>
        </View>
        <View style={styles.actions}>
          <Pressable
            accessibilityLabel={photo.is_favorite ? "Remove from favorites" : "Add to favorites"}
            accessibilityRole="button"
            hitSlop={8}
            onPress={onFavorite}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
            <Heart
              color={photo.is_favorite ? theme.accentStrong : theme.textTertiary}
              fill={photo.is_favorite ? theme.accentStrong : "transparent"}
              size={19}
              strokeWidth={1.8}
            />
          </Pressable>
          {onDelete ? (
            <Pressable
              accessibilityLabel="Delete memory"
              accessibilityRole="button"
              hitSlop={8}
              onPress={onDelete}
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
              <Trash2 color={theme.textTertiary} size={17} strokeWidth={1.8} />
            </Pressable>
          ) : null}
          {!onDelete ? <MoreHorizontal color={theme.textTertiary} size={18} /> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    overflow: "hidden",
  },
  imageButton: {
    aspectRatio: 0.92,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  compactImage: {
    aspectRatio: 1,
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dateBadge: {
    position: "absolute",
    left: Spacing.sm,
    bottom: Spacing.sm,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.one,
  },
  dateText: {
    color: "#FFFFFF",
  },
  info: {
    minHeight: 62,
    padding: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  iconButton: {
    minWidth: 30,
    minHeight: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.56,
  },
});
