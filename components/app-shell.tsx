import { cn } from "@/lib/utils";

type AppShellProps = {
  name: string;
  initial?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function AppShell({ name, initial, actions, children }: AppShellProps) {
  const letter = (initial || name || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="flex min-h-dvh flex-col bg-ink px-3 py-4 sm:px-6 sm:py-8">
      <p className="font-display mb-4 text-center text-2xl text-paper/70 italic sm:text-3xl">
        {name}
      </p>
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col rounded-[2rem] border border-coral p-3 sm:p-5">
        <div className="mb-3 flex items-center gap-3 px-1 sm:px-2">
          <p className="font-display min-w-0 flex-1 truncate text-lg text-coral italic">
            {name}
          </p>
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
          <div
            aria-hidden
            className="grid size-11 shrink-0 place-items-center rounded-full border border-coral text-sm text-coral"
          >
            {letter}
          </div>
        </div>
        <div
          className={cn(
            "flex flex-1 flex-col rounded-[1.6rem] border border-coral/80 p-4 sm:p-6",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
