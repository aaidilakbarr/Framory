import { MEMORY_BUCKET, SIGNED_URL_TTL_SECONDS, supabase } from "@/lib/supabase";
import { requireUserId } from "@/services/auth";
import { replacePhotoTags } from "@/services/tags";
import type {
  Album,
  PageResult,
  Photo,
  PhotoWithRelations,
  Tag,
} from "@/types/database";
import { toAppError } from "@/utils/errors";
import {
  assertSupportedImage,
  extensionForImage,
  makeObjectId,
  toUploadBody,
  type UploadableImage,
} from "@/utils/files";

const PHOTO_SELECT = `
  *,
  album:albums!photos_album_owner_fkey(id,name),
  favorites(user_id),
  photo_tags(tag:tags(*))
`;

const FAVORITE_PHOTO_SELECT = `
  *,
  album:albums!photos_album_owner_fkey(id,name),
  favorites:favorites!inner(user_id),
  photo_tags(tag:tags(*))
`;

type RawPhoto = Photo & {
  album: Pick<Album, "id" | "name"> | null;
  favorites: { user_id: string }[] | null;
  photo_tags: { tag: Tag | null }[] | null;
};

export type PhotoFilters = {
  albumId?: string | null;
  favoriteOnly?: boolean;
  pageSize?: number;
};

export type UploadPhotoInput = {
  source: UploadableImage;
  mimeType: string;
  fileName?: string;
  size?: number;
  caption?: string;
  capturedAt?: string | Date;
  albumId?: string | null;
  tags?: string[];
};

export type UpdatePhotoInput = {
  id: string;
  caption?: string;
  capturedAt?: string | Date;
  albumId?: string | null;
  tags?: string[];
};

function normalizeRawPhoto(photo: RawPhoto, imageUrl: string | null): PhotoWithRelations {
  return {
    id: photo.id,
    user_id: photo.user_id,
    album_id: photo.album_id,
    storage_path: photo.storage_path,
    caption: photo.caption,
    captured_at: photo.captured_at,
    uploaded_at: photo.uploaded_at,
    updated_at: photo.updated_at,
    album: photo.album,
    tags: photo.photo_tags?.flatMap(({ tag }) => (tag ? [tag] : [])) ?? [],
    is_favorite: Boolean(photo.favorites?.length),
    image_url: imageUrl,
  };
}

async function attachSignedUrls(rows: RawPhoto[]): Promise<PhotoWithRelations[]> {
  if (!rows.length) return [];
  const paths = [...new Set(rows.map((photo) => photo.storage_path))];
  const { data, error } = await supabase.storage
    .from(MEMORY_BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);

  if (error) {
    return rows.map((photo) => normalizeRawPhoto(photo, null));
  }

  const urls = new Map(data.map((item) => [item.path, item.signedUrl ?? null]));
  return rows.map((photo) => normalizeRawPhoto(photo, urls.get(photo.storage_path) ?? null));
}

export async function listPhotos(
  filters: PhotoFilters = {},
  page = 0,
): Promise<PageResult<PhotoWithRelations>> {
  const userId = await requireUserId();
  const pageSize = Math.min(Math.max(filters.pageSize ?? 24, 1), 60);
  const from = page * pageSize;
  const to = from + pageSize - 1;
  const select = filters.favoriteOnly ? FAVORITE_PHOTO_SELECT : PHOTO_SELECT;

  let query = supabase
    .from("photos")
    .select(select, { count: "exact" })
    .eq("user_id", userId)
    .order("captured_at", { ascending: false })
    .order("uploaded_at", { ascending: false })
    .range(from, to);

  if (filters.favoriteOnly) query = query.eq("favorites.user_id", userId);
  if (filters.albumId === null) query = query.is("album_id", null);
  if (typeof filters.albumId === "string") query = query.eq("album_id", filters.albumId);

  const { data, error, count } = await query;
  if (error) throw toAppError(error, "Could not load memories.");

  const rows = data as unknown as RawPhoto[];
  const items = await attachSignedUrls(rows);
  return {
    items,
    total: count,
    nextPage:
      count === null
        ? items.length === pageSize
          ? page + 1
          : undefined
        : from + items.length < count
          ? page + 1
          : undefined,
  };
}

