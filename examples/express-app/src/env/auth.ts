import { requireEnv } from "feature-env";
import "./schema";

// Validate only what auth routes need.
export const authEnv = requireEnv(["shared", "auth"]);
