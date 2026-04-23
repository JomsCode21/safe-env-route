# env-checker

`env-checker` is a small Node.js utility for checking whether required environment variables are present.

It is useful when your app needs values like API keys, database URLs, secrets, or feature flags before starting a build, server, or deployment step.

## What it does

- Checks a list of environment variable names.
- Returns which variables are missing.
- Throws an error if required variables are not set.
- Can be used as a Node module or as a CLI command.

## Installation

```powershell
npm install env-checking
```

## How to use it

### 1. As a Node.js module

Import it and check your required variables:

```javascript
const { checkEnv, assertEnv } = require("env-checker");

const result = checkEnv(["API_KEY", "DATABASE_URL"]);

if (!result.ok) {
  console.error("Missing:", result.missing);
  process.exit(1);
}
```

### 2. As a strict guard

Use `assertEnv` when you want the app to stop immediately if something is missing:

```javascript
const { assertEnv } = require("env-checker");

assertEnv(["API_KEY", "DATABASE_URL"]);

console.log("Environment is ready.");
```

### 3. As a CLI tool

You can run it from the command line and pass the required variable names:

```powershell
node src\index.js API_KEY DATABASE_URL
```

If all variables are set, it prints:

```text
All required environment variables are set.
```

If something is missing, it prints the missing names and exits with code `1`.

## How to apply it in your project

The usual pattern is to call it right before your app starts, so your app fails fast instead of crashing later with confusing errors.

```javascript
const { assertEnv } = require("env-checker");

assertEnv(["API_KEY", "DATABASE_URL"]);

// Start the rest of your app here.
```

This is helpful for:

- backend APIs
- build scripts
- deployment checks
- local development setup

## API

### `checkEnv(requiredNames, options?)`

Returns an object with:

- `ok`: `true` if every variable is present
- `missing`: array of missing variable names
- `values`: object containing the current values for each requested variable

Options:

- `env`: custom environment object to check instead of `process.env`
- `allowEmpty`: if `true`, empty strings are treated as valid values

### `assertEnv(requiredNames, options?)`

Same check as `checkEnv`, but throws an error when one or more variables are missing.

Options:

- `env`: custom environment object
- `allowEmpty`: allow empty string values
- `message`: custom error message

### `runCli(argv)`

Internal CLI helper used by the executable entry point.

## Example

```javascript
const { checkEnv } = require("env-checker");

const envStatus = checkEnv(["PORT", "NODE_ENV"], {
  env: {
    PORT: "3000",
    NODE_ENV: "development",
  },
});

console.log(envStatus);
```

## Testing

Run the included tests with:

```powershell
npm test
```
