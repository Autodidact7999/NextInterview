import { z } from "zod";

const JAVA_INT_MIN = -2_147_483_648;
const JAVA_INT_MAX = 2_147_483_647;

export const javaInteger = z.number().int().min(JAVA_INT_MIN).max(JAVA_INT_MAX);

export function parseInteger(raw: string): number {
  const value = raw.trim();
  if (!/^-?\d+$/.test(value)) {
    throw new Error("Enter a whole number.");
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) {
    throw new Error("Enter a safe Java integer.");
  }
  return parsed;
}

export function parseIntegerArray(raw: string): number[] {
  const value = raw.trim();
  if (!value) return [];
  const body =
    value.startsWith("[") && value.endsWith("]") ? value.slice(1, -1) : value;
  if (!body.trim()) return [];
  return body.split(",").map((part) => parseInteger(part));
}

export function parseStringArray(raw: string): string[] {
  const value = raw.trim();
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      Array.isArray(parsed) &&
      parsed.every((item) => typeof item === "string")
    ) {
      return parsed;
    }
  } catch {
    // Fall back to a comma-separated form below.
  }
  return value.split(",").map((item) => item.trim());
}

export function parseNullableIntegerArray(raw: string): (number | null)[] {
  const value = raw.trim();
  if (!value) return [];
  const body =
    value.startsWith("[") && value.endsWith("]") ? value.slice(1, -1) : value;
  if (!body.trim()) return [];
  return body.split(",").map((part) => {
    const token = part.trim().toLowerCase();
    return token === "null" || token === "#" ? null : parseInteger(token);
  });
}

export function formatIntegerArray(values: readonly number[]): string {
  return `[${values.join(", ")}]`;
}

export function formatStringArray(values: readonly string[]): string {
  return JSON.stringify(values);
}

export function javaIntProductIsSafe(values: readonly number[]): boolean {
  let product = BigInt(1);
  for (const value of values) {
    product *= BigInt(value);
    if (product < BigInt(JAVA_INT_MIN) || product > BigInt(JAVA_INT_MAX))
      return false;
  }
  return true;
}
