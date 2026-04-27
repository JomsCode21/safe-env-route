"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineEnv = defineEnv;
exports.getDefinedSchema = getDefinedSchema;
let activeSchema = null;
function isValidatorLike(value) {
    return (typeof value === "object" &&
        value !== null &&
        typeof value.parse === "function" &&
        typeof value.description === "string");
}
function validateSchemaShape(schema) {
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
                throw new Error(`Invalid validator for "${groupName}.${key}". Use built-in validators like str(), int(), bool(), url(), or enumOf([...]).`);
            }
        }
    }
}
function defineEnv(schema) {
    validateSchemaShape(schema);
    activeSchema = schema;
    return schema;
}
function getDefinedSchema() {
    if (!activeSchema) {
        throw new Error('No environment schema defined. Call defineEnv({...}) before requireEnv/optionalEnv.');
    }
    return activeSchema;
}
