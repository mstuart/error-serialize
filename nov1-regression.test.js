import test from "ava";
import { deserialize, serialize } from "./index.js";

test("round-trips AggregateError member errors and non-Error reasons", (t) => {
  const error = new AggregateError(
    [
      new TypeError("first"),
      42,
      new Error("last", { cause: new RangeError("root") }),
    ],
    "batch",
    { cause: new Error("outer") }
  );
  const encoded = serialize(error);
  t.is(encoded.errors[0].name, "TypeError");
  const restored = deserialize(JSON.parse(JSON.stringify(encoded)));
  t.true(restored instanceof AggregateError);
  t.true(restored.errors[0] instanceof TypeError);
  t.is(restored.errors[1], 42);
  t.true(restored.errors[2].cause instanceof RangeError);
  t.true(restored.cause instanceof Error);
  t.is(restored.message, "batch");
});
