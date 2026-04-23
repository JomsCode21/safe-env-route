export interface CheckEnvOptions {
  allowEmpty?: boolean;
  env?: Record<string, string | undefined | null>;
  message?: string;
}

export interface CheckEnvResult {
  ok: boolean;
  missing: string[];
  values: Record<string, string | undefined | null>;
}

export function checkEnv(
  requiredNames: string[],
  options?: CheckEnvOptions,
): CheckEnvResult;

export function assertEnv(
  requiredNames: string[],
  options?: CheckEnvOptions,
): CheckEnvResult;

export function runCli(argv: string[]): number;
