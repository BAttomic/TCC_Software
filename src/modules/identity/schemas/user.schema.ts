import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.enum(["buyer", "organizer"]).default("buyer"),
  phone: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const UserOutputSchema = z.object({
  _id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.enum(["buyer", "organizer", "operator", "admin"]),
  phone: z.string().optional(),
  createdAt: z.coerce.date(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UserOutput = z.infer<typeof UserOutputSchema>;
