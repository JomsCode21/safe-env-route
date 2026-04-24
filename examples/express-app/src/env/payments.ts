import { optionalEnv } from "safe-env-route";
import "./schema";

// Payments can be optional; provided values are still validated.
export const paymentsEnv = optionalEnv(["payments"]);
