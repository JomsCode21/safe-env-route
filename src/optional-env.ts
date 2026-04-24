import { getDefinedSchema } from "./define-env";
import { parseGroups, type ParseGroupsOptions } from "./runtime";
import type { EnvSchema, GroupSelectionValues } from "./types";

export interface OptionalEnvOptions extends Omit<ParseGroupsOptions, "allowMissing"> {}

export function optionalEnv<const S extends EnvSchema, const G extends readonly (keyof S)[]>(
  schema: S,
  groups: G,
  options?: OptionalEnvOptions,
): Partial<GroupSelectionValues<S, G>>;
export function optionalEnv(groups: readonly string[], options?: OptionalEnvOptions): Record<string, unknown>;
export function optionalEnv(
  first: EnvSchema | readonly string[],
  second?: readonly string[] | OptionalEnvOptions,
  third?: OptionalEnvOptions,
): Record<string, unknown> {
  if (Array.isArray(first)) {
    return parseGroups(getDefinedSchema(), first, {
      ...((second as OptionalEnvOptions) ?? {}),
      allowMissing: true,
    });
  }

  return parseGroups(first as EnvSchema, (second as readonly string[]) ?? [], {
    ...(third ?? {}),
    allowMissing: true,
  });
}
