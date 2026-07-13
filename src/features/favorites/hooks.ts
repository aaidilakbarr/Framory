import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invalidateMemoryQueries, queryKeys } from "@/lib/query-client";
import { setFavorite } from "@/services/favorites";
import type { PhotoFilters } from "@/services/photos";
import { usePhotos } from "@/features/photos/hooks";
import type { PhotoWithRelations } from "@/types/database";

export function useFavorites(filters: Omit<PhotoFilters, "favoriteOnly"> = {}) {
  return usePhotos({ ...filters, favoriteOnly: true });
}

export function useToggleFavorite() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: setFavorite,
    onMutate: async ({ photoId, isFavorite }) => {
      const key = queryKeys.photos.detail(photoId);
      await client.cancelQueries({ queryKey: key });
      const previous = client.getQueryData<PhotoWithRelations | null>(key);
      if (previous) client.setQueryData(key, { ...previous, is_favorite: isFavorite });
      return { previous, key };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) client.setQueryData(context.key, context.previous);
    },
    onSettled: invalidateMemoryQueries,
  });
}
