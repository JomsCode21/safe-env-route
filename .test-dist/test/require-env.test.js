"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const src_1 = require("../src");
(0, node_test_1.default)("requireEnv throws clear errors for missing and invalid values", () => {
    (0, src_1.defineEnv)({
        shared: {
            PORT: (0, src_1.int)(),
            API_KEY: (0, src_1.str)(),
        },
    });
    strict_1.default.throws(() => (0, src_1.requireEnv)(["shared"], {
        env: {
            PORT: "not-an-int",
        },
    }), (error) => {
        strict_1.default.ok(error instanceof src_1.EnvValidationError);
        strict_1.default.match(error.message, /PORT/);
        strict_1.default.match(error.message, /API_KEY/);
        return true;
    });
});
(0, node_test_1.default)("optionalEnv skips missing variables but validates provided ones", () => {
    (0, src_1.defineEnv)({
        analytics: {
            ANALYTICS_WRITE_KEY: (0, src_1.str)(),
            ANALYTICS_TIMEOUT: (0, src_1.int)(),
        },
    });
    const result = (0, src_1.optionalEnv)(["analytics"], {
        env: {
            ANALYTICS_TIMEOUT: "30",
        },
    });
    strict_1.default.deepEqual(result, {
        ANALYTICS_TIMEOUT: 30,
    });
});
(0, node_test_1.default)("strictUnknownKeys is opt-in and ignores unknown keys by default", () => {
    (0, src_1.defineEnv)({
        shared: {
            API_URL: (0, src_1.str)(),
        },
    });
    const result = (0, src_1.requireEnv)(["shared"], {
        env: {
            API_URL: "https://example.com",
            EXTRA_KEY: "value",
        },
    });
    strict_1.default.deepEqual(result, {
        API_URL: "https://example.com",
    });
});
(0, node_test_1.default)("strictUnknownKeys throws for unknown keys", () => {
    (0, src_1.defineEnv)({
        shared: {
            API_URL: (0, src_1.str)(),
        },
    });
    strict_1.default.throws(() => (0, src_1.requireEnv)(["shared"], {
        strictUnknownKeys: true,
        env: {
            API_URL: "https://example.com",
            EXTRA_KEY: "value",
        },
    }), (error) => {
        strict_1.default.ok(error instanceof src_1.EnvValidationError);
        strict_1.default.match(error.message, /\[shared\] EXTRA_KEY is not defined in schema/);
        return true;
    });
});
(0, node_test_1.default)("strictUnknownKeys includes typo suggestions", () => {
    (0, src_1.defineEnv)({
        shared: {
            API_URL: (0, src_1.str)(),
        },
    });
    strict_1.default.throws(() => (0, src_1.requireEnv)(["shared"], {
        strictUnknownKeys: true,
        env: {
            API_URl: "https://example.com",
        },
    }), (error) => {
        strict_1.default.ok(error instanceof src_1.EnvValidationError);
        strict_1.default.match(error.message, /Did you mean "API_URL"\?/);
        return true;
    });
});
(0, node_test_1.default)("optionalEnv also supports strictUnknownKeys", () => {
    (0, src_1.defineEnv)({
        analytics: {
            ANALYTICS_TIMEOUT: (0, src_1.int)(),
        },
    });
    strict_1.default.throws(() => (0, src_1.optionalEnv)(["analytics"], {
        strictUnknownKeys: true,
        env: {
            ANALYTICS_TIMOUT: "30",
        },
    }), (error) => {
        strict_1.default.ok(error instanceof src_1.EnvValidationError);
        strict_1.default.match(error.message, /ANALYTICS_TIMOUT is not defined in schema/);
        return true;
    });
});
