"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app-shell";
import { CreateForm } from "@/components/create-form";
import { HistoryList } from "@/components/history-list";
import { PayTile } from "@/components/pay-tile";
import {
  createSplit,
  loadNickname,
  loadSplits,
  saveNickname,
  upsertSplit,
  type SplitRecord,
} from "@/lib/history";
import { formatDisplayAmount } from "@/lib/split";

type View = "create" | "history" | "tiles";

export function App() {
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<View>("create");
  const [splits, setSplits] = useState<SplitRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");

  useMemo(() => {
    // hydrate once on client without an extra effect flash for SSR markup
  }, []);

  if (typeof window !== "undefined" && !ready) {
    const stored = loadSplits();
    const nick = loadNickname();
    setSplits(stored);
    setNickname(nick);
    setView(stored.length ? "history" : "create");
    setReady(true);
  }

  const active = splits.find((row) => row.id === activeId) ?? null;
  const paidCount = active?.paidFlags.filter(Boolean).length ?? 0;
  const displayName = active?.name || nickname || "nopoint4percent";

  function handleCreate(input: {
    upiId: string;
    name?: string;
    total: number;
  }) {
    if (input.name) {
      saveNickname(input.name);
      setNickname(input.name);
    }
    const record = createSplit(input);
    setSplits((prev) => upsertSplit(prev, record));
    setActiveId(record.id);
    setView("tiles");
  }

  function togglePaid(index: number, checked: boolean) {
    if (!active) return;
    const next: SplitRecord = {
      ...active,
      paidFlags: active.paidFlags.map((flag, i) =>
        i === index ? checked : flag,
      ),
    };
    setSplits((prev) => upsertSplit(prev, next));
  }

  const orderedParts = active
    ? active.parts
        .map((amount, index) => ({
          amount,
          index,
          paid: active.paidFlags[index] ?? false,
        }))
        .sort((a, b) => Number(a.paid) - Number(b.paid))
    : [];

  const shellActions =
    view === "history" ? (
      <Button
        type="button"
        onClick={() => setView("create")}
        className="h-10 rounded-2xl px-5"
      >
        Create
      </Button>
    ) : view === "tiles" && active ? (
      <p className="rounded-2xl border border-coral px-3 py-2 text-sm tabular-nums text-coral">
        {paidCount} of {active.parts.length}
      </p>
    ) : splits.length > 0 ? (
      <Button
        type="button"
        variant="outline"
        onClick={() => setView("history")}
        className="h-10 rounded-2xl border-coral px-4 text-coral"
      >
        History
      </Button>
    ) : null;

  return (
    <AppShell
      name={view === "create" ? "first time" : displayName}
      initial={displayName}
      actions={shellActions}
    >
      {view === "create" ? (
        <CreateForm defaultName={nickname} onCreate={handleCreate} />
      ) : null}

      {view === "history" ? (
        <HistoryList
          items={splits}
          onOpen={(id) => {
            setActiveId(id);
            setView("tiles");
          }}
        />
      ) : null}

      {view === "tiles" && active ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="truncate text-dust">{active.upiId}</p>
              <p className="tabular-nums text-2xl text-paper">
                ₹{formatDisplayAmount(active.total)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setView(splits.length ? "history" : "create")}
              className="text-sm text-coral underline-offset-4 hover:underline"
            >
              Back
            </button>
          </div>
          <div className="sticky top-0 z-10 -mx-1 bg-ink/90 px-1 py-2 backdrop-blur-sm sm:hidden">
            <p className="text-sm tabular-nums text-coral">
              {paidCount} of {active.parts.length} paid
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {orderedParts.map((part) => (
              <PayTile
                key={`${active.id}-${part.index}`}
                upiId={active.upiId}
                name={active.name}
                amount={part.amount}
                index={part.index}
                checked={part.paid}
                onCheckedChange={(checked) => togglePaid(part.index, checked)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
