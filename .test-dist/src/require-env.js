"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireEnv = requireEnv;
const define_env_1 = require("./define-env");
const runtime_1 = require("./runtime");
function requireEnv(first, second, third) {
    if (Array.isArray(first)) {
        return (0, runtime_1.parseGroups)((0, define_env_1.getDefinedSchema)(), first, {
            ...(second ?? {}),
            allowMissing: false,
        });
    }
    return (0, runtime_1.parseGroups)(first, second ?? [], {
        ...(third ?? {}),
        allowMissing: false,
    });
}
