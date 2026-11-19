"use client";

import { useTranslations } from "next-intl";
import { DeleteExampleButton } from "@/components/delete-example-button";
import { ExampleQueries } from "@/domain/example/hooks";

const PageExample = () => {
  const t = useTranslations();
  const { data, isLoading } = ExampleQueries.useGetAllExamples();

  return (
    <div className="bg-muted h-screen">
      <div className="max-w-lg mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl text-purple-600">{t("example.title")}</h1>
          <DeleteExampleButton id="id-to-delete" />
        </div>
        <p className="text-foreground">
          {isLoading ? t("example.loading") : JSON.stringify(data)}
        </p>
      </div>
    </div>
  );
};

export default PageExample;
