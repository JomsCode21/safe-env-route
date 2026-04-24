import { requireEnv } from "safe-env-route";
import "./schema";

// Validate critical env at startup so the server fails fast if misconfigured.
export const serverEnv = requireEnv(["shared", "db"]);
