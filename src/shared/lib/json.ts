import { Prisma } from "@/generated/prisma/client";

export type JsonRecord = Record<string, unknown>;

export function toJson(
  value: JsonRecord | null | undefined,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  if (value === null) return Prisma.JsonNull;
  if (value === undefined) return undefined;
  return value as Prisma.InputJsonValue;
}

export function toJsonValue(
  value: unknown,
): Prisma.InputJsonValue | Prisma.JsonNullValueInput {
  if (value === undefined) return Prisma.JsonNull;
  return value as Prisma.InputJsonValue;
}

export function toRecord(value: unknown): JsonRecord | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "object" || Array.isArray(value)) return null;
  return value as JsonRecord;
}
