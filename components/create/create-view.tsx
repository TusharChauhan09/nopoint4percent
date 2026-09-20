"use client";

import { useState } from "react";
import Image from "next/image";
import { AmountFields } from "@/components/create/amount-fields";
import { PayeeConfirm } from "@/components/create/payee-confirm";
import { QrScanner } from "@/components/create/qr-scanner";
import { UpiFields } from "@/components/create/upi-fields";
import { isValidUpiId, parseAmount } from "@/lib/split";
import { parseUpiQr } from "@/lib/upi-qr";

type CreateViewProps = {
  defaultName?: string;
  onCreate: (input: { upiId: string; name?: string; total: number }) => void;
};

type Step = "payee" | "scan" | "confirm" | "amount";

export function CreateView({ defaultName = "", onCreate }: CreateViewProps) {
  const [step, setStep] = useState<Step>("payee");
  const [upiId, setUpiId] = useState("");
  const [name, setName] = useState(defaultName);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  function applyPayee(nextUpi: string, nextName?: string) {
    setUpiId(nextUpi);
    if (nextName) setName(nextName);
    setError("");
    setStep("confirm");
  }

  function continueUpi() {
    if (!isValidUpiId(upiId)) {
      setError("Use a UPI ID like name@okaxis");
      return;
    }
    applyPayee(upiId.trim());
  }

  function handleScan(payload: string) {
    const parsed = parseUpiQr(payload);
    if (!parsed) return false;
    if (parsed.amount != null) setAmount(String(parsed.amount));
    applyPayee(parsed.upiId, parsed.name);
    return true;
  }

  function split() {
    if (!isValidUpiId(upiId)) {
      setError("Use a UPI ID like name@okaxis");
      setStep("payee");
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
          Scan, confirm, then split under ₹1,900
        </h1>
        <p className="mb-12 max-w-md text-lg leading-relaxed text-muted-foreground">
          Point at their UPI QR, check the name, enter the amount, and pay from
          the small slips.
        </p>
        {step === "scan" ? (
          <QrScanner onDetect={handleScan} onClose={() => setStep("payee")} />
        ) : null}
        {step === "payee" ? (
          <div className="flex max-w-xl flex-col gap-10">
            <button
              type="button"
              onClick={() => {
                setError("");
                setStep("scan");
              }}
              className="flex min-h-28 items-center justify-between gap-4 bg-ink px-6 py-5 text-left text-slip"
            >
              <span>
                <span className="block text-xl font-extrabold tracking-tight">
                  Scan UPI QR
                </span>
                <span className="mt-1 block text-sm text-slip/70">
                  Camera or a photo of their code
                </span>
              </span>
              <span className="grid size-12 place-items-center overflow-hidden border border-slip/40 bg-white p-1.5">
                <Image
                  src="/QR_Code_Example.svg"
                  alt="Example UPI QR code"
                  width={36}
                  height={36}
                  className="size-full object-contain"
                />
              </span>
            </button>
            <div className="flex flex-col gap-6">
              <p className="text-sm text-muted-foreground">Or type the UPI ID</p>
              <UpiFields
                upiId={upiId}
                name={name}
                error={error}
                onUpiIdChange={(value) => {
                  setUpiId(value);
                }}
                onNameChange={setName}
                onContinue={continueUpi}
              />
            </div>
          </div>
        ) : null}
        {step === "confirm" ? (
          <PayeeConfirm
            upiId={upiId}
            name={name}
            onNameChange={setName}
            onConfirm={() => {
              setError("");
              setStep("amount");
            }}
            onChangePayee={() => setStep("payee")}
          />
        ) : null}
        {step === "amount" ? (
          <div className="flex max-w-xl flex-col gap-8">
            <p className="text-muted-foreground">
              Amount for {name.trim() || upiId}
            </p>
            <AmountFields
              amount={amount}
              error={error}
              onAmountChange={setAmount}
              onSplit={split}
            />
          </div>
        ) : null}
      </div>
      <ol className="mt-16 grid gap-6 text-sm text-muted-foreground sm:grid-cols-3">
        <li>
          <p className="font-medium text-ink">Scan</p>
          <p className="mt-1 leading-relaxed">
            Their UPI QR, or type the ID if you already have it.
          </p>
        </li>
        <li>
          <p className="font-medium text-ink">Confirm</p>
          <p className="mt-1 leading-relaxed">
            Check the name and UPI before you enter rupees.
          </p>
        </li>
        <li>
          <p className="font-medium text-ink">Slips</p>
          <p className="mt-1 leading-relaxed">
            We cut the total into ₹1,900 scans plus leftover.
          </p>
        </li>
      </ol>
    </section>
  );
}
