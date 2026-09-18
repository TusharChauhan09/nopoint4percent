import { formatDisplayAmount } from "@/lib/split";
import { PaidTrack } from "@/components/split/paid-track";
import type { SplitRecord } from "@/lib/history";

type SplitHeroProps = {
  record: SplitRecord;
  paidCount: number;
  onBack: () => void;
};

export function SplitHero({ record, paidCount, onBack }: SplitHeroProps) {
  return (
    <div className="mb-10">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 text-sm text-muted-foreground underline-offset-4 hover:text-ink hover:underline"
      >
        Back
      </button>
      <p className="truncate text-muted-foreground">{record.upiId}</p>
      {record.name ? (
        <p className="text-muted-foreground">{record.name}</p>
      ) : null}
      <p className="mt-2 text-[clamp(3rem,10vw,6rem)] leading-none font-extrabold tracking-tight tabular-nums">
        ₹{formatDisplayAmount(record.total)}
      </p>
      <PaidTrack paid={paidCount} total={record.parts.length} />
    </div>
  );
}
