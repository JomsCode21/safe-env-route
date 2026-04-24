"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvValidationError = void 0;
function formatIssue(issue) {
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
class EnvValidationError extends Error {
    constructor(issues) {
        const lines = issues.map((issue) => `- ${formatIssue(issue)}`);
        const message = ["Environment validation failed:", ...lines].join("\n");
        super(message);
        this.name = "EnvValidationError";
        this.issues = issues;
    }
}
exports.EnvValidationError = EnvValidationError;
