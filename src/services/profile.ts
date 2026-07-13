import { AVATAR_BUCKET, SIGNED_URL_TTL_SECONDS, supabase } from "@/lib/supabase";
import { requireUserId } from "@/services/auth";
import type { Profile, ProfileStats, ProfileWithAvatar } from "@/types/database";
import {
  assertSupportedImage,
  extensionForImage,
  MAX_AVATAR_IMAGE_BYTES,
  toUploadBody,
  type UploadableImage,
} from "@/utils/files";
import { toAppError } from "@/utils/errors";

async function withAvatarUrl(profile: Profile): Promise<ProfileWithAvatar> {
  if (!profile.avatar_path) {
    return { ...profile, avatar_display_url: profile.avatar_url };
  }

  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .createSignedUrl(profile.avatar_path, SIGNED_URL_TTL_SECONDS);

  return {
    ...profile,
    avatar_display_url: error ? profile.avatar_url : data.signedUrl,
  };
}

export async function getProfileById(userId: string): Promise<ProfileWithAvatar | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw toAppError(error, "Could not load the profile.");
  return data ? withAvatarUrl(data) : null;
}

export async function getCurrentProfile() {
  return getProfileById(await requireUserId());
}

export async function updateProfile(input: { username?: string; avatarUrl?: string | null }) {
  const userId = await requireUserId();
  const update: { username?: string; avatar_url?: string | null } = {};

  if (input.username !== undefined) update.username = input.username.trim();
  if (input.avatarUrl !== undefined) update.avatar_url = input.avatarUrl;

  const { data, error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", userId)
    .select("*")
    .single();

  if (error) throw toAppError(error, "Could not update the profile.");
  return withAvatarUrl(data);
}

export type UploadAvatarInput = {
  source: UploadableImage;
  mimeType: string;
  fileName?: string;
  size?: number;
};

export async function uploadAvatar(input: UploadAvatarInput) {
  assertSupportedImage(input.mimeType, input.size, MAX_AVATAR_IMAGE_BYTES);
  const userId = await requireUserId();
  const current = await getProfileById(userId);
  const extension = extensionForImage(input.mimeType, input.fileName);
  const storagePath = `${userId}/avatar.${extension}`;
  const body = await toUploadBody(input.source);

  const { error: uploadError } = await supabase.storage.from(AVATAR_BUCKET).upload(storagePath, body, {
    contentType: input.mimeType,
    upsert: true,
    cacheControl: "3600",
  });
  if (uploadError) throw toAppError(uploadError, "Could not upload the avatar.");

  const { data, error } = await supabase
    .from("profiles")
    .update({ avatar_path: storagePath })
    .eq("id", userId)
    .select("*")
    .single();

  if (error) {
    if (storagePath !== current?.avatar_path) {
      await supabase.storage.from(AVATAR_BUCKET).remove([storagePath]);
    }
    throw toAppError(error, "The avatar uploaded but could not be attached to the profile.");
  }

  if (current?.avatar_path && current.avatar_path !== storagePath) {
    await supabase.storage.from(AVATAR_BUCKET).remove([current.avatar_path]);
  }

  return withAvatarUrl(data);
}

export async function removeAvatar() {
  const userId = await requireUserId();
  const current = await getProfileById(userId);

  const { data, error } = await supabase
    .from("profiles")
    .update({ avatar_path: null })
    .eq("id", userId)
    .select("*")
    .single();
  if (error) throw toAppError(error, "Could not remove the avatar.");

  if (current?.avatar_path) {
    const { error: removeError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .remove([current.avatar_path]);
    if (removeError) throw toAppError(removeError, "Avatar was detached, but file cleanup failed.");
  }

  return withAvatarUrl(data);
}

export async function getProfileStats(): Promise<ProfileStats> {
  const userId = await requireUserId();
  const [albums, photos, favorites] = await Promise.all([
    supabase.from("albums").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("photos").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase
      .from("favorites")
      .select("photo_id", { count: "exact", head: true })
      .eq("user_id", userId),
  ]);

  const error = albums.error ?? photos.error ?? favorites.error;
  if (error) throw toAppError(error, "Could not load profile statistics.");

  return {
    totalAlbums: albums.count ?? 0,
    totalPhotos: photos.count ?? 0,
    totalFavorites: favorites.count ?? 0,
  };
}
