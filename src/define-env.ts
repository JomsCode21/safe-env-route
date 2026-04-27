import type { EnvSchema } from "./types";

let activeSchema: EnvSchema | null = null;

function isValidatorLike(value: unknown): value is { parse: (raw: string, name: string) => unknown } {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { parse?: unknown }).parse === "function" &&
    typeof (value as { description?: unknown }).description === "string"
  );
}

function validateSchemaShape(schema: EnvSchema): void {
  const groups = Object.entries(schema);
  if (groups.length === 0) {
    throw new Error("defineEnv(schema) requires at least one group.");
  }

  for (const [groupName, groupSchema] of groups) {
    const keys = Object.entries(groupSchema);
    if (keys.length === 0) {
      throw new Error(`Group "${groupName}" must define at least one environment variable.`);
    }

    for (const [key, validator] of keys) {
      if (!isValidatorLike(validator)) {
        throw new Error(
          `Invalid validator for "${groupName}.${key}". Use built-in validators like str(), int(), bool(), url(), or enumOf([...]).`,
        );
      }
    }
  }
}

export function defineEnv<const S extends EnvSchema>(schema: S): S {
  validateSchemaShape(schema);
  activeSchema = schema;
  return schema;
}

export function getDefinedSchema(): EnvSchema {
  if (!activeSchema) {
    throw new Error('No environment schema defined. Call defineEnv({...}) before requireEnv/optionalEnv.');
  }

  return activeSchema;
}
