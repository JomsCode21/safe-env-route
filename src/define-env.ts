import type { EnvSchema } from "./types";

let activeSchema: EnvSchema | null = null;

export function defineEnv<const S extends EnvSchema>(schema: S): S {
  activeSchema = schema;
  return schema;
}

export function getDefinedSchema(): EnvSchema {
  if (!activeSchema) {
    throw new Error('No environment schema defined. Call defineEnv({...}) before requireEnv/optionalEnv.');
  }

  return activeSchema;
}
