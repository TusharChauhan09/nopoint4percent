import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PayeeConfirmProps = {
  upiId: string;
  name: string;
  onNameChange: (value: string) => void;
  onConfirm: () => void;
  onChangePayee: () => void;
};

export function PayeeConfirm({
  upiId,
  name,
  onNameChange,
  onConfirm,
  onChangePayee,
}: PayeeConfirmProps) {
  return (
    <form
      className="flex max-w-xl flex-col gap-8"
      onSubmit={(e) => {
        e.preventDefault();
        onConfirm();
      }}
    >
      <div className="border-l-4 border-rupee bg-slip px-5 py-6">
        <p className="text-sm text-muted-foreground">Paying</p>
        <p className="mt-1 text-[clamp(1.8rem,5vw,2.6rem)] leading-tight font-extrabold tracking-tight">
          {name.trim() || upiId}
        </p>
        {name.trim() ? (
          <p className="mt-2 truncate text-muted-foreground">{upiId}</p>
        ) : null}
      </div>
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
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" className="h-12 rounded-sm px-6 text-base">
          Confirm this UPI
        </Button>
        <button
          type="button"
          onClick={onChangePayee}
          className="text-muted-foreground underline-offset-4 hover:text-ink hover:underline"
        >
          Scan or type another
        </button>
      </div>
    </form>
  );
}
