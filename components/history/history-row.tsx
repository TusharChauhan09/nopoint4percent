import { formatDisplayAmount } from "@/lib/split";
import type { SplitRecord } from "@/lib/history";

type HistoryRowProps = {
  item: SplitRecord;
  onOpen: () => void;
};

export function HistoryRow({ item, onOpen }: HistoryRowProps) {
  const paid = item.paidFlags.filter(Boolean).length;
  const date = new Date(item.createdAt);
  const leftover = item.parts.find((part) => part < 1900);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="grid w-full grid-cols-[1fr_auto] items-start gap-x-6 gap-y-2 rounded-sm px-6 py-8 text-left transition-colors hover:bg-slip focus-visible:bg-slip"
    >
      <span className="min-w-0">
        <span className="block truncate text-lg">{item.upiId}</span>
        {item.name ? (
          <span className="mt-0.5 block truncate text-sm text-muted-foreground">
            {item.name}
          </span>
        ) : null}
      </span>
      <span className="text-right text-xl font-extrabold tabular-nums">
        ₹{formatDisplayAmount(item.total)}
      </span>
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <span>
          {date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
        <span>{`${item.parts.length} ${item.parts.length === 1 ? "scan" : "scans"}`}</span>
        {leftover != null && leftover !== item.total ? (
          <span>last ₹{formatDisplayAmount(leftover)}</span>
        ) : null}
      </span>
      <span className="min-w-[7rem] text-right">
        <span className="block text-sm tabular-nums text-muted-foreground">
          {paid}/{item.parts.length} paid
        </span>
        <span className="mt-1.5 block h-[3px] bg-ink/10">
          <span
            className="block h-full bg-paid"
            style={{
              width: `${item.parts.length ? (paid / item.parts.length) * 100 : 0}%`,
            }}
          />
        </span>
      </span>
    </button>
  );
}
