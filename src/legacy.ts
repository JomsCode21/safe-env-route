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

export interface LegacyEnvError extends Error {
  missing?: string[];
}

function normalizeNameList(names: unknown): string[] {
  if (!Array.isArray(names)) {
    return [];
  }

  return names.map((name) => String(name).trim()).filter(Boolean);
}

function isMissingValue(value: string | undefined | null, allowEmpty: boolean): boolean {
  if (value === undefined || value === null) {
    return true;
  }

  if (allowEmpty) {
    return false;
  }

  return value.trim() === "";
}

export function checkEnv(requiredNames: string[], options: CheckEnvOptions = {}): CheckEnvResult {
  const names = normalizeNameList(requiredNames);
  const allowEmpty = Boolean(options.allowEmpty);
  const env = options.env ?? process.env;
  const missing: string[] = [];

  for (const name of names) {
    if (isMissingValue(env[name], allowEmpty)) {
      missing.push(name);
    }
  }

  const values = names.reduce<Record<string, string | undefined | null>>((result, name) => {
    result[name] = env[name];
    return result;
  }, {});

  return {
    ok: missing.length === 0,
    missing,
    values,
  };
}

export function assertEnv(requiredNames: string[], options: CheckEnvOptions = {}): CheckEnvResult {
  const result = checkEnv(requiredNames, options);

  if (result.ok) {
    return result;
  }

  const message =
    options.message ?? `Missing required environment variables: ${result.missing.join(", ")}`;
  const error: LegacyEnvError = new Error(message);
  error.missing = result.missing;
  throw error;
}

export function runCli(argv: string[]): number {
  const requiredNames = argv.length > 0 ? argv : [];
  const result = checkEnv(requiredNames);

  if (result.ok) {
    console.log("All required environment variables are set.");
    return 0;
  }

  console.error(`Missing environment variables: ${result.missing.join(", ")}`);
  return 1;
}