export async function getPhotosByIds(photoIds: string[]): Promise<PhotoWithRelations[]> {
  if (!photoIds.length) return [];
  const userId = await requireUserId();
  const uniqueIds = [...new Set(photoIds)];
  const { data, error } = await supabase
    .from("photos")
    .select(PHOTO_SELECT)
    .eq("user_id", userId)
    .in("id", uniqueIds)
    .order("captured_at", { ascending: false });
  if (error) throw toAppError(error, "Could not load memories.");
  return attachSignedUrls(data as unknown as RawPhoto[]);
}

export async function getPhotoById(photoId: string) {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("photos")
    .select(PHOTO_SELECT)
    .eq("id", photoId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw toAppError(error, "Could not load the memory.");
  if (!data) return null;
  return (await attachSignedUrls([data as unknown as RawPhoto]))[0] ?? null;
}

export async function uploadPhoto(input: UploadPhotoInput) {
  assertSupportedImage(input.mimeType, input.size);
  const userId = await requireUserId();
  const extension = extensionForImage(input.mimeType, input.fileName);
  const storagePath = `${userId}/${makeObjectId()}.${extension}`;
  const body = await toUploadBody(input.source);

  const { error: storageError } = await supabase.storage.from(MEMORY_BUCKET).upload(storagePath, body, {
    contentType: input.mimeType,
    cacheControl: "31536000",
    upsert: false,
  });
  if (storageError) throw toAppError(storageError, "Could not upload the photo.");

  const capturedAt = input.capturedAt
    ? new Date(input.capturedAt).toISOString()
    : new Date().toISOString();
  const { data, error } = await supabase
    .from("photos")
    .insert({
      user_id: userId,
      album_id: input.albumId ?? null,
      storage_path: storagePath,
      caption: input.caption?.trim() ?? "",
      captured_at: capturedAt,
    })
    .select("id")
    .single();

  if (error) {
    await supabase.storage.from(MEMORY_BUCKET).remove([storagePath]);
    throw toAppError(error, "The photo uploaded but its memory record could not be saved.");
  }

  try {
    if (input.tags) await replacePhotoTags(data.id, input.tags);
  } catch (tagError) {
    await Promise.all([
      supabase.from("photos").delete().eq("id", data.id),
      supabase.storage.from(MEMORY_BUCKET).remove([storagePath]),
    ]);
    throw tagError;
  }

  return getPhotoById(data.id);
}

export async function updatePhoto(input: UpdatePhotoInput) {
  const userId = await requireUserId();
  const update: {
    caption?: string;
    captured_at?: string;
    album_id?: string | null;
  } = {};

  if (input.caption !== undefined) update.caption = input.caption.trim();
  if (input.capturedAt !== undefined) update.captured_at = new Date(input.capturedAt).toISOString();
  if (input.albumId !== undefined) update.album_id = input.albumId;

  if (Object.keys(update).length) {
    const { error } = await supabase
      .from("photos")
      .update(update)
      .eq("id", input.id)
      .eq("user_id", userId);
    if (error) throw toAppError(error, "Could not update the memory.");
  }

  if (input.tags !== undefined) await replacePhotoTags(input.id, input.tags);
  return getPhotoById(input.id);
}

export async function deletePhoto(photoId: string) {
  const userId = await requireUserId();
  const { data: photo, error: lookupError } = await supabase
    .from("photos")
    .select("storage_path")
    .eq("id", photoId)
    .eq("user_id", userId)
    .maybeSingle();
  if (lookupError) throw toAppError(lookupError, "Could not find the memory.");
  if (!photo) return;

  const { error: deleteError } = await supabase
    .from("photos")
    .delete()
    .eq("id", photoId)
    .eq("user_id", userId);
  if (deleteError) throw toAppError(deleteError, "Could not delete the memory.");

  const { error: storageError } = await supabase.storage
    .from(MEMORY_BUCKET)
    .remove([photo.storage_path]);
  if (storageError) {
    throw toAppError(storageError, "Memory was deleted, but cloud file cleanup failed.");
  }
}
