import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { assertEnv, checkEnv, runCli } from "../src/legacy";

test("legacy checkEnv returns missing keys and values", () => {
  const result = checkEnv(["API_KEY", "DATABASE_URL"], {
    env: { API_KEY: "abc123" },
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.missing, ["DATABASE_URL"]);
  assert.deepEqual(result.values, {
    API_KEY: "abc123",
    DATABASE_URL: undefined,
  });
});

test("legacy assertEnv throws with missing list", () => {
  assert.throws(
    () => assertEnv(["SECRET"], { env: {} }),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.equal(error.message, "Missing required environment variables: SECRET");
      assert.deepEqual((error as Error & { missing?: string[] }).missing, ["SECRET"]);
      return true;
    },
  );
});

test("legacy runCli returns success and failure exit codes", () => {
  const originalLog = console.log;
  const originalError = console.error;
  let ok: number;
  let failed: number;

  try {
    console.log = () => {};
    console.error = () => {};
    ok = runCli(["PATH"]);
    failed = runCli(["__SAFE_ENV_ROUTE_NOT_SET__"]);
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }

  assert.equal(ok, 0);
  assert.equal(failed, 1);
});

test("legacy runCli can generate .env.example from defined grouped schema", () => {
  const originalLog = console.log;
  const originalError = console.error;
  const tempDir = mkdtempSync(join(tmpdir(), "feature-env-cli-"));
  const outputPath = join(tempDir, ".env.example");

  try {
    console.log = () => {};
    console.error = () => {};

    const exitCode = runCli([
      "--generate-example",
      "--schema",
      "test/fixtures/cli-schema.cjs",
      "--out",
      outputPath,
    ]);

    assert.equal(exitCode, 0);
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }

  assert.equal(
    readFileSync(outputPath, "utf8"),
    "# [shared]\nAPP_URL=\nPORT=\n\n# [auth]\nGOOGLE_CLIENT_ID=\n",
  );
});

test("legacy runCli auto-loads schema from dist/env/schema.js", () => {
  const originalLog = console.log;
  const originalError = console.error;
  const originalCwd = process.cwd();
  const tempDir = mkdtempSync(join(tmpdir(), "feature-env-auto-schema-"));
  const distEnvDir = join(tempDir, "dist", "env");
  const outputPath = join(tempDir, ".env.example");
  const distIndexPath = join(originalCwd, ".test-dist", "src", "index.js").replace(/\\/g, "\\\\");
  const schemaPath = join(distEnvDir, "schema.js");

  mkdirSync(distEnvDir, { recursive: true });
  writeFileSync(
    schemaPath,
    `const { defineEnv, str } = require("${distIndexPath}");\ndefineEnv({ shared: { APP_URL: str() } });\n`,
    "utf8",
  );

  try {
    process.chdir(tempDir);
    console.log = () => {};
    console.error = () => {};

    const exitCode = runCli(["--generate-example", "--out", outputPath]);
    assert.equal(exitCode, 0);
  } finally {
    process.chdir(originalCwd);
    console.log = originalLog;
    console.error = originalError;
  }

  assert.equal(readFileSync(outputPath, "utf8"), "# [shared]\nAPP_URL=\n");
});
