import { z } from "zod";

export const createExampleSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
});

export type CreateExampleDto = z.infer<typeof createExampleSchema>;
