import { supabase } from "@/lib/supabase";
import { requireUserId } from "@/services/auth";
import { toAppError } from "@/utils/errors";

export type SetFavoriteInput = {
  photoId: string;
  isFavorite: boolean;
};

export async function setFavorite({ photoId, isFavorite }: SetFavoriteInput) {
  const userId = await requireUserId();

  if (isFavorite) {
    const { error } = await supabase
      .from("favorites")
      .upsert({ user_id: userId, photo_id: photoId }, { onConflict: "user_id,photo_id" });
    if (error) throw toAppError(error, "Could not favorite the memory.");
  } else {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("photo_id", photoId);
    if (error) throw toAppError(error, "Could not remove the favorite.");
  }

  return { photoId, isFavorite };
}

export const toggleFavorite = setFavorite;
