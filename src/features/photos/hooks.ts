import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { invalidateMemoryQueries, queryKeys } from "@/lib/query-client";
import {
  deletePhoto,
  getPhotoById,
  listPhotos,
  updatePhoto,
  uploadPhoto,
  type PhotoFilters,
} from "@/services/photos";

export function usePhotos(filters: PhotoFilters = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.photos.list(filters),
    queryFn: ({ pageParam }) => listPhotos(filters, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}

export function usePhoto(photoId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.photos.detail(photoId ?? "missing"),
    queryFn: () => getPhotoById(photoId!),
    enabled: Boolean(photoId),
  });
}

export function useUploadPhoto() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: uploadPhoto,
    onSuccess: async () => {
      await Promise.all([
        invalidateMemoryQueries(),
        client.invalidateQueries({ queryKey: queryKeys.tags.all() }),
      ]);
    },
  });
}

export function useUpdatePhoto() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: updatePhoto,
    onSuccess: async (photo) => {
      if (photo) client.setQueryData(queryKeys.photos.detail(photo.id), photo);
      await Promise.all([
        invalidateMemoryQueries(),
        client.invalidateQueries({ queryKey: queryKeys.tags.all() }),
      ]);
    },
  });
}

export function useDeletePhoto() {
  return useMutation({ mutationFn: deletePhoto, onSettled: invalidateMemoryQueries });
}
