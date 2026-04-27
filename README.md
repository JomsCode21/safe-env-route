# feature-env

Feature-scoped environment validation for web apps.

`feature-env` helps you define environment variables once, validate only the groups each module needs, and generate `.env.example` from the same schema.

> Previously named `safe-env-route`.

## Installation

```bash
npm install feature-env
```

## Quick Start

```ts
import { bool, defineEnv, enumOf, int, requireEnv, str, url } from "feature-env";

defineEnv({
  shared: {
    APP_URL: url(),
    NODE_ENV: enumOf(["development", "test", "production"] as const),
    PORT: int(),
    DEBUG: bool(),
  },
  auth: {
    GOOGLE_CLIENT_ID: str(),
    GOOGLE_CLIENT_SECRET: str(),
  },
  payments: {
    STRIPE_SECRET_KEY: str(),
  },
});

const env = requireEnv(["shared", "auth"]);
```

## Core API

### `defineEnv(schema)`

Registers grouped schema (source of truth for validation and `.env.example` generation).

### `requireEnv(groups, options?)`

Validates selected groups and throws on missing/invalid values.

### `optionalEnv(groups, options?)`

Validates selected groups but allows missing values.

### `generateEnvExample(options?)`

Returns `.env.example` content as a string.

```ts
import { generateEnvExample } from "feature-env";

const output = generateEnvExample();
```

### `writeEnvExample(path?, options?)`

Writes generated output to file. Default path is `.env.example`.

```ts
import { writeEnvExample } from "feature-env";

writeEnvExample(); // .env.example
writeEnvExample("./config/.env.example");
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
- `enumOf([...])`: one allowed string value

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
feature-env API_KEY DATABASE_URL
```

### Generate `.env.example`

```bash
feature-env --generate-example
```

Custom output path:

```bash
feature-env --generate-example --out ./config/.env.example
```

Explicit schema path:

```bash
feature-env --generate-example --schema ./dist/env/schema.js
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
- Generation happens when `feature-env --generate-example` is executed.

## Auto-generate After Install (Consumer App)

In the app that uses `feature-env`, add:

```json
{
  "scripts": {
    "build": "tsc",
    "env:example": "feature-env --generate-example",
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
