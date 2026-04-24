"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const legacy_1 = require("../src/legacy");
(0, node_test_1.default)("legacy checkEnv returns missing keys and values", () => {
    const result = (0, legacy_1.checkEnv)(["API_KEY", "DATABASE_URL"], {
        env: { API_KEY: "abc123" },
    });
    strict_1.default.equal(result.ok, false);
    strict_1.default.deepEqual(result.missing, ["DATABASE_URL"]);
    strict_1.default.deepEqual(result.values, {
        API_KEY: "abc123",
        DATABASE_URL: undefined,
    });
});
(0, node_test_1.default)("legacy assertEnv throws with missing list", () => {
    strict_1.default.throws(() => (0, legacy_1.assertEnv)(["SECRET"], { env: {} }), (error) => {
        strict_1.default.ok(error instanceof Error);
        strict_1.default.equal(error.message, "Missing required environment variables: SECRET");
        strict_1.default.deepEqual(error.missing, ["SECRET"]);
        return true;
    });
});
(0, node_test_1.default)("legacy runCli returns success and failure exit codes", () => {
    const originalLog = console.log;
    const originalError = console.error;
    let ok;
    let failed;
    try {
        console.log = () => { };
        console.error = () => { };
        ok = (0, legacy_1.runCli)(["PATH"]);
        failed = (0, legacy_1.runCli)(["__SAFE_ENV_ROUTE_NOT_SET__"]);
    }
    finally {
        console.log = originalLog;
        console.error = originalError;
    }
    strict_1.default.equal(ok, 0);
    strict_1.default.equal(failed, 1);
});
