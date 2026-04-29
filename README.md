# feature-env

Feature-scoped environment validation for web apps.

`feature-env` helps you define environment variables once, validate only the groups each module needs, and generate `.env.example` from the same schema.

> Previously named `safe-env-route`.

## Installation

```bash
npm install feature-env
```

## Basic Implementation

`src/env/schema.ts`

```ts
import { defineEnv, enumOf, int, str, url } from "feature-env";

export const envSchema = defineEnv({
  shared: {
    NODE_ENV: enumOf(["development", "test", "production"] as const),
    APP_URL: url(),
    PORT: int(),
  },
  db: {
    MONGODB_URI: str(),
  },
});
```

`src/env/server.ts`

```ts
import { requireEnv } from "feature-env";
import { envSchema } from "./schema";

export const serverEnv = requireEnv(envSchema, ["shared"] as const);
```

`src/env/db.ts`

```ts
import { requireEnv } from "feature-env";
import { envSchema } from "./schema";

export const dbEnv = requireEnv(envSchema, ["db"] as const);
```

## Real Project Pattern (Module-Scoped Env)

This is a practical backend pattern (like your BPLO setup):

1. Define one grouped schema in `src/env/schema.ts`
2. Create one env module per feature (`db.ts`, `auth.ts`, `mail.ts`, `security.ts`, etc.)
3. Each module calls `requireEnv(...)` or `optionalEnv(...)` only for groups it needs
4. Derive app-specific values (like `isProduction`, parsed origin lists) inside those modules

`src/env/schema.ts` (example shape)

```ts
import { bool, defineEnv, enumOf, int, str } from "feature-env";

export const envSchema = defineEnv({
  runtime: {
    NODE_ENV: enumOf(["development", "test", "production"] as const),
  },
  shared: {
    NODE_ENV: enumOf(["development", "test", "production"] as const),
    PORT: int(),
    CORS_ORIGINS: str(),
  },
  db: {
    MONGO_DB_URI: str(),
  },
  auth: {
    JWT_ACCESS_TOKEN: str(),
    JWT_REFRESH_TOKEN: str(),
    GOOGLE_CLIENT_ID: str(),
  },
  tokens: {
    JWT_ACCESS_TOKEN: str(),
    JWT_REFRESH_TOKEN: str(),
  },
  mail: {
    MAIL_HOST: str(),
    MAIL_PORT: int(),
    MAIL: str(),
    MAIL_PASSWORD: str(),
  },
  security: {
    REFRESH_COOKIE_NAME: str(),
    REFRESH_COOKIE_PATH: str(),
    GLOBAL_RATE_LIMIT_MINUTES: int(),
    GLOBAL_RATE_LIMIT_MAX: int(),
    RECAPTCHA_SECRET_KEY: str(),
  },
  payments: {
    PAYMENT_QR_SECRET: str(),
  },
  seed: {
    SEED_SUPER_ADMIN: bool(),
    SUPER_ADMIN_EMAIL: str(),
    SUPER_ADMIN_PASSWORD: str(),
  },
});
```

`src/env/server.ts` (required + derived)

```ts
import { requireEnv } from "feature-env";
import { envSchema } from "@/env/schema";

const sharedEnv = requireEnv(envSchema, ["shared"] as const);

const normalizeOrigin = (value: string) => value.trim().replace(/\/+$/, "");
const envAllowedOrigins = sharedEnv.CORS_ORIGINS.split(",")
  .map(normalizeOrigin)
  .filter(Boolean);

const isProduction = sharedEnv.NODE_ENV === "production";
const devFallbackOrigins = isProduction ? [] : ["http://localhost:5173"];

export const serverEnv = {
  ...sharedEnv,
  isProduction,
  allowedOrigins: Array.from(
    new Set([...envAllowedOrigins, ...devFallbackOrigins]),
  ),
};
```

`src/env/security.ts` (combine groups + derive)

```ts
import { requireEnv } from "feature-env";
import { envSchema } from "@/env/schema";

const env = requireEnv(envSchema, ["runtime", "security"] as const);

export const securityEnv = {
  ...env,
  isProduction: env.NODE_ENV === "production",
};
```

`src/env/payments.ts` (optional values + normalization)

```ts
import { optionalEnv } from "feature-env";
import { envSchema } from "./schema";

const optionalEnvValues = optionalEnv(envSchema, [
  "payments",
  "tokens",
] as const);
const normalize = (value: unknown) => String(value ?? "").trim();

export const paymentEnv = {
  paymentQrSecret: normalize(optionalEnvValues.PAYMENT_QR_SECRET),
  jwtAccessToken: normalize(optionalEnvValues.JWT_ACCESS_TOKEN),
};
```

