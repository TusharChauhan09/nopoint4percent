"use client";

import { formatDisplayAmount } from "@/lib/split";
import type { SplitRecord } from "@/lib/history";

type HistoryListProps = {
  items: SplitRecord[];
  onOpen: (id: string) => void;
};

export function HistoryList({ items, onOpen }: HistoryListProps) {
  return (
    <div className="flex flex-col gap-6">
      <p className="font-display text-3xl text-paper/80 italic">history</p>
      <ul className="flex flex-col gap-3">
        {items.map((row) => {
          const date = new Date(row.createdAt);
          const paid = row.paidFlags.filter(Boolean).length;
          return (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => onOpen(row.id)}
                className="flex w-full items-center justify-between gap-4 rounded-full border border-coral px-5 py-4 text-left transition-colors hover:bg-coral/10 focus-visible:ring-3 focus-visible:ring-coral/40"
              >
                <span className="min-w-0 truncate text-paper">
                  {row.upiId}{" "}
                  <span className="tabular-nums">
                    ₹{formatDisplayAmount(row.total)}
                  </span>
                </span>
                <span className="shrink-0 text-sm text-dust">
                  {date.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  {paid > 0 ? ` · ${paid}/${row.parts.length}` : ""}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
