"use client";

import { useEffect, useState } from "react";
import { CreateView } from "@/components/create/create-view";
import { HistoryView } from "@/components/history/history-view";
import { PageCanvas } from "@/components/layout/page-canvas";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SplitView } from "@/components/split/split-view";
import {
  createSplit,
  loadNickname,
  loadSplits,
  saveNickname,
  upsertSplit,
  type SplitRecord,
} from "@/lib/history";
import { totalAvoidedFee } from "@/lib/split";

type View = "create" | "history" | "tiles";

export function App() {
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<View>("create");
  const [splits, setSplits] = useState<SplitRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    const stored = loadSplits();
    setSplits(stored);
    setNickname(loadNickname());
    setView(stored.length ? "history" : "create");
    setReady(true);
  }, []);

  const active = splits.find((row) => row.id === activeId) ?? null;
  const saved = totalAvoidedFee(splits.map((row) => row.total));

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

  return (
    <PageCanvas>
      <SiteHeader
        saved={saved}
        showPast={view !== "history" && splits.length > 0}
        showNew={view !== "create"}
        onPast={() => setView("history")}
        onNew={() => setView("create")}
      />
      {!ready ? (
        <p className="text-muted-foreground">Loading</p>
      ) : view === "create" ? (
        <CreateView defaultName={nickname} onCreate={handleCreate} />
      ) : view === "history" ? (
        <HistoryView
          items={splits}
          onNew={() => setView("create")}
          onOpen={(id) => {
            setActiveId(id);
            setView("tiles");
          }}
        />
      ) : active ? (
        <SplitView
          record={active}
          onBack={() => setView(splits.length ? "history" : "create")}
          onTogglePaid={togglePaid}
        />
      ) : null}
      <SiteFooter />
    </PageCanvas>
  );
}
