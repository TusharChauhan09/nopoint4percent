"use client";

import { GithubStar } from "@/components/layout/github-star";
import { Button } from "@/components/ui/button";
import { formatDisplayAmount } from "@/lib/split";

type SiteHeaderProps = {
  saved: number;
  onPast?: () => void;
  onNew?: () => void;
  showPast?: boolean;
  showNew?: boolean;
};

export function SiteHeader({
  saved,
  onPast,
  onNew,
  showPast,
  showNew,
}: SiteHeaderProps) {
  return (
    <header className="mb-12 flex items-start justify-between gap-4">
      <div>
        <p className="text-[1.35rem] font-extrabold tracking-tight">
          nopoint4percent
        </p>
        <p className="mt-1 text-sm tabular-nums text-paid">
          ₹{formatDisplayAmount(saved)} saved
        </p>
      </div>
      <nav className="flex items-center gap-3 text-[0.95rem] sm:gap-4">
        {showPast ? (
          <button
            type="button"
            onClick={onPast}
            className="text-muted-foreground underline-offset-4 hover:text-ink hover:underline"
          >
            Past
          </button>
        ) : null}
        {showNew ? (
          <Button
            type="button"
            onClick={onNew}
            className="h-10 rounded-sm px-4 text-sm"
          >
            New split
          </Button>
        ) : null}
        <GithubStar />
      </nav>
    </header>
  );
}
