export type EnvIssueReason = "missing" | "invalid" | "unknown_group";

export interface EnvIssue {
  group: string;
  key: string;
  reason: EnvIssueReason;
  expected?: string;
  received?: string | null;
  detail?: string;
}

function formatIssue(issue: EnvIssue): string {
  if (issue.reason === "missing") {
    return `[${issue.group}] ${issue.key} is required but missing`;
  }

  if (issue.reason === "unknown_group") {
    return `Group "${issue.group}" is not defined`;
  }

  const expected = issue.expected ? `expected ${issue.expected}` : "invalid value";
  const received = issue.received !== undefined ? `, received "${issue.received}"` : "";
  const detail = issue.detail ? ` (${issue.detail})` : "";
  return `[${issue.group}] ${issue.key} ${expected}${received}${detail}`;
}

export class EnvValidationError extends Error {
  public readonly issues: EnvIssue[];

  constructor(issues: EnvIssue[]) {
    const lines = issues.map((issue) => `- ${formatIssue(issue)}`);
    const message = ["Environment validation failed:", ...lines].join("\n");
    super(message);
    this.name = "EnvValidationError";
    this.issues = issues;
  }
}
