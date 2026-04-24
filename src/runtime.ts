import { EnvValidationError, type EnvIssue } from "./errors";
import type { EnvMap, EnvSchema } from "./types";

export interface ParseGroupsOptions {
  env?: EnvMap;
  allowMissing: boolean;
}

function hasValue(value: string | undefined | null): value is string {
  return typeof value === "string" && value.trim() !== "";
}

export function parseGroups(
  schema: EnvSchema,
  groups: readonly string[],
  options: ParseGroupsOptions,
): Record<string, unknown> {
  const env = options.env ?? process.env;
  const issues: EnvIssue[] = [];
  const parsed: Record<string, unknown> = {};

  for (const groupName of groups) {
    const groupSchema = schema[groupName];
    if (!groupSchema) {
      issues.push({
        group: groupName,
        key: "*",
        reason: "unknown_group",
      });
      continue;
    }

    for (const [name, validator] of Object.entries(groupSchema)) {
      const raw = env[name];
      if (!hasValue(raw)) {
        if (!options.allowMissing) {
          issues.push({
            group: groupName,
            key: name,
            reason: "missing",
          });
        }
        continue;
      }

      try {
        parsed[name] = validator.parse(raw, name);
      } catch (error) {
        issues.push({
          group: groupName,
          key: name,
          reason: "invalid",
          expected: validator.description,
          received: raw,
          detail: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  if (issues.length > 0) {
    throw new EnvValidationError(issues);
  }

  return parsed;
}
