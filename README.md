# feature-env

Feature-scoped environment validation for web apps.

feature-env is a TypeScript-first npm package for validating environment variables by feature, route, or module.

Instead of validating one large global env object at startup, feature-env lets you define grouped env requirements and load only what a part of your app actually needs.

Validate env by feature, route, or module.

Built for modern web apps that have separate auth, payments, storage, analytics, and other feature-level configuration.

> Previously named `safe-env-route`. The package was renamed to better reflect that it supports feature-, route-, and module-scoped env validation.

## Why use this?

- Validate only the environment variables each feature actually needs.
- Fail fast with clear errors when env is missing or invalid
- Keep feature-specific env checks close to feature code
- Get parsed values (`int`, `bool`, `enum`) instead of raw strings
- Keep old flat env-check behavior via `feature-env/legacy`

## Installation

```bash
npm install feature-env
```

## Quick Start

```ts
import { defineEnv, requireEnv, str, url, enumOf, int, bool } from "feature-env";

// Define your env contract once.
defineEnv({
  // Shared vars used across many features.
  shared: {
    APP_URL: url(),
    NODE_ENV: enumOf(["development", "test", "production"] as const),
    PORT: int(),
    DEBUG: bool(),
  },
  // Auth-only vars.
  auth: {
    GOOGLE_CLIENT_ID: str(),
    GOOGLE_CLIENT_SECRET: str(),
  },
  // Payments-only vars.
  payments: {
    STRIPE_SECRET_KEY: str(),
  },
});

// In an auth route/module, validate only required groups.
const env = requireEnv(["shared", "auth"]);

// env.PORT is number
// env.DEBUG is boolean
// env.NODE_ENV is "development" | "test" | "production"
```

## How It Works

1. Call `defineEnv()` once with grouped schema.
2. Call `requireEnv([...groups])` where needed.
3. Package reads `process.env`, validates selected groups, and returns parsed values.
4. If invalid/missing, it throws a readable `EnvValidationError`.

## API

### `defineEnv(schema)`

Registers your grouped schema.

```ts
defineEnv({
  shared: { APP_URL: url() },
  auth: { GOOGLE_CLIENT_ID: str() },
});
```

### `requireEnv(groups, options?)`

Validates selected groups.

- Throws on missing values
- Throws on invalid values
- Returns parsed values

```ts
const env = requireEnv(["shared", "auth"]);
```

### `optionalEnv(groups, options?)`

Validates selected groups but allows missing values.

- Missing values are skipped
- Provided values must still be valid

```ts
const env = optionalEnv(["payments"]);
```

### `options.env`

All validators accept `options.env` if you want to validate a custom env object (useful for tests).

```ts
const env = requireEnv(["shared"], {
  env: { APP_URL: "https://example.com", NODE_ENV: "development", PORT: "3000", DEBUG: "true" },
});
```

### `options.strictUnknownKeys`

Set `strictUnknownKeys: true` to fail on keys that are not defined in the selected groups.

```ts
const env = requireEnv(["shared"], {
  strictUnknownKeys: true,
  env: {
    APP_URL: "https://example.com",
    NODE_ENV: "development",
    APP_URl: "https://typo.example.com", // typo -> unknown key
  },
});
```

Notes:

- Default is `false` (backward compatible).
- Best used with a filtered `options.env` object or full schema coverage when strictness is enabled.

## Validators

- `str()` -> string
- `url()` -> URL string (must be valid URL)
- `bool()` -> boolean (`true/false`, `1/0`, `yes/no`, `on/off`)
- `int()` -> number (whole integer)
- `enumOf([...])` -> one of allowed string values

## Error Example

When validation fails, errors include the group and key:

```txt
Environment validation failed:
- [shared] APP_URL expected a valid URL, received "not-a-url"
- [auth] GOOGLE_CLIENT_SECRET is required but missing
- [shared] APP_URl is not defined in schema. Did you mean "APP_URL"?
```

## Legacy Compatibility

If you are migrating from the old flat checker:

```ts
import { checkEnv, assertEnv, runCli } from "feature-env/legacy";
```

This keeps old behavior while you migrate gradually to grouped schemas.

## CLI

Legacy-compatible CLI is included:

```bash
feature-env API_KEY DATABASE_URL
```

## Minimal Migration Path

1. Keep existing code using `feature-env/legacy`
2. Add grouped schema with `defineEnv()`
3. Replace flat checks route-by-route with `requireEnv([...])`
4. Remove legacy usage when migration is done

## Real App Integration (Express Example)

This repo includes ready-to-copy app templates:

- `examples/express-app/src/env/schema.ts`
- `examples/express-app/src/env/server.ts`
- `examples/express-app/src/env/auth.ts`
- `examples/express-app/src/env/payments.ts`

### 1) Define groups once

```ts
// src/env/schema.ts
import { bool, defineEnv, enumOf, int, str, url } from "feature-env";

// Define env vars once and group them by feature.
defineEnv({
  // Shared values needed by many modules.
  shared: {
    NODE_ENV: enumOf(["development", "test", "production"] as const),
    APP_URL: url(),
    PORT: int(),
    DEBUG: bool(),
  },
  // Database connection config.
  db: {
    DATABASE_URL: url(),
  },
  // Auth provider credentials.
  auth: {
    GOOGLE_CLIENT_ID: str(),
    GOOGLE_CLIENT_SECRET: str(),
  },
  // Optional payments integration.
  payments: {
    STRIPE_SECRET_KEY: str(),
  },
});
```

### 2) Validate required env before boot

```ts
// src/env/server.ts
import { requireEnv } from "feature-env";
import "./schema";

// Validate critical env before app boot.
export const serverEnv = requireEnv(["shared", "db"]);
```

### 3) Validate only what each feature needs

```ts
// src/env/auth.ts
import { requireEnv } from "feature-env";
import "./schema";

// Auth routes require shared + auth groups.
export const authEnv = requireEnv(["shared", "auth"]);
```

```ts
// src/env/payments.ts
import { optionalEnv } from "feature-env";
import "./schema";

// Payments can be absent in some deployments.
export const paymentsEnv = optionalEnv(["payments"]);
```

## Development

```bash
npm run build
npm test
```

## Quick Demo: Strict Unknown Keys

```bash
npm run build
node examples/strict-unknown-keys.cjs
```

This prints:

- strict mode off: extra key is ignored
- strict mode on: extra key throws an error with suggestion
