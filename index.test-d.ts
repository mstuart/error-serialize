import {expectType, expectError} from 'tsd';
import {serialize, deserialize, type SerializedError} from './index.js';

const serialized = serialize(new Error('test'));
expectType<SerializedError>(serialized);

const deserialized = deserialize({name: 'Error', message: 'test'});
expectType<Error>(deserialized);

const unknown_ = serialize('not an error');
expectType<unknown>(unknown_);

const unknownDeser = deserialize('not an object');
expectType<unknown>(unknownDeser);

expectError(serialize());
