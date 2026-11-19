import { z } from "zod";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const settingsSchema = z.object({
  sidebarCollapsed: z.boolean(),
});

type Settings = z.infer<typeof settingsSchema>;

interface SettingsState extends Settings {
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
    }),
    {
      name: "app:settings",
      // localStorage is untrusted (older versions, manual edits): keep the defaults when it fails the schema.
      merge: (persisted, current) => {
        const parsed = settingsSchema.safeParse(persisted);
        return parsed.success ? { ...current, ...parsed.data } : current;
      },
    },
  ),
);
