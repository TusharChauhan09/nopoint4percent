"use client";

import { useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { buildUpiUri, formatDisplayAmount } from "@/lib/split";
import { cn } from "@/lib/utils";

function launchUpiApp(uri: string) {
  const android = /Android/i.test(navigator.userAgent);
  if (android) {
    const path = uri.replace(/^upi:\/\//i, "");
    window.location.assign(`intent://${path}#Intent;scheme=upi;end`);
    return;
  }
  window.location.assign(uri);
}

type PayCouponProps = {
  upiId: string;
  name?: string;
  amount: number;
  index: number;
  totalParts: number;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function PayCoupon({
  upiId,
  name,
  amount,
  index,
  totalParts,
  checked,
  onCheckedChange,
}: PayCouponProps) {
  const uri = useMemo(
    () => buildUpiUri({ upiId, name, amount }),
    [upiId, name, amount],
  );

  return (
    <article
      className={cn(
        "pay-coupon flex flex-col gap-4 py-5 pr-5 pl-7 sm:flex-row sm:items-center sm:gap-8",
        checked && "opacity-45",
      )}
    >
      <p className="w-10 shrink-0 text-sm tabular-nums text-muted-foreground">
        {index + 1}/{totalParts}
      </p>
      <div className="shrink-0 bg-slip p-2">
        <QRCodeSVG
          value={uri}
          size={112}
          bgColor="#FBFCFE"
          fgColor="#18202C"
          level="M"
          marginSize={1}
          title={`UPI QR ${index + 1} for ₹${formatDisplayAmount(amount)}`}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-3xl font-extrabold tabular-nums sm:text-4xl">
          ₹{formatDisplayAmount(amount)}
        </p>
        <Button
          type="button"
          size="sm"
          className="mt-3"
          onClick={() => launchUpiApp(uri)}
        >
          Pay ₹{formatDisplayAmount(amount)}
        </Button>
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <Checkbox
          checked={checked}
          onCheckedChange={(value) => onCheckedChange(value === true)}
        />
        Paid
      </label>
    </article>
  );
}
