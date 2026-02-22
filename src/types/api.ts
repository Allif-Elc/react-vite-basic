// API Types
export interface Project {
  id_project: number
  id_user: number
  name: string
  slug: string
  description: string
  version: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface CreateProjectRequest {
  name: string
  description?: string
  version?: string
  is_public?: boolean
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
  version?: string
  is_public?: boolean
}

export interface RestAPI {
  id_rest_api: number
  id_project: number
  id_user: number
  name: string
  description: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  endpoint: string
  headers: Header[]
  path_params: Parameter[]
  query_params: Parameter[]
  request_body?: JSONSchema
  responses: Record<number, ResponseExample>
  created_at: string
  updated_at: string
}

export interface Header {
  name: string
  description?: string
  required: boolean
  example?: string
}

export interface Parameter {
  name: string
  type: 'string' | 'integer' | 'boolean' | 'number'
  description?: string
  required: boolean
  default?: unknown
}

export interface JSONSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'
  properties?: Record<string, Property>
  required?: string[]
  items?: JSONSchema
}

export interface Property {
  type: string
  description?: string
  format?: string
  minimum?: number
  maximum?: number
  enum?: string[]
  required?: string[]
  properties?: Record<string, Property>
  items?: JSONSchema
}

export interface ResponseExample {
  status_code: number
  description?: string
  body: unknown
}

export interface GraphQLAPI {
  id_graphql_api: number
  id_project: number
  id_user: number
  name: string
  type: 'query' | 'mutation' | 'subscription'
  description: string
  arguments: GraphQLArgument[]
  return_type: string
  examples: GraphQLExample[]
  created_at: string
  updated_at: string
}

export interface GraphQLArgument {
  name: string
  type: string
  description?: string
  required: boolean
  default_value?: unknown
}

export interface GraphQLExample {
  name: string
  description?: string
  query: string
  variables?: unknown
  response?: unknown
}

export interface GrpcAPI {
  id_grpc_api: number
  id_project: number
  id_user: number
  service_name: string
  method_name: string
  description: string
  request_message: GrpcField[]
  response_message: GrpcField[]
  proto_definition: string
  examples: GrpcExample[]
  created_at: string
  updated_at: string
}

export interface GrpcField {
  name: string
  type: string
  label?: 'optional' | 'repeated' | 'required'
  description?: string
}

export interface GrpcExample {
  language: string
  description?: string
  code: string
  variables?: unknown
}

export interface Tag {
  id_tag: number
  name: string
  color: string
  created_at: string
}

export interface ApiResponse<T> {
  status: 'success' | 'error'
  data?: T
  message?: string
  error?: string
  pagination?: PaginationMeta
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  total_pages: number
}

export interface User {
  id_user: number
  name: string
  email: string
  is_active: boolean
}
