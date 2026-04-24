"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineEnv = defineEnv;
exports.getDefinedSchema = getDefinedSchema;
let activeSchema = null;
function defineEnv(schema) {
    activeSchema = schema;
    return schema;
}
function getDefinedSchema() {
    if (!activeSchema) {
        throw new Error('No environment schema defined. Call defineEnv({...}) before requireEnv/optionalEnv.');
    }
    return activeSchema;
}
