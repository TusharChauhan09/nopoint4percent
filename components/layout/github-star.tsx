import { GithubMark } from "@/components/layout/github-mark";

export function GithubStar() {
  return (
    <span
      className="inline-flex cursor-default items-center gap-2 rounded-sm border border-ink/12 bg-slip px-2.5 py-1.5 text-sm text-ink"
      aria-hidden
    >
      <GithubMark className="size-4" />
      <span>Star</span>
    </span>
  );
}
