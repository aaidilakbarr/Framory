import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client";
import { createTag, deleteTag, listTags } from "@/services/tags";

export function useTags() {
  return useQuery({ queryKey: queryKeys.tags.list(), queryFn: listTags });
}

export function useCreateTag() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: createTag,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.tags.all() }),
  });
}

export function useDeleteTag() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: deleteTag,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.tags.all() }),
        client.invalidateQueries({ queryKey: queryKeys.photos.all() }),
      ]);
    },
  });
}
