import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { isValidUpiId } from "@/lib/split";

type UpiFieldsProps = {
  upiId: string;
  name: string;
  error?: string;
  onUpiIdChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onContinue: () => void;
};

export function UpiFields({
  upiId,
  name,
  error,
  onUpiIdChange,
  onNameChange,
  onContinue,
}: UpiFieldsProps) {
  const valid = isValidUpiId(upiId);

  return (
    <form
      className="flex max-w-xl flex-col gap-8"
      onSubmit={(e) => {
        e.preventDefault();
        onContinue();
      }}
    >
      <label className="block">
        <span className="mb-3 block text-muted-foreground">UPI ID</span>
        <Input
          value={upiId}
          onChange={(e) => onUpiIdChange(e.target.value)}
          placeholder="name@okaxis"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={Boolean(error) && !valid}
          className="h-14 rounded-none border-0 border-b-2 border-ink/20 bg-transparent px-0 text-2xl shadow-none placeholder:text-ink/25 focus-visible:border-rupee focus-visible:ring-0 md:text-2xl dark:bg-transparent"
        />
      </label>
      <label className="block">
        <span className="mb-3 block text-muted-foreground">
          Name on the payment (optional)
        </span>
        <Input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Who should receive this"
          autoComplete="name"
          className="h-12 rounded-none border-0 border-b border-ink/15 bg-transparent px-0 text-lg shadow-none placeholder:text-ink/25 focus-visible:border-rupee focus-visible:ring-0 md:text-lg dark:bg-transparent"
        />
      </label>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div>
        <Button
          type="submit"
          disabled={!valid}
          className="h-12 rounded-sm px-6 text-base"
        >
          Use this ID
        </Button>
      </div>
    </form>
  );
}
