export type EnvValue = string | undefined | null;

export type EnvMap = Record<string, EnvValue>;

export interface EnvValidator<T> {
  readonly kind: string;
  readonly description: string;
  parse(raw: string, name: string): T;
}

export type EnvGroupSchema = Record<string, EnvValidator<unknown>>;

export type EnvSchema = Record<string, EnvGroupSchema>;

export type InferValidator<V> = V extends EnvValidator<infer T> ? T : never;

type GroupValues<G extends EnvGroupSchema> = {
  [K in keyof G]: InferValidator<G[K]>;
};

type UnionToIntersection<U> = (
  U extends unknown ? (value: U) => void : never
) extends (value: infer I) => void
  ? I
  : never;

type Simplify<T> = { [K in keyof T]: T[K] };

export type GroupSelectionValues<
  S extends EnvSchema,
  G extends readonly (keyof S)[],
> = Simplify<UnionToIntersection<GroupValues<S[G[number]]>>>;
