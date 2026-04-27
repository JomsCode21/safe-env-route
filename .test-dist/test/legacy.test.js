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
(0, node_test_1.default)("legacy runCli can generate .env.example from defined grouped schema", () => {
    const originalLog = console.log;
    const originalError = console.error;
    const tempDir = (0, node_fs_1.mkdtempSync)((0, node_path_1.join)((0, node_os_1.tmpdir)(), "feature-env-cli-"));
    const outputPath = (0, node_path_1.join)(tempDir, ".env.example");
    try {
        console.log = () => { };
        console.error = () => { };
        const exitCode = (0, legacy_1.runCli)([
            "--generate-example",
            "--schema",
            "test/fixtures/cli-schema.cjs",
            "--out",
            outputPath,
        ]);
        strict_1.default.equal(exitCode, 0);
    }
    finally {
        console.log = originalLog;
        console.error = originalError;
    }
    strict_1.default.equal((0, node_fs_1.readFileSync)(outputPath, "utf8"), "# [shared]\nAPP_URL=\nPORT=\n\n# [auth]\nGOOGLE_CLIENT_ID=\n");
});
(0, node_test_1.default)("legacy runCli auto-loads schema from dist/env/schema.js", () => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalCwd = process.cwd();
    const tempDir = (0, node_fs_1.mkdtempSync)((0, node_path_1.join)((0, node_os_1.tmpdir)(), "feature-env-auto-schema-"));
    const distEnvDir = (0, node_path_1.join)(tempDir, "dist", "env");
    const outputPath = (0, node_path_1.join)(tempDir, ".env.example");
    const distIndexPath = (0, node_path_1.join)(originalCwd, ".test-dist", "src", "index.js").replace(/\\/g, "\\\\");
    const schemaPath = (0, node_path_1.join)(distEnvDir, "schema.js");
    (0, node_fs_1.mkdirSync)(distEnvDir, { recursive: true });
    (0, node_fs_1.writeFileSync)(schemaPath, `const { defineEnv, str } = require("${distIndexPath}");\ndefineEnv({ shared: { APP_URL: str() } });\n`, "utf8");
    try {
        process.chdir(tempDir);
        console.log = () => { };
        console.error = () => { };
        const exitCode = (0, legacy_1.runCli)(["--generate-example", "--out", outputPath]);
        strict_1.default.equal(exitCode, 0);
    }
    finally {
        process.chdir(originalCwd);
        console.log = originalLog;
        console.error = originalError;
    }
    strict_1.default.equal((0, node_fs_1.readFileSync)(outputPath, "utf8"), "# [shared]\nAPP_URL=\n");
});
(0, node_test_1.default)("legacy runCli rejects unknown options", () => {
    const originalError = console.error;
    let captured = "";
    try {
        console.error = (message) => {
            captured = String(message ?? "");
        };
        const exitCode = (0, legacy_1.runCli)(["--unknown-option"]);
        strict_1.default.equal(exitCode, 1);
    }
    finally {
        console.error = originalError;
    }
    strict_1.default.match(captured, /Unknown option: --unknown-option/);
});
(0, node_test_1.default)("legacy runCli supports --no-overwrite for generated example", () => {
    const originalLog = console.log;
    const originalError = console.error;
    const tempDir = (0, node_fs_1.mkdtempSync)((0, node_path_1.join)((0, node_os_1.tmpdir)(), "feature-env-cli-overwrite-"));
    const outputPath = (0, node_path_1.join)(tempDir, ".env.example");
    (0, node_fs_1.writeFileSync)(outputPath, "EXISTING=1\n", "utf8");
    let captured = "";
    try {
        console.log = () => { };
        console.error = (message) => {
            captured = String(message ?? "");
        };
        const exitCode = (0, legacy_1.runCli)([
            "--generate-example",
            "--schema",
            "test/fixtures/cli-schema.cjs",
            "--out",
            outputPath,
            "--no-overwrite",
        ]);
        strict_1.default.equal(exitCode, 1);
    }
    finally {
        console.log = originalLog;
        console.error = originalError;
    }
    strict_1.default.match(captured, /Refusing to overwrite existing file/i);
    strict_1.default.equal((0, node_fs_1.readFileSync)(outputPath, "utf8"), "EXISTING=1\n");
});
