import { useRouter } from 'expo-router';
import { ArrowLeft, Camera } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useProfile, useUpdateProfile, useUploadAvatar } from '@/features/profile/hooks';
import { useAuth } from '@/features/auth/hooks';
import { useTheme } from '@/hooks/use-theme';
import { pickAvatarImage } from '@/utils/pick-image';

export default function EditProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const [username, setUsername] = useState(profile?.username ?? '');

  const hasChanges = username.trim() !== (profile?.username ?? '') && username.trim().length > 0;
  const busy = updateProfile.isPending || uploadAvatar.isPending;

  async function handleAvatar() {
    try {
      const image = await pickAvatarImage();
      if (!image) return;
      uploadAvatar.mutate(image);
    } catch (e) {
      Alert.alert(e instanceof Error ? e.message : 'Could not pick an image.');
    }
  }

  function handleSave() {
    if (!hasChanges) return;
    updateProfile.mutate(
      { username: username.trim() },
      {
        onSuccess: () => {
          Alert.alert('Saved', 'Your profile has been updated.');
          router.back();
        },
      },
    );
  }

  return (
    <ThemedView style={styles.page}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable accessibilityLabel="Go back" accessibilityRole="button" hitSlop={8} onPress={() => router.back()}>
          <ArrowLeft color={theme.text} size={22} strokeWidth={1.8} />
        </Pressable>
        <ThemedText type="heading">Edit profile</ThemedText>
      </View>

      <View style={styles.content}>
        <Pressable
          accessibilityLabel="Change profile photo"
          accessibilityRole="button"
          onPress={() => void handleAvatar()}
          style={({ pressed }) => [styles.avatarButton, pressed && styles.pressed]}>
          <View style={[styles.avatar, { backgroundColor: theme.accentSoft }]}>
            <ThemedText type="title" themeColor="accentStrong">
              {(username || (user?.email ?? 'S')).slice(0, 1).toUpperCase()}
            </ThemedText>
          </View>
          <View style={[styles.cameraBadge, { backgroundColor: theme.action }]}>
            <Camera color={theme.onAction} size={14} strokeWidth={2} />
          </View>
        </Pressable>

        <View style={styles.field}>
          <ThemedText type="label">Username</ThemedText>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="How should we address you?"
            placeholderTextColor={theme.textTertiary}
            style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
            autoCapitalize="words"
            maxLength={50}
          />
          <ThemedText type="caption" themeColor="textTertiary">
            {username.length}/50
          </ThemedText>
        </View>

        <Button label="Save changes" loading={busy} disabled={!hasChanges} onPress={handleSave} />
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
    alignItems: 'stretch',
  },
  avatarButton: {
    alignSelf: 'center',
    width: 94,
    height: 94,
    borderRadius: 47,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 47,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: 3,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
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
  pressed: {
    opacity: 0.8,
  },
});
