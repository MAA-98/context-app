export type ValidationIssue = {
  path: PropertyKey[];
  message: string;
};

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: ValidationIssue[] };

export type Validator<T> = (input: unknown) => ValidationResult<T>;