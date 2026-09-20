import assert from "node:assert/strict";
import { parseUpiQr } from "./upi-qr";

assert.deepEqual(parseUpiQr("shop@okaxis"), { upiId: "shop@okaxis" });

assert.deepEqual(
  parseUpiQr("upi://pay?pa=merchant@ybl&pn=Tea%20Stall&am=2021&cu=INR"),
  { upiId: "merchant@ybl", name: "Tea Stall", amount: 2021 },
);

assert.deepEqual(
  parseUpiQr("UPI://PAY?PA=cafe@okhdfcbank&PN=Cafe+Morn"),
  { upiId: "cafe@okhdfcbank", name: "Cafe Morn" },
);

assert.deepEqual(
  parseUpiQr(
    "intent://pay?pa=ravi@oksbi&pn=Ravi&cu=INR#Intent;scheme=upi;end",
  ),
  { upiId: "ravi@oksbi", name: "Ravi" },
);

assert.equal(parseUpiQr("not a qr"), null);
assert.equal(parseUpiQr("upi://pay?pn=OnlyName"), null);

console.log("parseUpiQr tests passed");
