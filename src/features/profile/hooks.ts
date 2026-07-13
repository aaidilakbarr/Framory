import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client";
import {
  getCurrentProfile,
  getProfileStats,
  removeAvatar,
  updateProfile,
  uploadAvatar,
} from "@/services/profile";
import { useAuthStore } from "@/store/auth-store";

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile.current(),
    queryFn: getCurrentProfile,
  });
}

export function useProfileStats() {
  return useQuery({
    queryKey: queryKeys.profile.stats(),
    queryFn: getProfileStats,
  });
}

function useRefreshProfile() {
  const client = useQueryClient();
  return async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: queryKeys.profile.all() }),
      useAuthStore.getState().refreshProfile(),
    ]);
  };
}

export function useUpdateProfile() {
  const refresh = useRefreshProfile();
  return useMutation({ mutationFn: updateProfile, onSuccess: refresh });
}

export function useUploadAvatar() {
  const refresh = useRefreshProfile();
  return useMutation({ mutationFn: uploadAvatar, onSuccess: refresh });
}

export function useRemoveAvatar() {
  const refresh = useRefreshProfile();
  return useMutation({ mutationFn: removeAvatar, onSuccess: refresh });
}
