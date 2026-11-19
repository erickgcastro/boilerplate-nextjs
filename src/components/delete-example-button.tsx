"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ExampleQueries } from "@/domain/example/hooks";

export function DeleteExampleButton({ id }: { id: string }) {
  const t = useTranslations();
  const { mutateAsync } = ExampleQueries.useDeleteExample();

  const onDelete = async () => {
    try {
      await mutateAsync(id);
      alert(t("example.delete.success"));
    } catch {
      alert(t("example.delete.error"));
    }
  };

  return (
    <Button variant="destructive" onClick={onDelete}>
      {t("example.delete.label")}
    </Button>
  );
}
