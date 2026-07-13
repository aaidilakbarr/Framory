import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";

import { clearUserQueryCache } from "@/lib/query-client";
import { enableSupabaseAutoRefresh } from "@/lib/supabase";
import {
  getCurrentSession,
  onAuthStateChange,
  signInWithGoogle as googleSignIn,
  signInWithPassword,
  signOut as authSignOut,
  signUpWithPassword,
} from "@/services/auth";
import { getProfileById } from "@/services/profile";
import type { ProfileWithAvatar } from "@/types/database";
import { getErrorMessage } from "@/utils/errors";

type AuthState = {
  session: Session | null;
  profile: ProfileWithAvatar | null;
  isInitializing: boolean;
  isPending: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
};

let initialization: Promise<void> | null = null;
let authListenerInstalled = false;

async function loadProfile(userId: string) {
  try {
    return await getProfileById(userId);
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  isInitializing: true,
  isPending: false,
  error: null,

  initialize: async () => {
    if (initialization) return initialization;

    initialization = (async () => {
      enableSupabaseAutoRefresh();

      if (!authListenerInstalled) {
        authListenerInstalled = true;
        onAuthStateChange((_event, session) => {
          const previous = get();
          const isSameUser = previous.session?.user.id === session?.user.id;
          set({ session, profile: session && isSameUser ? previous.profile : null });
          if (!session) clearUserQueryCache();

          if (session?.user) {
            setTimeout(() => {
              void loadProfile(session.user.id).then((profile) => set({ profile }));
            }, 0);
          }
        });
      }

      try {
        const session = await getCurrentSession();
        const profile = session?.user ? await loadProfile(session.user.id) : null;
        set({ session, profile, isInitializing: false });
      } catch (error) {
        set({ error: getErrorMessage(error), isInitializing: false });
      }
    })();

    return initialization;
  },

  signIn: async (email, password) => {
    set({ isPending: true, error: null });
    try {
      const { session } = await signInWithPassword({ email, password });
      const profile = session?.user ? await loadProfile(session.user.id) : null;
      set({ session, profile, isPending: false });
    } catch (error) {
      set({ error: getErrorMessage(error, "Could not sign in."), isPending: false });
      throw error;
    }
  },

  signUp: async (email, password, username) => {
    set({ isPending: true, error: null });
    try {
      const { session } = await signUpWithPassword({ email, password, username });
      const profile = session?.user ? await loadProfile(session.user.id) : null;
      set({ session, profile, isPending: false });
    } catch (error) {
      set({ error: getErrorMessage(error, "Could not create your account."), isPending: false });
      throw error;
    }
  },

  signInWithGoogle: async () => {
    set({ isPending: true, error: null });
    try {
      const session = await googleSignIn();
      const profile = session?.user ? await loadProfile(session.user.id) : get().profile;
      set({ session: session ?? get().session, profile, isPending: false });
    } catch (error) {
      set({ error: getErrorMessage(error, "Could not sign in with Google."), isPending: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ isPending: true, error: null });
    try {
      await authSignOut();
      clearUserQueryCache();
      set({ session: null, profile: null, isPending: false });
    } catch (error) {
      set({ error: getErrorMessage(error, "Could not sign out."), isPending: false });
      throw error;
    }
  },

  refreshProfile: async () => {
    const userId = get().session?.user.id;
    if (!userId) {
      set({ profile: null });
      return;
    }
    set({ profile: await loadProfile(userId) });
  },

  clearError: () => set({ error: null }),
}));
