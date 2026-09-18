import { GithubMark } from "@/components/layout/github-mark";
import { GITHUB_URL } from "@/lib/github";

export function SiteFooter() {
  return (
    <footer className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-8 pb-2 text-sm text-muted-foreground">
      <p>Each QR is ₹1,900 or the leftover. Mark paid as you scan.</p>
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-ink underline-offset-4 hover:underline"
      >
        <GithubMark className="size-4" />
        GitHub
      </a>
    </footer>
  );
}
