import { z } from 'zod';

export const headerSchema = z.object({
  name: z.string().min(1, 'Header name is required'),
  description: z.string().optional(),
  required: z.boolean().default(false),
  example: z.string().optional(),
});

export const parameterSchema = z.object({
  name: z.string().min(1, 'Parameter name is required'),
  type: z.enum(['string', 'integer', 'boolean', 'number']),
  description: z.string().optional(),
  required: z.boolean().default(false),
  default: z.any().optional(),
});

export const jsonSchemaSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    type: z.enum(['object', 'array', 'string', 'number', 'boolean', 'null']),
    properties: z.record(z.any()).optional(),
    required: z.array(z.string()).optional(),
    items: z.any().optional(),
  })
);

export const responseExampleSchema = z.object({
  status_code: z.number().int().min(100).max(599),
  description: z.string().optional(),
  body: z
    .union([
      z.string().transform((val) => {
        if (!val || val.trim() === '') return undefined;
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      }),
      z.any(),
    ])
    .optional(),
});

// Schema that accepts string or object for request_body, transforming string to object
const requestBodySchema = z
  .union([
    z.string().transform((val, ctx) => {
      // Empty string -> undefined (optional field)
      if (!val || val.trim() === '') {
        return undefined;
      }
      // Try to parse JSON string to object
      try {
        const parsed = JSON.parse(val);
        // Validate the parsed object against jsonSchemaSchema
        const result = jsonSchemaSchema.safeParse(parsed);
        if (!result.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Invalid JSON Schema: ${result.error.errors.map(e => e.message).join(', ')}`,
          });
          return z.NEVER;
        }
        return result.data;
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid JSON format',
        });
        return z.NEVER;
      }
    }),
    jsonSchemaSchema,
  ])
  .optional();

export const restAPISchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name must not exceed 100 characters'),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  endpoint: z.string().min(1, 'Endpoint is required'),
  headers: z.array(headerSchema).default([]),
  path_params: z.array(parameterSchema).default([]),
  query_params: z.array(parameterSchema).default([]),
  request_body: requestBodySchema,
  responses: z
  .array(responseExampleSchema)
  .default([])
  .transform((arr) => {
    const record: Record<number, ResponseExample> = {};
    arr.forEach((r) => {
      if (r.status_code) {
        record[r.status_code] = r;
      }
    });
    return record;
  }),
});

export type RestAPIFormData = z.infer<typeof restAPISchema>;
export type Header = z.infer<typeof headerSchema>;
export type Parameter = z.infer<typeof parameterSchema>;
export type JSONSchema = z.infer<typeof jsonSchemaSchema>;
export type ResponseExample = z.infer<typeof responseExampleSchema>;
