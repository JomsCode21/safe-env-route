import { requireEnv } from "safe-env-route";
import "./schema";

// Validate only what auth routes need.
export const authEnv = requireEnv(["shared", "auth"]);
