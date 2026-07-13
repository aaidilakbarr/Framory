import { Image } from "expo-image";
import { Heart } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { PhotoWithRelations } from "@/types/database";

export function MemoryThumb({
  photo,
  onPress,
  onFavorite,
  size = 1,
}: {
  photo: PhotoWithRelations;
  onPress: () => void;
  onFavorite?: () => void;
  size?: number;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityLabel={photo.caption ? `Open ${photo.caption}` : "Open memory"}
      accessibilityRole="button"
      onPress={onPress}
      onLongPress={onFavorite}
      delayLongPress={350}
      style={({ pressed }) => [
        { flex: size, aspectRatio: 1 },
        styles.gap,
        pressed && styles.pressed,
      ]}>
      {photo.image_url ? (
        <Image
          source={{ uri: photo.image_url }}
          contentFit="cover"
          transition={120}
          style={styles.fill}
        />
      ) : (
        <View style={[styles.fill, { backgroundColor: theme.accentSoft }]} />
      )}
      {photo.is_favorite ? (
        <View style={styles.heartBadge}>
          <Heart
            color={theme.onAction}
            fill={theme.accentStrong}
            size={10}
            strokeWidth={1.5}
          />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gap: {
    margin: Spacing.hairline,
    position: "relative",
    overflow: "hidden",
  },
  fill: {
    width: "100%",
    height: "100%",
  },
  heartBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    borderRadius: 12,
    padding: 3,
  },
  pressed: {
    opacity: 0.8,
  },
});
