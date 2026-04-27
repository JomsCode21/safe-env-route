"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const node_os_1 = require("node:os");
const src_1 = require("../src");
(0, node_test_1.default)("generateEnvExample uses grouped schema order with comments", () => {
    (0, src_1.defineEnv)({
        shared: {
            APP_URL: (0, src_1.str)(),
            PORT: (0, src_1.int)(),
        },
        auth: {
            GOOGLE_CLIENT_ID: (0, src_1.str)(),
            GOOGLE_CLIENT_SECRET: (0, src_1.str)(),
        },
    });
    const result = (0, src_1.generateEnvExample)();
    strict_1.default.equal(result, "# [shared]\nAPP_URL=\nPORT=\n\n# [auth]\nGOOGLE_CLIENT_ID=\nGOOGLE_CLIENT_SECRET=\n");
});
(0, node_test_1.default)("generateEnvExample supports output without comments", () => {
    (0, src_1.defineEnv)({
        shared: {
            APP_URL: (0, src_1.str)(),
        },
        auth: {
            GOOGLE_CLIENT_ID: (0, src_1.str)(),
        },
    });
    const result = (0, src_1.generateEnvExample)({
        includeComments: false,
        newlineBetweenGroups: false,
    });
    strict_1.default.equal(result, "APP_URL=\nGOOGLE_CLIENT_ID=\n");
});
(0, node_test_1.default)("writeEnvExample writes .env.example-compatible file", () => {
    (0, src_1.defineEnv)({
        payments: {
            STRIPE_SECRET_KEY: (0, src_1.str)(),
        },
    });
    const tempDir = (0, node_fs_1.mkdtempSync)((0, node_path_1.join)((0, node_os_1.tmpdir)(), "feature-env-"));
    const outputPath = (0, node_path_1.join)(tempDir, ".env.example");
    const content = (0, src_1.writeEnvExample)(outputPath);
    const saved = (0, node_fs_1.readFileSync)(outputPath, "utf8");
    strict_1.default.equal(content, "# [payments]\nSTRIPE_SECRET_KEY=\n");
    strict_1.default.equal(saved, content);
});
