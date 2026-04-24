"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGroups = parseGroups;
const errors_1 = require("./errors");
function hasValue(value) {
    return typeof value === "string" && value.trim() !== "";
}
function parseGroups(schema, groups, options) {
    const env = options.env ?? process.env;
    const issues = [];
    const parsed = {};
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
    if (issues.length > 0) {
        throw new errors_1.EnvValidationError(issues);
    }
    return parsed;
}
