import { MEMORY_BUCKET, SIGNED_URL_TTL_SECONDS, supabase } from "@/lib/supabase";
import { requireUserId } from "@/services/auth";
import type { Album, AlbumSummary } from "@/types/database";
import { AppError, toAppError } from "@/utils/errors";

type RawAlbum = Album & {
  album_photos: { count: number }[] | null;
  cover: { storage_path: string } | null;
};

const ALBUM_SELECT = `
  *,
  album_photos:photos!photos_album_owner_fkey(count),
  cover:photos!albums_cover_photo_owner_fkey(storage_path)
`;

async function findFallbackCover(albumId: string) {
  const { data } = await supabase
    .from("photos")
    .select("storage_path")
    .eq("album_id", albumId)
    .order("captured_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.storage_path ?? null;
}

async function normalizeAlbums(rows: RawAlbum[]): Promise<AlbumSummary[]> {
  const coverPaths = await Promise.all(
    rows.map(async (album) => album.cover?.storage_path ?? findFallbackCover(album.id)),
  );
  const uniquePaths = [...new Set(coverPaths.filter((path): path is string => Boolean(path)))];
  const { data: signed } = uniquePaths.length
    ? await supabase.storage
        .from(MEMORY_BUCKET)
        .createSignedUrls(uniquePaths, SIGNED_URL_TTL_SECONDS)
    : { data: [] };
  const urls = new Map((signed ?? []).map((item) => [item.path, item.signedUrl ?? null]));

  return rows.map((album, index) => ({
    id: album.id,
    user_id: album.user_id,
    name: album.name,
    cover_photo_id: album.cover_photo_id,
    created_at: album.created_at,
    updated_at: album.updated_at,
    photo_count: album.album_photos?.[0]?.count ?? 0,
    cover_url: coverPaths[index] ? (urls.get(coverPaths[index]!) ?? null) : null,
  }));
}

export async function listAlbums() {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("albums")
    .select(ALBUM_SELECT)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw toAppError(error, "Could not load albums.");
  return normalizeAlbums(data as unknown as RawAlbum[]);
}

export async function getAlbumById(albumId: string) {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("albums")
    .select(ALBUM_SELECT)
    .eq("id", albumId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw toAppError(error, "Could not load the album.");
  if (!data) return null;
  return (await normalizeAlbums([data as unknown as RawAlbum]))[0] ?? null;
}

export async function createAlbum(input: { name: string }) {
  const userId = await requireUserId();
  const name = input.name.trim();
  if (!name) throw new AppError("Album name is required.", { code: "VALIDATION_ERROR" });

  const { data, error } = await supabase
    .from("albums")
    .insert({ user_id: userId, name })
    .select("id")
    .single();
  if (error) throw toAppError(error, "Could not create the album.");
  return getAlbumById(data.id);
}

export type UpdateAlbumInput = {
  id: string;
  name?: string;
  coverPhotoId?: string | null;
};

export async function updateAlbum(input: UpdateAlbumInput) {
  const userId = await requireUserId();
  const update: { name?: string; cover_photo_id?: string | null } = {};
  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) throw new AppError("Album name is required.", { code: "VALIDATION_ERROR" });
    update.name = name;
  }

  if (input.coverPhotoId !== undefined) {
    if (input.coverPhotoId) {
      const { data: cover, error: coverError } = await supabase
        .from("photos")
        .select("id")
        .eq("id", input.coverPhotoId)
        .eq("album_id", input.id)
        .eq("user_id", userId)
        .maybeSingle();
      if (coverError) throw toAppError(coverError, "Could not verify the album cover.");
      if (!cover) throw new AppError("Choose a photo from this album as its cover.", { code: "INVALID_COVER" });
    }
    update.cover_photo_id = input.coverPhotoId;
  }

  if (Object.keys(update).length) {
    const { error } = await supabase
      .from("albums")
      .update(update)
      .eq("id", input.id)
      .eq("user_id", userId);
    if (error) throw toAppError(error, "Could not update the album.");
  }

  return getAlbumById(input.id);
}

export async function deleteAlbum(albumId: string) {
  const userId = await requireUserId();
  const { error } = await supabase
    .from("albums")
    .delete()
    .eq("id", albumId)
    .eq("user_id", userId);
  if (error) throw toAppError(error, "Could not delete the album.");
}
