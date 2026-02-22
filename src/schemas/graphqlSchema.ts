import { z } from 'zod';

export const argumentSchema = z.object({
  name: z.string().min(1, 'Argument name is required'),
  type: z.string().min(1, 'Type is required'),
  description: z.string().optional(),
  required: z.boolean().default(false),
  default_value: z.any().optional(),
});

export const graphqlExampleSchema = z.object({
  name: z.string().min(1, 'Example name is required'),
  description: z.string().optional(),
  query: z.string().min(1, 'Query is required'),
  variables: z.any().optional(),
  response: z.any().optional(),
});

export const graphqlAPISchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name must not exceed 100 characters'),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
  type: z.enum(['query', 'mutation', 'subscription']),
  return_type: z.string().min(1, 'Return type is required'),
  arguments: z.array(argumentSchema).default([]),
  examples: z.array(graphqlExampleSchema).default([]),
});

export type GraphQLAPIFormData = z.infer<typeof graphqlAPISchema>;
export type GraphQLArgument = z.infer<typeof argumentSchema>;
export type GraphQLExample = z.infer<typeof graphqlExampleSchema>;
