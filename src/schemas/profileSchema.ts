import { z } from "zod";

export const profileSchema = z.object({
  age: z.number().int().min(0).max(120).optional().or(z.literal(undefined)),
  gender: z.enum(["male", "female", "other"]).optional(),
  bio: z.string().max(500, "Bio must not exceed 500 characters").optional(),
  phonenumber: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, "Invalid phone number format (10-15 digits, optionally with +)")
    .optional()
    .or(z.literal("")),
  website: z.string().url("Invalid URL format").optional().or(z.literal("")),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
