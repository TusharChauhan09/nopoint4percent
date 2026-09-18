"use client";

import { useState } from "react";
import { AmountFields } from "@/components/create/amount-fields";
import { UpiFields } from "@/components/create/upi-fields";
import { isValidUpiId, parseAmount } from "@/lib/split";

type CreateViewProps = {
  defaultName?: string;
  onCreate: (input: { upiId: string; name?: string; total: number }) => void;
};

export function CreateView({ defaultName = "", onCreate }: CreateViewProps) {
  const [upiId, setUpiId] = useState("");
  const [name, setName] = useState(defaultName);
  const [upiReady, setUpiReady] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  function continueUpi() {
    if (!isValidUpiId(upiId)) {
      setError("Use a UPI ID like name@okaxis");
      return;
    }
    setError("");
    setUpiReady(true);
  }

  function split() {
    if (!isValidUpiId(upiId)) {
      setError("Use a UPI ID like name@okaxis");
      return;
    }
    const parsed = parseAmount(amount);
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
    <section className="flex flex-1 flex-col pb-10">
      <div className="flex flex-1 flex-col justify-center">
        <h1 className="mb-3 max-w-lg text-[clamp(2.4rem,7vw,4.4rem)] leading-[0.95] font-extrabold tracking-tight">
          Send it in pieces under ₹1,900
        </h1>
        <p className="mb-12 max-w-md text-lg leading-relaxed text-muted-foreground">
          Each scan opens UPI with the amount already filled. Mark a piece when
          you have paid it.
        </p>
        {!upiReady ? (
          <UpiFields
            upiId={upiId}
            name={name}
            error={error}
            onUpiIdChange={(value) => {
              setUpiId(value);
              setUpiReady(false);
            }}
            onNameChange={setName}
            onContinue={continueUpi}
          />
        ) : (
          <AmountFields
            amount={amount}
            error={error}
            onAmountChange={setAmount}
            onSplit={split}
          />
        )}
      </div>
      <ol className="mt-16 grid gap-6 text-sm text-muted-foreground sm:grid-cols-3">
        <li>
          <p className="font-medium text-ink">UPI ID</p>
          <p className="mt-1 leading-relaxed">Who should receive the money.</p>
        </li>
        <li>
          <p className="font-medium text-ink">Amount</p>
          <p className="mt-1 leading-relaxed">
            We break it into ₹1,900 scans plus leftover.
          </p>
        </li>
        <li>
          <p className="font-medium text-ink">Pay</p>
          <p className="mt-1 leading-relaxed">
            Scan or open UPI. Tick Paid after each piece.
          </p>
        </li>
      </ol>
    </section>
  );
}
