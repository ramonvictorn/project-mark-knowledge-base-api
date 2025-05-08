import { z } from "zod";

export const createTopicSchema = z.object({
  name: z.string().min(3),
  content: z.string().min(3),
  parentTopicId: z.string().uuid().optional(),
});

export type CreateTopicPayload = z.infer<typeof createTopicSchema>;

export const updateTopicSchema = createTopicSchema.partial();

export type UpdateTopicPayload = z.infer<typeof updateTopicSchema>;
