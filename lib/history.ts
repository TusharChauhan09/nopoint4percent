import { splitAmount } from "./split";

export const HISTORY_KEY = "nopoint4percent.splits";
export const NICKNAME_KEY = "nopoint4percent.nickname";

export type SplitRecord = {
  id: string;
  upiId: string;
  name?: string;
  total: number;
  parts: number[];
  paidFlags: boolean[];
  createdAt: string;
};

function isRecord(value: unknown): value is SplitRecord {
  if (!value || typeof value !== "object") return false;
  const row = value as SplitRecord;
  return (
    typeof row.id === "string" &&
    typeof row.upiId === "string" &&
    typeof row.total === "number" &&
    Array.isArray(row.parts) &&
    Array.isArray(row.paidFlags) &&
    typeof row.createdAt === "string"
  );
}

export function loadSplits(): SplitRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRecord);
  } catch {
    return [];
  }
}

export function saveSplits(splits: SplitRecord[]): void {
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(splits));
}

export function createSplit(input: {
  upiId: string;
  name?: string;
  total: number;
}): SplitRecord {
  const parts = splitAmount(input.total);
  return {
    id: crypto.randomUUID(),
    upiId: input.upiId.trim(),
    name: input.name?.trim() || undefined,
    total: input.total,
    parts,
    paidFlags: parts.map(() => false),
    createdAt: new Date().toISOString(),
  };
}

export function upsertSplit(
  splits: SplitRecord[],
  record: SplitRecord,
): SplitRecord[] {
  const index = splits.findIndex((row) => row.id === record.id);
  const next =
    index === -1
      ? [record, ...splits]
      : splits.map((row, i) => (i === index ? record : row));
  saveSplits(next);
  return next;
}

export function loadNickname(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(NICKNAME_KEY) ?? "";
}

export function saveNickname(name: string): void {
  window.localStorage.setItem(NICKNAME_KEY, name.trim());
}
