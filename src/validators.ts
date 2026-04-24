import type { EnvValidator } from "./types";

function createValidator<T>(
  kind: string,
  description: string,
  parse: (raw: string, name: string) => T,
): EnvValidator<T> {
  return { kind, description, parse };
}

export function str(): EnvValidator<string> {
  return createValidator("str", "a string", (raw) => raw);
}

export function url(): EnvValidator<string> {
  return createValidator("url", "a valid URL", (raw) => {
    new URL(raw);
    return raw;
  });
}

const trueValues = new Set(["true", "1", "yes", "on"]);
const falseValues = new Set(["false", "0", "no", "off"]);

export function bool(): EnvValidator<boolean> {
  return createValidator("bool", "a boolean (true/false)", (raw) => {
    const normalized = raw.trim().toLowerCase();
    if (trueValues.has(normalized)) {
      return true;
    }
    if (falseValues.has(normalized)) {
      return false;
    }
    throw new Error("Expected true, false, 1, 0, yes, no, on, or off");
  });
}

export function int(): EnvValidator<number> {
  return createValidator("int", "an integer", (raw) => {
    if (!/^-?\d+$/.test(raw.trim())) {
      throw new Error("Expected a whole number");
    }
    return Number.parseInt(raw, 10);
  });
}

export function enumOf<const T extends readonly string[]>(values: T): EnvValidator<T[number]> {
  if (values.length === 0) {
    throw new Error("enumOf(values) requires at least one value");
  }

  const allowed = new Set(values);
  return createValidator("enum", `one of: ${values.join(", ")}`, (raw) => {
    if (!allowed.has(raw)) {
      throw new Error(`Expected one of: ${values.join(", ")}`);
    }
    return raw as T[number];
  });
}
