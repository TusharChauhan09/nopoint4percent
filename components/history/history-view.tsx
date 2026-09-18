import { HistoryRow } from "@/components/history/history-row";
import { formatDisplayAmount } from "@/lib/split";
import type { SplitRecord } from "@/lib/history";

type HistoryViewProps = {
  items: SplitRecord[];
  onOpen: (id: string) => void;
};

export function HistoryView({ items, onOpen }: HistoryViewProps) {
  const totalSent = items.reduce((sum, item) => sum + item.total, 0);
  const scans = items.reduce((sum, item) => sum + item.parts.length, 0);

  return (
    <section>
      <h1 className="mb-3 text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold tracking-tight">
        Past splits
      </h1>
      <p className="mb-8 text-muted-foreground">
        {items.length} ticket{items.length === 1 ? "" : "s"}
        <span className="mx-2 text-ink/20">/</span>
        {scans} scans
        <span className="mx-2 text-ink/20">/</span>
        ₹{formatDisplayAmount(totalSent)} in all
      </p>
      <ul className="-mx-2 sm:-mx-3">
        {items.map((item) => (
          <li key={item.id} className="border-b border-ink/10 last:border-b-0">
            <HistoryRow item={item} onOpen={() => onOpen(item.id)} />
          </li>
        ))}
      </ul>
    </section>
  );
}
