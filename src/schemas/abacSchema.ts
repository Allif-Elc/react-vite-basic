import { z } from "zod";

export const attributeSchema = z
  .object({
    name: z
      .string()
      .min(1, "Attribute name is required")
      .max(100, "Name must not exceed 100 characters"),
    description: z.string().max(500, "Description must not exceed 500 characters").optional(),
    type: z.enum(["string", "number", "boolean", "enum"], {
      required_error: "Attribute type is required",
    }),
    enum_values: z.array(z.string()).optional(),
  })
  .refine((data) => data.type !== "enum" || (data.enum_values && data.enum_values.length > 0), {
    message: "Enum type requires at least one value",
    path: ["enum_values"],
  });

export const resourceSchema = z.object({
  name: z
    .string()
    .min(1, "Resource name is required")
    .max(100, "Name must not exceed 100 characters"),
  description: z.string().max(500, "Description must not exceed 500 characters").optional(),
  resource_type: z
    .string()
    .min(1, "Resource type is required")
    .max(50, "Type must not exceed 50 characters"),
});

export const permissionSchema = z.object({
  name: z
    .string()
    .min(1, "Permission name is required")
    .max(100, "Name must not exceed 100 characters"),
  description: z.string().max(500, "Description must not exceed 500 characters").optional(),
  effect: z.enum(["allow", "deny"], {
    required_error: "Effect is required",
  }),
  actions: z.array(z.string()).min(1, "At least one action is required"),
  condition: z.string().max(1000, "Condition must not exceed 1000 characters").optional(),
});

export type AttributeFormData = z.infer<typeof attributeSchema>;
export type ResourceFormData = z.infer<typeof resourceSchema>;
export type PermissionFormData = z.infer<typeof permissionSchema>;

export const userPolicySchema = z.object({
  id_user: z.number().int().positive("User is required"),
  id_policy: z.number().int().positive("Policy is required"),
  priority: z
    .number()
    .int()
    .min(-100, "Priority must be -100 to 100")
    .max(100, "Priority must be -100 to 100")
    .default(0),
  expires_at: z.string().datetime().optional().or(z.literal("")),
});

export type UserPolicyFormData = z.infer<typeof userPolicySchema>;

export const policyRuleSchema = z.object({
  role: z.string().min(1, "Role is required"),
  resource: z
    .string()
    .min(1, "Resource is required")
    .refine((val) => /^[a-zA-Z0-9_*]+$/.test(val), {
      message: "Resource can only contain letters, numbers, underscores, and wildcards (*)",
    }),
  action: z.array(z.string()).min(1, "At least one action is required"),
});

export const policySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must not exceed 255 characters")
    .refine((val) => /^[a-zA-Z0-9_-]+$/.test(val), {
      message: "Name can only contain letters, numbers, hyphens, and underscores",
    }),
  policy_rule: policyRuleSchema,
  is_active: z.boolean().default(true),
});

export type PolicyFormData = z.infer<typeof policySchema>;
export type PolicyRuleFormData = z.infer<typeof policyRuleSchema>;
