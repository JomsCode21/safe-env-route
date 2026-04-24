import { bool, defineEnv, enumOf, int, str, url } from "safe-env-route";

// Define env vars once and group them by app feature.
export const envSchema = defineEnv({
  // Shared values needed across many routes/modules.
  shared: {
    NODE_ENV: enumOf(["development", "test", "production"] as const),
    APP_URL: url(),
    PORT: int(),
    DEBUG: bool(),
  },
  // Database-only config.
  db: {
    DATABASE_URL: url(),
  },
  // Auth-only config.
  auth: {
    GOOGLE_CLIENT_ID: str(),
    GOOGLE_CLIENT_SECRET: str(),
  },
  // Optional payments integration config.
  payments: {
    STRIPE_SECRET_KEY: str(),
  },
});
