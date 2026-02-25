import { z } from "zod";

export const grpcFieldSchema = z.object({
  name: z.string().min(1, "Field name is required"),
  type: z.string().min(1, "Type is required"),
  label: z.enum(["optional", "repeated", "required"]).optional(),
  description: z.string().optional(),
});

export const grpcExampleSchema = z.object({
  language: z.string().min(1, "Language is required"),
  description: z.string().optional(),
  code: z.string().min(1, "Code is required"),
  variables: z.any().optional(),
});

export const grpcAPISchema = z.object({
  service_name: z.string().min(1, "Service name is required"),
  method_name: z.string().min(1, "Method name is required"),
  description: z.string().max(500, "Description must not exceed 500 characters").optional(),
  request_message: z.array(grpcFieldSchema).default([]),
  response_message: z.array(grpcFieldSchema).default([]),
  proto_definition: z.string().optional(),
  examples: z.array(grpcExampleSchema).default([]),
});

export type GrpcAPIFormData = z.infer<typeof grpcAPISchema>;
export type GrpcField = z.infer<typeof grpcFieldSchema>;
export type GrpcExample = z.infer<typeof grpcExampleSchema>;
