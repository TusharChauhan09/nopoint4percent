import assert from "node:assert/strict";
import { splitAmount } from "./split";

assert.deepEqual(splitAmount(1900), [1900]);
assert.deepEqual(splitAmount(1899), [1899]);
assert.deepEqual(splitAmount(2000), [1900, 100]);
assert.deepEqual(splitAmount(2021), [1900, 121]);
assert.deepEqual(splitAmount(10000), [1900, 1900, 1900, 1900, 1900, 500]);

const forty = splitAmount(40000);
assert.equal(forty.length, 22);
assert.deepEqual(forty.slice(0, 21), Array(21).fill(1900));
assert.equal(forty[21], 100);
assert.equal(forty.reduce((a, b) => a + b, 0), 40000);

assert.deepEqual(splitAmount(0), []);
assert.deepEqual(splitAmount(-10), []);

console.log("splitAmount tests passed");
