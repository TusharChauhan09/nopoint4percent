"use client";

import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Checkbox } from "@/components/ui/checkbox";
import { buildUpiUri, formatDisplayAmount } from "@/lib/split";
import { cn } from "@/lib/utils";

function isMobileUpiDevice() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

type PayTileProps = {
  upiId: string;
  name?: string;
  amount: number;
  index: number;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function PayTile({
  upiId,
  name,
  amount,
  index,
  checked,
  onCheckedChange,
}: PayTileProps) {
  const [copied, setCopied] = useState(false);
  const uri = useMemo(
    () => buildUpiUri({ upiId, name, amount }),
    [upiId, name, amount],
  );
  const mobile = isMobileUpiDevice();

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(uri);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article
      className={cn(
        "flex flex-col items-center gap-3 rounded-[1.35rem] border border-coral/90 p-4 transition-[opacity,border-color]",
        checked && "border-coral/40 opacity-45",
      )}
    >
      <p className="tabular-nums text-xl text-paper">
        ₹{formatDisplayAmount(amount)}
      </p>
      <div className="rounded-2xl bg-paper p-3">
        <QRCodeSVG
          value={uri}
          size={148}
          bgColor="#F4EDE4"
          fgColor="#0C0B0A"
          level="M"
          marginSize={2}
          title={`UPI QR ${index + 1} for ₹${formatDisplayAmount(amount)}`}
        />
      </div>
      {mobile ? (
        <a
          href={uri}
          className="text-sm text-coral underline-offset-4 hover:underline"
        >
          Pay in UPI
        </a>
      ) : (
        <button
          type="button"
          onClick={copyLink}
          className="text-sm text-coral underline-offset-4 hover:underline"
        >
          {copied ? "Copied" : "Copy UPI link"}
        </button>
      )}
      <label className="flex cursor-pointer items-center gap-2 text-sm text-dust">
        <Checkbox
          checked={checked}
          onCheckedChange={(value) => onCheckedChange(value === true)}
        />
        I paid this one
      </label>
    </article>
  );
}
