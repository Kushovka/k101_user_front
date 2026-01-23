import { create } from "zustand";
import { getCurrentUser } from "../api/users";
import { ApiUser } from "../types/user";

type UserStore = {
  user: ApiUser | null;
  loading: boolean;

  setUser: (user: ApiUser | null) => void;
  fetchUser: () => Promise<void>;
  logout: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  loading: false,

  setUser: (user) => set({ user }),

  fetchUser: async () => {
    set({ loading: true });
    try {
      const data = await getCurrentUser(); // ожидается User
      set({ user: data });
      console.log(data);
      console.log("current user:", data);
    } catch (err) {
      console.error("fetchUser error:", err);
      // можно дополнительно: set({ user: null })
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    set({ user: null });
  },
}));
