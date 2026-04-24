"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGroups = parseGroups;
const errors_1 = require("./errors");
function hasValue(value) {
    return typeof value === "string" && value.trim() !== "";
}
function hasDefinedValue(value) {
    return typeof value === "string";
}
function levenshtein(a, b) {
    const rows = a.length + 1;
    const cols = b.length + 1;
    const matrix = Array.from({ length: rows }, () => Array(cols).fill(0));
    for (let i = 0; i < rows; i += 1) {
        matrix[i][0] = i;
    }
    for (let j = 0; j < cols; j += 1) {
        matrix[0][j] = j;
    }
    for (let i = 1; i < rows; i += 1) {
        for (let j = 1; j < cols; j += 1) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
        }
    }
    return matrix[rows - 1][cols - 1];
}
function suggestKey(name, allowed) {
    let bestCandidate;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const candidate of allowed) {
        const distance = levenshtein(name, candidate);
        if (distance < bestDistance) {
            bestDistance = distance;
            bestCandidate = candidate;
        }
    }
    if (!bestCandidate) {
        return undefined;
    }
    const maxDistance = Math.max(1, Math.floor(bestCandidate.length * 0.34));
    if (bestDistance > maxDistance) {
        return undefined;
    }
    return bestCandidate;
}
function parseGroups(schema, groups, options) {
    const env = options.env ?? process.env;
    const issues = [];
    const parsed = {};
    const allowedKeys = new Set();
    const requestedGroupNames = [];
    for (const groupName of groups) {
        requestedGroupNames.push(groupName);
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
            allowedKeys.add(name);
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
            }
            catch (error) {
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
    if (options.strictUnknownKeys) {
        const allowed = Array.from(allowedKeys);
        for (const name of Object.keys(env)) {
            if (allowedKeys.has(name)) {
                continue;
            }
            if (!hasDefinedValue(env[name])) {
                continue;
            }
            issues.push({
                group: requestedGroupNames.join(", "),
                key: name,
                reason: "unknown_key",
                suggestion: suggestKey(name, allowed),
            });
        }
    }
    if (issues.length > 0) {
        throw new errors_1.EnvValidationError(issues);
    }
    return parsed;
}
