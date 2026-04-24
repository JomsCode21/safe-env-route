import { getDefinedSchema } from "./define-env";
import { parseGroups, type ParseGroupsOptions } from "./runtime";
import type { EnvSchema, GroupSelectionValues } from "./types";

export interface RequireEnvOptions extends Omit<ParseGroupsOptions, "allowMissing"> {}

export function requireEnv<const S extends EnvSchema, const G extends readonly (keyof S)[]>(
  schema: S,
  groups: G,
  options?: RequireEnvOptions,
): GroupSelectionValues<S, G>;
export function requireEnv(groups: readonly string[], options?: RequireEnvOptions): Record<string, unknown>;
export function requireEnv(
  first: EnvSchema | readonly string[],
  second?: readonly string[] | RequireEnvOptions,
  third?: RequireEnvOptions,
): Record<string, unknown> {
  if (Array.isArray(first)) {
    return parseGroups(getDefinedSchema(), first, {
      ...((second as RequireEnvOptions) ?? {}),
      allowMissing: false,
    });
  }

  return parseGroups(first as EnvSchema, (second as readonly string[]) ?? [], {
    ...(third ?? {}),
    allowMissing: false,
  });
}
