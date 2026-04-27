import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { defineEnv, generateEnvExample, int, str, writeEnvExample } from "../src";

test("generateEnvExample uses grouped schema order with comments", () => {
  defineEnv({
    shared: {
      APP_URL: str(),
      PORT: int(),
    },
    auth: {
      GOOGLE_CLIENT_ID: str(),
      GOOGLE_CLIENT_SECRET: str(),
    },
  });

  const result = generateEnvExample();

  assert.equal(
    result,
    "# [shared]\nAPP_URL=\nPORT=\n\n# [auth]\nGOOGLE_CLIENT_ID=\nGOOGLE_CLIENT_SECRET=\n",
  );
});

test("generateEnvExample supports output without comments", () => {
  defineEnv({
    shared: {
      APP_URL: str(),
    },
    auth: {
      GOOGLE_CLIENT_ID: str(),
    },
  });

  const result = generateEnvExample({
    includeComments: false,
    newlineBetweenGroups: false,
  });

  assert.equal(result, "APP_URL=\nGOOGLE_CLIENT_ID=\n");
});

test("writeEnvExample writes .env.example-compatible file", () => {
  defineEnv({
    payments: {
      STRIPE_SECRET_KEY: str(),
    },
  });

  const tempDir = mkdtempSync(join(tmpdir(), "feature-env-"));
  const outputPath = join(tempDir, ".env.example");

  const content = writeEnvExample(outputPath);
  const saved = readFileSync(outputPath, "utf8");

  assert.equal(content, "# [payments]\nSTRIPE_SECRET_KEY=\n");
  assert.equal(saved, content);
});

test("writeEnvExample can refuse overwrite", () => {
  defineEnv({
    shared: {
      APP_URL: str(),
    },
  });

  const tempDir = mkdtempSync(join(tmpdir(), "feature-env-overwrite-"));
  const outputPath = join(tempDir, ".env.example");
  writeFileSync(outputPath, "EXISTING=1\n", "utf8");

  assert.throws(
    () =>
      writeEnvExample(outputPath, {
        overwrite: false,
      }),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /Refusing to overwrite existing file/i);
      return true;
    },
  );
});
