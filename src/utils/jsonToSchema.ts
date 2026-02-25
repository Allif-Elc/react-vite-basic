/**
 * JSON Schema types for request body transformation
 */
export interface JSONSchema {
  type?: string;
  properties?: Record<string, JSONSchema>;
  items?: JSONSchema;
  additionalProperties?: boolean | JSONSchema;
  required?: string[];
  description?: string;
  example?: any;
}

/**
 * Detects the JSON type of a value
 */
function detectType(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

/**
 * Converts a simple JSON value to its JSON Schema representation
 */
export function jsonToSchema(json: unknown): JSONSchema {
  const type = detectType(json);

  switch (type) {
    case "object": {
      const properties: Record<string, JSONSchema> = {};
      const required: string[] = [];

      if (json && typeof json === "object") {
        for (const [key, val] of Object.entries(json)) {
          properties[key] = jsonToSchema(val);
          // Only mark as required if value is not null/undefined
          if (val !== null && val !== undefined) {
            required.push(key);
          }
        }
      }

      return {
        type: "object",
        properties: Object.keys(properties).length > 0 ? properties : undefined,
        required: required.length > 0 ? required : undefined,
      };
    }

    case "array": {
      if (!Array.isArray(json) || json.length === 0) {
        return { type: "array" };
      }

      // Infer schema from first non-null item
      const firstItem = json.find((item) => item !== null && item !== undefined);
      return {
        type: "array",
        items: firstItem !== undefined ? jsonToSchema(firstItem) : { type: "string" },
      };
    }

    case "string":
    case "number":
    case "boolean":
    case "null":
      return { type };

    default:
      return {};
  }
}

/**
 * Checks if a value is a JSON Schema format (has 'type' and 'properties')
 */
export function isJsonSchema(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    (value as any).type === "object" &&
    "properties" in value
  );
}

/**
 * Generates a simple JSON example from a JSON Schema
 * Used for display purposes when loading existing data
 */
export function schemaToJson(schema: JSONSchema): unknown {
  if (!schema.type) {
    return {};
  }

  switch (schema.type) {
    case "object": {
      if (!schema.properties) {
        return {};
      }

      const example: Record<string, unknown> = {};
      for (const [key, prop] of Object.entries(schema.properties)) {
        example[key] = schemaToJson(prop);
      }
      return example;
    }

    case "array": {
      if (!schema.items) {
        return [];
      }

      const itemExample = schemaToJson(schema.items);
      return [itemExample];
    }

    case "string":
      return "example";

    case "number":
    case "integer":
      return 0;

    case "boolean":
      return true;

    case "null":
      return null;

    default:
      return {};
  }
}

/**
 * Transforms request body for submission to backend
 * Converts simple JSON to JSON Schema if needed
 */
export function transformRequestBody(body: unknown): JSONSchema | undefined {
  if (body === undefined || body === null || body === "") {
    return undefined;
  }

  // If already a JSON Schema, return as-is
  if (isJsonSchema(body)) {
    return body as JSONSchema;
  }

  // Otherwise, convert simple JSON to JSON Schema
  return jsonToSchema(body);
}

/**
 * Transforms request body for display in the form
 * Converts JSON Schema back to simple JSON example
 */
export function transformRequestBodyForDisplay(body: unknown): string {
  if (body === undefined || body === null || body === "") {
    return "";
  }

  let valueToFormat: unknown;

  if (typeof body === "string") {
    try {
      const parsed = JSON.parse(body);
      valueToFormat = parsed;
    } catch {
      return body as string;
    }
  } else {
    valueToFormat = body;
  }

  // If it's a JSON Schema, convert to simple JSON example
  if (isJsonSchema(valueToFormat)) {
    const example = schemaToJson(valueToFormat as JSONSchema);
    return JSON.stringify(example, null, 2);
  }

  // Otherwise, just format the JSON
  return JSON.stringify(valueToFormat, null, 2);
}
