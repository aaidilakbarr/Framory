import { useEffect } from "react";

import { useAuthStore } from "@/store/auth-store";

export function useAuth() {
  const auth = useAuthStore();
  const initialize = auth.initialize;

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return {
    session: auth.session,
    user: auth.session?.user ?? null,
    profile: auth.profile,
    isInitializing: auth.isInitializing,
    isPending: auth.isPending,
    error: auth.error,
    signIn: auth.signIn,
    signUp: auth.signUp,
    signInWithGoogle: auth.signInWithGoogle,
    signOut: auth.signOut,
    clearError: auth.clearError,
  };
}
