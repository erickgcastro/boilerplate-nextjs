"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Key } from "@/services";
import { Service } from "../http";

function useCreateExample() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [Key(Service.example, "createExample")],
    mutationFn: Service.example.createExample,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [Key(Service.example, "getAllExamples")],
      });
    },
  });
}

function useGetAllExamples() {
  return useQuery({
    queryKey: [Key(Service.example, "getAllExamples")],
    queryFn: Service.example.getAllExamples,
  });
}

function useGetExampleById(id: string) {
  return useQuery({
    queryKey: [Key(Service.example, "getExampleById"), id],
    queryFn: () => Service.example.getExampleById(id),
    enabled: !!id,
  });
}

function useUpdateExample() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [Key(Service.example, "updateExample")],
    mutationFn: Service.example.updateExample,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [Key(Service.example, "getAllExamples")],
      });
    },
  });
}

function useDeleteExample() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [Key(Service.example, "deleteExample")],
    mutationFn: Service.example.deleteExample,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [Key(Service.example, "getAllExamples")],
      });
    },
  });
}

export const ExampleQueries = {
  useCreateExample,
  useGetAllExamples,
  useGetExampleById,
  useUpdateExample,
  useDeleteExample,
};
