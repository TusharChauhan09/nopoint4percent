import { GithubMark } from "@/components/layout/github-mark";

export function SiteFooter() {
  return (
    <footer className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-8 pb-2 text-sm text-muted-foreground">
      <p>Scan their UPI, confirm, then pay each slip. Mark paid as you go.</p>
      <span
        className="inline-flex cursor-default items-center gap-2 text-ink"
        aria-hidden
      >
        <GithubMark className="size-4" />
        GitHub
      </span>
    </footer>
  );
}
