import test from "ava";
import { deserialize, serialize } from "./index.js";

test("custom error names survive a JSON round trip", (t) => {
  const original = new Error("custom");
  original.name = "ApplicationError";
  t.is(
    deserialize(JSON.parse(JSON.stringify(serialize(original)))).name,
    "ApplicationError"
  );
});

test("constructor-table prototype names fall back to real Errors", (t) => {
  for (const name of [
    "__proto__",
    "constructor",
    "toString",
    "hasOwnProperty",
  ]) {
    const error = deserialize({ message: "example", name });
    t.true(error instanceof Error);
    t.is(error.name, name);
    t.is(error.message, "example");
  }
});

test("custom prototype-named properties remain own data through serialization", (t) => {
  const original = new Error("custom properties");
  for (const key of ["__proto__", "constructor", "toString"]) {
    Object.defineProperty(original, key, {
      configurable: true,
      enumerable: true,
      value: { custom: key },
      writable: true,
    });
  }
  const serialized = serialize(original);
  const restored = deserialize(JSON.parse(JSON.stringify(serialized)));
  t.is(Object.getPrototypeOf(serialized), Object.prototype);
  t.is(Object.getPrototypeOf(restored), Error.prototype);
  for (const key of ["__proto__", "constructor", "toString"]) {
    t.true(Object.hasOwn(serialized, key));
    t.true(Object.hasOwn(restored, key));
    t.deepEqual(restored[key], { custom: key });
  }
});

test("untrusted __proto__ input cannot change the reconstructed Error prototype", (t) => {
  const restored = deserialize(
    JSON.parse(
      '{"name":"TypeError","message":"example","__proto__":{"injected":true}}'
    )
  );
  t.is(Object.getPrototypeOf(restored), TypeError.prototype);
  t.true(restored instanceof TypeError);
  t.false(Object.hasOwn(restored, "injected"));
  t.true(Object.hasOwn(restored, "__proto__"));
});
