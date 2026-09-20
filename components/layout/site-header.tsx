"use client";

import { GithubStar } from "@/components/layout/github-star";
import { Button } from "@/components/ui/button";

type SiteHeaderProps = {
  onPast?: () => void;
  onNew?: () => void;
  showPast?: boolean;
  showNew?: boolean;
};

export function SiteHeader({
  onPast,
  onNew,
  showPast,
  showNew,
}: SiteHeaderProps) {
  return (
    <header className="mb-12 flex items-center justify-between gap-4">
      <p className="text-[1.35rem] font-extrabold tracking-tight">
        nopoint4percent
      </p>
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
