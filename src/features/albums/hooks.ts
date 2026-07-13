import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { invalidateMemoryQueries, queryKeys } from "@/lib/query-client";
import {
  createAlbum,
  deleteAlbum,
  getAlbumById,
  listAlbums,
  updateAlbum,
} from "@/services/albums";

export function useAlbums() {
  return useQuery({ queryKey: queryKeys.albums.list(), queryFn: listAlbums });
}

export function useAlbum(albumId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.albums.detail(albumId ?? "missing"),
    queryFn: () => getAlbumById(albumId!),
    enabled: Boolean(albumId),
  });
}

export function useCreateAlbum() {
  return useMutation({ mutationFn: createAlbum, onSuccess: invalidateMemoryQueries });
}

export function useUpdateAlbum() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: updateAlbum,
    onSuccess: async (album) => {
      if (album) client.setQueryData(queryKeys.albums.detail(album.id), album);
      await invalidateMemoryQueries();
    },
  });
}

export function useDeleteAlbum() {
  return useMutation({ mutationFn: deleteAlbum, onSuccess: invalidateMemoryQueries });
}
