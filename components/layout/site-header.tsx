import { GithubStar } from "@/components/layout/github-star";

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
      <nav className="flex items-center gap-4 text-[0.95rem] sm:gap-5">
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
          <button
            type="button"
            onClick={onNew}
            className="text-rupee underline-offset-4 hover:underline"
          >
            New split
          </button>
        ) : null}
        <GithubStar />
      </nav>
    </header>
  );
}
