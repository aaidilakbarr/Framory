import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Camera, ChevronRight, LogOut, Pencil, Settings, ShieldCheck } from "lucide-react-native";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spacing } from "@/constants/theme";
import { useProfile, useProfileStats, useUploadAvatar } from "@/features/profile/hooks";
import { useAuth } from "@/features/auth/hooks";
import { useTheme } from "@/hooks/use-theme";
import { pickImage } from "@/utils/pick-image";

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { profile, user, signOut, isPending } = useAuth();
  const { data: currentProfile } = useProfile();
  const { data: stats } = useProfileStats();
  const uploadAvatar = useUploadAvatar();
  const visibleProfile = currentProfile ?? profile;

  async function handleAvatar() {
    const image = await pickImage();
    if (!image) return;
    uploadAvatar.mutate(image);
  }

  function handleSignOut() {
    Alert.alert("Sign out", "Your memories will stay safely in the cloud.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => void signOut() },
    ]);
  }

  return (
    <ThemedView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText type="title">Profile</ThemedText>
          <Pressable
            accessibilityLabel="Edit profile"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => router.push("/(app)/profile/edit")}>
            <Pencil color={theme.text} size={20} strokeWidth={1.8} />
          </Pressable>
        </View>

        <View style={styles.identity}>
          <Pressable
            accessibilityLabel="Change profile photo"
            accessibilityRole="button"
            onPress={() => void handleAvatar()}
            style={({ pressed }) => [styles.avatarButton, pressed && styles.pressed]}>
            {visibleProfile?.avatar_display_url ? (
              <Image source={{ uri: visibleProfile.avatar_display_url }} contentFit="cover" style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: theme.accentSoft }]}>
                <ThemedText type="title" themeColor="accentStrong">
                  {(visibleProfile?.username ?? user?.email ?? "S").slice(0, 1).toUpperCase()}
                </ThemedText>
              </View>
            )}
            <View style={[styles.cameraBadge, { backgroundColor: theme.action }]}>
              <Camera color={theme.onAction} size={14} strokeWidth={2} />
            </View>
          </Pressable>
          <ThemedText type="heading">{visibleProfile?.username ?? "Your journal"}</ThemedText>
          <ThemedText type="caption" themeColor="textSecondary">
            {user?.email ?? "Private memory keeper"}
          </ThemedText>
        </View>

        <Card style={styles.statsCard}>
          <Stat value={stats?.totalPhotos ?? 0} label="Photos" />
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <Stat value={stats?.totalAlbums ?? 0} label="Albums" />
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <Stat value={stats?.totalFavorites ?? 0} label="Favorites" />
        </Card>

        <View style={styles.section}>
          <ThemedText type="overline" themeColor="textTertiary">
            Your archive
          </ThemedText>
          <MenuRow icon={<ShieldCheck color={theme.accentStrong} size={19} />} title="Private by design" detail="Only you can see your memories" />
          <MenuRow icon={<Settings color={theme.textSecondary} size={19} />} title="Preferences" detail="Theme and app settings" onPress={() => Alert.alert("Preferences", "Your journal follows the device theme automatically.")} />
        </View>

        <Button
          label="Sign out"
          variant="secondary"
          loading={isPending}
          leftElement={<LogOut color={theme.text} size={17} />}
          onPress={handleSignOut}
        />
      </ScrollView>
    </ThemedView>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <ThemedText type="heading">{value}</ThemedText>
      <ThemedText type="caption" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

function MenuRow({ icon, title, detail, onPress }: { icon: React.ReactNode; title: string; detail: string; onPress?: () => void }) {
  const theme = useTheme();
  const content = (
    <View style={styles.menuRow}>
      <View style={[styles.menuIcon, { backgroundColor: theme.accentSoft }]}>{icon}</View>
      <View style={styles.menuCopy}>
        <ThemedText type="bodyStrong">{title}</ThemedText>
        <ThemedText type="caption" themeColor="textSecondary">{detail}</ThemedText>
      </View>
      {onPress ? <ChevronRight color={theme.textTertiary} size={17} /> : null}
    </View>
  );
  return onPress ? <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>{content}</Pressable> : content;
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  identity: {
    alignItems: "center",
    gap: Spacing.one,
  },
  avatarButton: {
    width: 94,
    height: 94,
    borderRadius: 47,
    marginBottom: Spacing.sm,
    position: "relative",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 47,
  },
  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: 3,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: Spacing.md,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  section: {
    gap: Spacing.sm,
  },
  menuRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  menuCopy: {
    flex: 1,
    gap: 2,
  },
  pressed: {
    opacity: 0.58,
  },
});
