"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const src_1 = require("../src");
(0, node_test_1.default)("defineEnv + requireEnv validates selected groups", () => {
    (0, src_1.defineEnv)({
        shared: {
            APP_URL: (0, src_1.url)(),
            NODE_ENV: (0, src_1.enumOf)(["development", "test", "production"]),
        },
        auth: {
            GOOGLE_CLIENT_ID: (0, src_1.str)(),
            GOOGLE_CLIENT_SECRET: (0, src_1.str)(),
        },
        payments: {
            STRIPE_SECRET_KEY: (0, src_1.str)(),
        },
    });
    const result = (0, src_1.requireEnv)(["shared", "auth"], {
        env: {
            APP_URL: "https://example.com",
            NODE_ENV: "development",
            GOOGLE_CLIENT_ID: "id",
            GOOGLE_CLIENT_SECRET: "secret",
        },
    });
    strict_1.default.deepEqual(result, {
        APP_URL: "https://example.com",
        NODE_ENV: "development",
        GOOGLE_CLIENT_ID: "id",
        GOOGLE_CLIENT_SECRET: "secret",
    });
});
(0, node_test_1.default)("requireEnv does not force unrelated groups", () => {
    const schema = (0, src_1.defineEnv)({
        shared: {
            APP_URL: (0, src_1.url)(),
        },
        payments: {
            STRIPE_SECRET_KEY: (0, src_1.str)(),
        },
    });
    const result = (0, src_1.requireEnv)(schema, ["shared"], {
        env: {
            APP_URL: "https://example.com",
        },
    });
    strict_1.default.deepEqual(result, {
        APP_URL: "https://example.com",
    });
});
(0, node_test_1.default)("defineEnv rejects empty schema", () => {
    strict_1.default.throws(() => (0, src_1.defineEnv)({}), (error) => {
        strict_1.default.ok(error instanceof Error);
        strict_1.default.match(error.message, /at least one group/i);
        return true;
    });
});
(0, node_test_1.default)("defineEnv rejects empty group schema", () => {
    strict_1.default.throws(() => (0, src_1.defineEnv)({
        shared: {},
    }), (error) => {
        strict_1.default.ok(error instanceof Error);
        strict_1.default.match(error.message, /must define at least one environment variable/i);
        return true;
    });
});
(0, node_test_1.default)("defineEnv rejects non-validator values", () => {
    strict_1.default.throws(() => (0, src_1.defineEnv)({
        shared: {
            PORT: 3000,
        },
    }), (error) => {
        strict_1.default.ok(error instanceof Error);
        strict_1.default.match(error.message, /Invalid validator/i);
        return true;
    });
});
