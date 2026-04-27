import test from "node:test";
import assert from "node:assert/strict";

import { defineEnv, enumOf, requireEnv, str, url } from "../src";

test("defineEnv + requireEnv validates selected groups", () => {
  defineEnv({
    shared: {
      APP_URL: url(),
      NODE_ENV: enumOf(["development", "test", "production"] as const),
    },
    auth: {
      GOOGLE_CLIENT_ID: str(),
      GOOGLE_CLIENT_SECRET: str(),
    },
    payments: {
      STRIPE_SECRET_KEY: str(),
    },
  });

  const result = requireEnv(["shared", "auth"], {
    env: {
      APP_URL: "https://example.com",
      NODE_ENV: "development",
      GOOGLE_CLIENT_ID: "id",
      GOOGLE_CLIENT_SECRET: "secret",
    },
  });

  assert.deepEqual(result, {
    APP_URL: "https://example.com",
    NODE_ENV: "development",
    GOOGLE_CLIENT_ID: "id",
    GOOGLE_CLIENT_SECRET: "secret",
  });
});

test("requireEnv does not force unrelated groups", () => {
  const schema = defineEnv({
    shared: {
      APP_URL: url(),
    },
    payments: {
      STRIPE_SECRET_KEY: str(),
    },
  });

  const result = requireEnv(schema, ["shared"], {
    env: {
      APP_URL: "https://example.com",
    },
  });

  assert.deepEqual(result, {
    APP_URL: "https://example.com",
  });
});

test("defineEnv rejects empty schema", () => {
  assert.throws(
    () => defineEnv({}),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /at least one group/i);
      return true;
    },
  );
});

test("defineEnv rejects empty group schema", () => {
  assert.throws(
    () =>
      defineEnv({
        shared: {},
      }),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /must define at least one environment variable/i);
      return true;
    },
  );
});

test("defineEnv rejects non-validator values", () => {
  assert.throws(
    () =>
      defineEnv({
        shared: {
          PORT: 3000 as unknown as ReturnType<typeof str>,
        },
      }),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /Invalid validator/i);
      return true;
    },
  );
});
