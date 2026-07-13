import { supabase } from "@/lib/supabase";
import { requireUserId } from "@/services/auth";
import type { Tag } from "@/types/database";
import { toAppError } from "@/utils/errors";

export function normalizeTagName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export async function listTags(): Promise<Tag[]> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("user_id", userId)
    .order("name");
  if (error) throw toAppError(error, "Could not load tags.");
  return data;
}

export async function getOrCreateTags(names: string[]): Promise<Tag[]> {
  const userId = await requireUserId();
  const normalized = [...new Set(names.map(normalizeTagName).filter(Boolean))].slice(0, 20);
  if (!normalized.length) return [];

  const { data: existing, error: lookupError } = await supabase
    .from("tags")
    .select("*")
    .eq("user_id", userId);
  if (lookupError) throw toAppError(lookupError, "Could not load tags.");

  const existingNames = new Set((existing ?? []).map(({ name }) => normalizeTagName(name)));
  const missing = normalized.filter((name) => !existingNames.has(name));
  if (missing.length) {
    const { error: insertError } = await supabase
      .from("tags")
      .insert(missing.map((name) => ({ user_id: userId, name })));
    if (insertError && insertError.code !== "23505") {
      throw toAppError(insertError, "Could not save tags.");
    }
  }

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("user_id", userId);
  if (error) throw toAppError(error, "Could not load saved tags.");
  const requestedNames = new Set(normalized);
  return (data ?? []).filter((tag) => requestedNames.has(normalizeTagName(tag.name)));
}

export async function createTag(name: string) {
  const tags = await getOrCreateTags([name]);
  if (!tags[0]) throw new Error("Tag name is required.");
  return tags[0];
}

export async function replacePhotoTags(photoId: string, names: string[]) {
  const tags = await getOrCreateTags(names);
  const { error: deleteError } = await supabase.from("photo_tags").delete().eq("photo_id", photoId);
  if (deleteError) throw toAppError(deleteError, "Could not update photo tags.");
  if (!tags.length) return [];

  const { error: insertError } = await supabase.from("photo_tags").insert(
    tags.map((tag) => ({
      photo_id: photoId,
      tag_id: tag.id,
    })),
  );
  if (insertError) throw toAppError(insertError, "Could not attach tags to the photo.");
  return tags;
}

export async function deleteTag(tagId: string) {
  const userId = await requireUserId();
  const { error } = await supabase.from("tags").delete().eq("id", tagId).eq("user_id", userId);
  if (error) throw toAppError(error, "Could not delete the tag.");
}
