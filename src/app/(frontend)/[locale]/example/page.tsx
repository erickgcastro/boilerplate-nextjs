"use client";

import { ExampleQueries } from "@/domain/example/hooks";
import { useTranslations } from "next-intl";

const PageExample = () => {
  const t = useTranslations();
  const { data, isLoading } = ExampleQueries.useGetAllExamples();
  const { mutateAsync } = ExampleQueries.useDeleteExample();

  const onDelete = async (id: string) => {
    try {
      await mutateAsync(id);
      alert(t("example.delete.success"));
    } catch {
      alert(t("example.delete.error"));
    }
  };

  return (
    <div className=" bg-gray-100 h-screen">
      <div className="max-w-lg mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl text-purple-600">{t("example.title")}</h1>
          <button
            onClick={() => onDelete("id-to-delete")}
            className="p-2 bg-blue-500 rounded cursor-pointer text-white"
          >
            Delete
          </button>
        </div>
        <p className="text-foreground">
          {isLoading ? "Carregando..." : JSON.stringify(data)}
        </p>
      </div>
    </div>
  );
};

export default PageExample;
