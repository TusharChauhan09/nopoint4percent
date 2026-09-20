import { isValidUpiId, parseAmount } from "@/lib/split";

export type ParsedUpiQr = {
  upiId: string;
  name?: string;
  amount?: number;
};

function param(search: string, key: string): string | undefined {
  const params = new URLSearchParams(search);
  for (const [name, value] of params) {
    if (name.toLowerCase() === key && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function queryFromPayload(raw: string): string {
  const withoutHash = raw.split("#")[0] ?? raw;
  const intent = withoutHash.match(/^intent:\/\/([^?#]*)\?(.+)$/i);
  if (intent?.[2]) return intent[2];
  const q = withoutHash.indexOf("?");
  if (q >= 0) return withoutHash.slice(q + 1);
  return withoutHash;
}

export function parseUpiQr(raw: string): ParsedUpiQr | null {
  const text = raw.trim();
  if (!text) return null;
  if (isValidUpiId(text)) return { upiId: text.trim() };

  const search = queryFromPayload(text);
  const upiId = param(search, "pa")?.replace(/\s+/g, "");
  const fromPa = upiId && isValidUpiId(upiId) ? upiId.trim() : null;
  const fallback = text.match(/[a-zA-Z0-9._-]{2,256}@[a-zA-Z0-9]{2,64}/)?.[0];
  const resolved = fromPa || (fallback && isValidUpiId(fallback) ? fallback : null);
  if (!resolved) return null;

  const name = param(search, "pn");
  const amountRaw = param(search, "am");
  const amount = amountRaw ? parseAmount(amountRaw) : null;

  return {
    upiId: resolved,
    ...(name ? { name } : {}),
    ...(amount != null ? { amount } : {}),
  };
}
