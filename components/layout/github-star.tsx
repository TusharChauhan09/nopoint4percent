"use client";

import { useEffect, useState } from "react";
import { GithubMark } from "@/components/layout/github-mark";
import { GITHUB_API, GITHUB_URL } from "@/lib/github";

export function GithubStar() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(GITHUB_API)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { stargazers_count?: number } | null) => {
        if (cancelled) return;
        if (typeof data?.stargazers_count === "number") {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <a
      href={GITHUB_URL}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-sm border border-ink/12 bg-slip px-2.5 py-1.5 text-sm text-ink no-underline hover:border-rupee/40 hover:bg-white"
      aria-label="Star nopoint4percent on GitHub"
    >
      <GithubMark className="size-4" />
      <span>Star</span>
      {stars != null ? (
        <span className="tabular-nums text-muted-foreground">{stars}</span>
      ) : null}
    </a>
  );
}
