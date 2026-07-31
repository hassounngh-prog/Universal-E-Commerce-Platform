import { PlatformError } from "../errors/platform-error";

export function assertDefined<T>(
  value: T | null | undefined,
  message = "Expected value to be defined",
): T {
  if (value === null || value === undefined) {
    throw new PlatformError(message, { code: "assertion_failed" });
  }
  return value;
}

export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}
