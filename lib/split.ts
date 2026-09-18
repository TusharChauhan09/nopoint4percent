export const CHUNK_RUPEES = 1900;

export const UPI_REGEX = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/;

export function isValidUpiId(id: string): boolean {
  return UPI_REGEX.test(id.trim());
}

export function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/,/g, "").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function formatRupeeAmount(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

export function formatDisplayAmount(n: number): string {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function splitAmount(
  total: number,
  chunk = CHUNK_RUPEES,
): number[] {
  if (!Number.isFinite(total) || total <= 0) return [];
  const totalPaise = Math.round(total * 100);
  const chunkPaise = Math.round(chunk * 100);
  if (chunkPaise <= 0) return [];
  const parts: number[] = [];
  let remaining = totalPaise;
  while (remaining > 0) {
    const part = Math.min(chunkPaise, remaining);
    parts.push(part / 100);
    remaining -= part;
  }
  return parts;
}

export function buildUpiUri(opts: {
  upiId: string;
  name?: string;
  amount: number;
}): string {
  const params = new URLSearchParams();
  params.set("pa", opts.upiId.trim());
  const name = opts.name?.trim();
  if (name) params.set("pn", name);
  params.set("am", formatRupeeAmount(opts.amount));
  params.set("cu", "INR");
  return `upi://pay?${params.toString()}`;
}
