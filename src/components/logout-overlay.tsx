"use client";

import { LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLogoutStore } from "@/lib/stores/logout";

export function LogoutOverlay() {
  const t = useTranslations();
  const loggingOut = useLogoutStore((state) => state.loggingOut);

  if (!loggingOut) return null;

  return (
    <div
      role="status"
      className="fixed inset-0 z-100 flex items-center justify-center gap-2 bg-background text-sm text-muted-foreground"
    >
      <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      <span>{t("auth.loggingOut")}</span>
    </div>
  );
}
