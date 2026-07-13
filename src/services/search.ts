import { supabase } from "@/lib/supabase";
import { requireUserId } from "@/services/auth";
import { getPhotosByIds } from "@/services/photos";
import { toAppError } from "@/utils/errors";

function ilikePattern(value: string) {
  return `%${value.replace(/[\\%_]/g, "\\$&")}%`;
}

export async function searchMemories(rawQuery: string) {
  const search = rawQuery.trim();
  if (!search) return [];

  const userId = await requireUserId();
  const pattern = ilikePattern(search);
  const [captionMatches, albumMatches, tagMatches] = await Promise.all([
    supabase
      .from("photos")
      .select("id")
      .eq("user_id", userId)
      .ilike("caption", pattern)
      .limit(100),
    supabase
      .from("albums")
      .select("id")
      .eq("user_id", userId)
      .ilike("name", pattern)
      .limit(50),
    supabase.from("tags").select("id").eq("user_id", userId).ilike("name", pattern).limit(50),
  ]);

  const firstError = captionMatches.error ?? albumMatches.error ?? tagMatches.error;
  if (firstError) throw toAppError(firstError, "Could not search memories.");

  const albumIds = (albumMatches.data ?? []).map(({ id }) => id);
  const tagIds = (tagMatches.data ?? []).map(({ id }) => id);
  const [albumPhotos, taggedPhotos] = await Promise.all([
    albumIds.length
      ? supabase
          .from("photos")
          .select("id")
          .eq("user_id", userId)
          .in("album_id", albumIds)
          .limit(100)
      : Promise.resolve({ data: [], error: null }),
    tagIds.length
      ? supabase
          .from("photo_tags")
          .select("photo_id")
          .eq("user_id", userId)
          .in("tag_id", tagIds)
          .limit(100)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const relatedError = albumPhotos.error ?? taggedPhotos.error;
  if (relatedError) throw toAppError(relatedError, "Could not search memories.");

  const photoIds = [
    ...new Set([
      ...(captionMatches.data ?? []).map(({ id }) => id),
      ...(albumPhotos.data ?? []).map(({ id }) => id),
      ...(taggedPhotos.data ?? []).map(({ photo_id }) => photo_id),
    ]),
  ].slice(0, 100);

  return getPhotosByIds(photoIds);
}
