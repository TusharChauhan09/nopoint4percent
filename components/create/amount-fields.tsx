import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { parseAmount } from "@/lib/split";

type AmountFieldsProps = {
  amount: string;
  error?: string;
  onAmountChange: (value: string) => void;
  onSplit: () => void;
};

export function AmountFields({
  amount,
  error,
  onAmountChange,
  onSplit,
}: AmountFieldsProps) {
  const parsed = parseAmount(amount);

  return (
    <form
      className="flex max-w-xl flex-col gap-8"
      onSubmit={(e) => {
        e.preventDefault();
        onSplit();
      }}
    >
      <label className="block">
        <span className="mb-3 block text-muted-foreground">Rupees to send</span>
        <div className="flex items-baseline gap-2 border-b-2 border-ink/20 focus-within:border-rupee">
          <span className="text-3xl font-extrabold text-rupee">₹</span>
          <Input
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="2021"
            inputMode="decimal"
            autoFocus
            aria-invalid={Boolean(error) && parsed == null}
            className="h-16 rounded-none border-0 bg-transparent px-0 text-4xl font-extrabold tabular-nums shadow-none placeholder:text-ink/20 focus-visible:ring-0 md:text-5xl dark:bg-transparent"
          />
        </div>
      </label>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div>
        <Button
          type="submit"
          disabled={parsed == null}
          className="h-12 rounded-sm px-6 text-base"
        >
          Make payment slips
        </Button>
      </div>
    </form>
  );
}