Important: avoid selecting groups together when they define the same key name (for example `runtime.NODE_ENV` and `shared.NODE_ENV`), because duplicate keys across selected groups now throw a validation error.

### File Call Flow

`src/app.ts` (or `src/index.ts`)

```ts
import { serverEnv } from "./env/server";
import { connectDB } from "./db/connect";

async function bootstrap() {
  console.log(`Starting on port ${serverEnv.PORT}`);
  await connectDB();
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

`src/db/connect.ts`

```ts
import mongoose from "mongoose";
import { dbEnv } from "../env/db";

export async function connectDB() {
  await mongoose.connect(dbEnv.MONGODB_URI);
}
```

## Core API

### `defineEnv(schema)`

Registers grouped schema (source of truth for validation and `.env.example` generation).

### `requireEnv(groups, options?)`

Validates selected groups and throws on missing/invalid values.

### `optionalEnv(groups, options?)`

Validates selected groups but allows missing values.

### `generateEnvExample(options?)`

Creates and returns `.env.example` content as a string from the schema registered with `defineEnv()`.

```ts
import { generateEnvExample } from "feature-env";
import { envSchema } from "./env/schema";

const output = generateEnvExample();
console.log(output);
```

With options:

```ts
import { generateEnvExample } from "feature-env";
import { envSchema } from "./env/schema";

const output = generateEnvExample({
  includeComments: true,
  newlineBetweenGroups: true,
});
```

### `writeEnvExample(path?, options?)`

Generates `.env.example` content from the same schema and writes it to a file. Default path is `.env.example`.

```ts
import { writeEnvExample } from "feature-env";

writeEnvExample(); // .env.example
writeEnvExample("./config/.env.example");
writeEnvExample(".env.example", { overwrite: false }); // throw if file exists
```

Programmatic implementation example:

`scripts/generate-env-example.ts`

```ts
import "../src/env/schema"; // calls defineEnv(...)
import { writeEnvExample } from "feature-env";

writeEnvExample(".env.example");
```

## Example Output

```env
# [shared]
APP_URL=
NODE_ENV=
PORT=
DEBUG=

# [auth]
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# [payments]
STRIPE_SECRET_KEY=
```

## Validators

- `str()`: string
- `url()`: valid URL string
- `bool()`: boolean (`true/false`, `1/0`, `yes/no`, `on/off`)
- `int()`: whole number
- `port()`: valid TCP port (1-65535)
- `enumOf([...])`: one allowed string value
- `json()`: parses JSON string to object/array

## Options

### `options.env`

Pass a custom env object (useful for tests):

```ts
requireEnv(["shared"], {
  env: {
    APP_URL: "https://example.com",
    NODE_ENV: "development",
    PORT: "3000",
    DEBUG: "true",
  },
});
```

### `options.strictUnknownKeys`

Fail on keys not defined in selected groups:

```ts
requireEnv(["shared"], {
  strictUnknownKeys: true,
  env: {
    APP_URL: "https://example.com",
    APP_URl: "https://typo.example.com",
  },
});
```

## CLI

### Legacy mode

```bash
npx feature-env API_KEY DATABASE_URL
```

### Generate `.env.example`

```bash
npx feature-env --generate-example
```

Custom output path:

```bash
npx feature-env --generate-example --out ./config/.env.example
```

Prevent overwrite of an existing output file:

```bash
npx feature-env --generate-example --no-overwrite
```

Explicit schema path:

```bash
npx feature-env --generate-example --schema ./dist/env/schema.js
```

If your schema is TypeScript and compiled to `dist`, run:

```bash
npm run build
npx feature-env --generate-example
```

Auto-detect checks (in order):

- `dist/env/schema.js`
- `dist/schema.js`
- `env/schema.js`
- `schema.js`

Notes:

- Installing `feature-env` alone does not generate `.env.example`.
- Generation happens when `npx feature-env --generate-example` is executed.
- If you install globally (`npm install -g feature-env`), you can run `feature-env ...` without `npx`.

## Auto-generate After Install (Consumer App)

In the app that uses `feature-env`, add:

```json
{
  "scripts": {
    "build": "tsc",
    "env:example": "npx feature-env --generate-example",
    "postinstall": "npm run build && npm run env:example"
  }
}
```

Use `--schema` only when auto-detect does not match your layout.

## Legacy Compatibility

For gradual migration:

```ts
import { assertEnv, checkEnv, runCli } from "feature-env/legacy";
```

## Examples in Repo

- `examples/express-app/src/env/schema.ts`
- `examples/express-app/src/env/server.ts`
- `examples/express-app/src/env/auth.ts`
- `examples/express-app/src/env/payments.ts`

## Development

```bash
npm run build
npm test
```
