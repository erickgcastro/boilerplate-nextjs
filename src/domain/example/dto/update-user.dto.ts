import { z } from "zod";

export const updateExampleSchema = z.object({
  id: z.number(),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
});

export type UpdateExampleDto = z.infer<typeof updateExampleSchema>;
