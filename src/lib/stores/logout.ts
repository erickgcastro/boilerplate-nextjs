import { create } from "zustand";

interface LogoutState {
  loggingOut: boolean;
  begin: () => void;
}

export const useLogoutStore = create<LogoutState>((set) => ({
  loggingOut: false,
  begin: () => set({ loggingOut: true }),
}));

// Full page load: the logout route handler clears the cookies and redirects.
export function redirectToLogout(target = "/api/logout") {
  useLogoutStore.getState().begin();
  if (typeof window === "undefined") return;
  // Two frames, so LogoutOverlay paints before the page starts unloading.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.location.assign(target);
    });
  });
}
