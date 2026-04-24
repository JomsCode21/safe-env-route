import test from "node:test";
import assert from "node:assert/strict";

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
