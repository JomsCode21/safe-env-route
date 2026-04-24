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
