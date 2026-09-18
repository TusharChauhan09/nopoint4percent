import type { ReactNode } from "react";

export function PageCanvas({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-[920px] flex-1 flex-col px-5 py-6 sm:px-8 sm:py-10">
        {children}
      </div>
    </div>
  );
}
