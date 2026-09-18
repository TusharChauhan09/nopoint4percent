"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidUpiId, parseAmount } from "@/lib/split";

type CreateFormProps = {
  defaultName?: string;
  onCreate: (input: { upiId: string; name?: string; total: number }) => void;
};

export function CreateForm({ defaultName = "", onCreate }: CreateFormProps) {
  const [upiId, setUpiId] = useState("");
  const [name, setName] = useState(defaultName);
  const [upiLocked, setUpiLocked] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const upiOk = isValidUpiId(upiId);
  const parsed = parseAmount(amount);

  function lockUpi(e: React.FormEvent) {
    e.preventDefault();
    if (!upiOk) {
      setError("Enter a UPI ID like name@okaxis");
      return;
    }
    setError("");
    setUpiLocked(true);
  }

  function makeSplit(e: React.FormEvent) {
    e.preventDefault();
    if (!upiOk) {
      setError("Enter a UPI ID like name@okaxis");
      return;
    }
    if (parsed == null) {
      setError("Enter an amount greater than 0");
      return;
    }
    setError("");
    onCreate({
      upiId,
      name: name.trim() || undefined,
      total: parsed,
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-8">
      <form onSubmit={lockUpi} className="space-y-3">
        <Input
          value={upiId}
          onChange={(e) => {
            setUpiId(e.target.value);
            setUpiLocked(false);
          }}
          placeholder="Add UPI ID"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={Boolean(error) && !upiOk}
          className="h-12 rounded-2xl border-coral/70 bg-transparent px-4 text-base text-paper placeholder:text-dust md:text-base"
        />
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Payee name (optional)"
          autoComplete="name"
          className="h-12 rounded-2xl border-coral/40 bg-transparent px-4 text-base text-paper placeholder:text-dust md:text-base"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!upiOk}
            className="h-11 rounded-2xl px-6 text-base"
          >
            Create
          </Button>
        </div>
      </form>

      {upiLocked ? (
        <form onSubmit={makeSplit} className="space-y-3">
          <Input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            inputMode="decimal"
            autoFocus
            aria-invalid={Boolean(error) && parsed == null}
            className="h-12 rounded-2xl border-coral/70 bg-transparent px-4 text-base tabular-nums text-paper placeholder:text-dust md:text-base"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={parsed == null}
              className="h-11 rounded-2xl px-6 text-base"
            >
              Make QRs
            </Button>
          </div>
        </form>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
