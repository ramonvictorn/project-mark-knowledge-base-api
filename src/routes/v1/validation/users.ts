import { z } from "zod";
import { UserRole } from "../../../models/User";

export const createUserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  role: z.nativeEnum(UserRole),
});

export type CreateUserPayload = z.infer<typeof createUserSchema>;
