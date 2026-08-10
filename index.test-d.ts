import { expectError, expectType } from "tsd";
import { deserialize, type SerializedError, serialize } from "./index.js";

const serialized = serialize(new Error("test"));
expectType<SerializedError>(serialized);

const deserialized = deserialize({ message: "test", name: "Error" });
expectType<Error>(deserialized);

const unknown_ = serialize("not an error");
expectType<unknown>(unknown_);

const unknownDeser = deserialize("not an object");
expectType<unknown>(unknownDeser);

expectError(serialize());
