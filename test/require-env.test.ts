import test from "node:test";
import assert from "node:assert/strict";

import { defineEnv, EnvValidationError, int, optionalEnv, requireEnv, str } from "../src";

test("requireEnv throws clear errors for missing and invalid values", () => {
  defineEnv({
    shared: {
      PORT: int(),
      API_KEY: str(),
    },
  });

  assert.throws(
    () =>
      requireEnv(["shared"], {
        env: {
          PORT: "not-an-int",
        },
      }),
    (error: unknown) => {
      assert.ok(error instanceof EnvValidationError);
      assert.match(error.message, /PORT/);
      assert.match(error.message, /API_KEY/);
      return true;
    },
  );
});

test("optionalEnv skips missing variables but validates provided ones", () => {
  defineEnv({
    analytics: {
      ANALYTICS_WRITE_KEY: str(),
      ANALYTICS_TIMEOUT: int(),
    },
  });

  const result = optionalEnv(["analytics"], {
    env: {
      ANALYTICS_TIMEOUT: "30",
    },
  });

  assert.deepEqual(result, {
    ANALYTICS_TIMEOUT: 30,
  });
});

test("strictUnknownKeys is opt-in and ignores unknown keys by default", () => {
  defineEnv({
    shared: {
      API_URL: str(),
    },
  });

  const result = requireEnv(["shared"], {
    env: {
      API_URL: "https://example.com",
      EXTRA_KEY: "value",
    },
  });

  assert.deepEqual(result, {
    API_URL: "https://example.com",
  });
});

test("strictUnknownKeys throws for unknown keys", () => {
  defineEnv({
    shared: {
      API_URL: str(),
    },
  });

  assert.throws(
    () =>
      requireEnv(["shared"], {
        strictUnknownKeys: true,
        env: {
          API_URL: "https://example.com",
          EXTRA_KEY: "value",
        },
      }),
    (error: unknown) => {
      assert.ok(error instanceof EnvValidationError);
      assert.match(error.message, /\[shared\] EXTRA_KEY is not defined in schema/);
      return true;
    },
  );
});

test("strictUnknownKeys includes typo suggestions", () => {
  defineEnv({
    shared: {
      API_URL: str(),
    },
  });

  assert.throws(
    () =>
      requireEnv(["shared"], {
        strictUnknownKeys: true,
        env: {
          API_URl: "https://example.com",
        },
      }),
    (error: unknown) => {
      assert.ok(error instanceof EnvValidationError);
      assert.match(error.message, /Did you mean "API_URL"\?/);
      return true;
    },
  );
});

test("optionalEnv also supports strictUnknownKeys", () => {
  defineEnv({
    analytics: {
      ANALYTICS_TIMEOUT: int(),
    },
  });

  assert.throws(
    () =>
      optionalEnv(["analytics"], {
        strictUnknownKeys: true,
        env: {
          ANALYTICS_TIMOUT: "30",
        },
      }),
    (error: unknown) => {
      assert.ok(error instanceof EnvValidationError);
      assert.match(error.message, /ANALYTICS_TIMOUT is not defined in schema/);
      return true;
    },
  );
});

test("requireEnv throws when selected groups define duplicate keys", () => {
  defineEnv({
    shared: {
      API_URL: str(),
    },
    auth: {
      API_URL: str(),
    },
  });

  assert.throws(
    () =>
      requireEnv(["shared", "auth"], {
        env: {
          API_URL: "https://example.com",
        },
      }),
    (error: unknown) => {
      assert.ok(error instanceof EnvValidationError);
      assert.match(error.message, /API_URL is defined in multiple selected groups/);
      return true;
    },
  );
});
