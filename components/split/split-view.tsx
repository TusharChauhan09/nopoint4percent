import { PayCoupon } from "@/components/split/pay-coupon";
import { SplitHero } from "@/components/split/split-hero";
import type { SplitRecord } from "@/lib/history";

type SplitViewProps = {
  record: SplitRecord;
  onBack: () => void;
  onTogglePaid: (index: number, checked: boolean) => void;
};

export function SplitView({ record, onBack, onTogglePaid }: SplitViewProps) {
  const paidCount = record.paidFlags.filter(Boolean).length;
  const ordered = record.parts
    .map((amount, index) => ({
      amount,
      index,
      paid: record.paidFlags[index] ?? false,
    }))
    .sort((a, b) => Number(a.paid) - Number(b.paid));

  return (
    <section>
      <SplitHero record={record} paidCount={paidCount} onBack={onBack} />
      <div className="flex flex-col gap-3">
        {ordered.map((part) => (
          <PayCoupon
            key={`${record.id}-${part.index}`}
            upiId={record.upiId}
            name={record.name}
            amount={part.amount}
            index={part.index}
            totalParts={record.parts.length}
            checked={part.paid}
            onCheckedChange={(checked) => onTogglePaid(part.index, checked)}
          />
        ))}
      </div>
    </section>
  );
}
