import test from 'ava';
import {serialize, deserialize} from './index.js';

test('serialize preserves name', t => {
	const error = new Error('test');
	const serialized = serialize(error);
	t.is(serialized.name, 'Error');
});

test('serialize preserves message', t => {
	const error = new Error('test message');
	const serialized = serialize(error);
	t.is(serialized.message, 'test message');
});

test('serialize preserves stack', t => {
	const error = new Error('test');
	const serialized = serialize(error);
	t.is(typeof serialized.stack, 'string');
	t.true(serialized.stack.length > 0);
});

test('serialize preserves code', t => {
	const error = new Error('test');
	error.code = 'ERR_TEST';
	const serialized = serialize(error);
	t.is(serialized.code, 'ERR_TEST');
});

test('serialize omits code when not present', t => {
	const error = new Error('test');
	const serialized = serialize(error);
	t.false('code' in serialized);
});

test('serialize preserves custom properties', t => {
	const error = new Error('test');
	error.statusCode = 404;
	error.path = '/api/users';
	const serialized = serialize(error);
	t.is(serialized.statusCode, 404);
	t.is(serialized.path, '/api/users');
});

test('serialize handles TypeError', t => {
	const error = new TypeError('invalid type');
	const serialized = serialize(error);
	t.is(serialized.name, 'TypeError');
	t.is(serialized.message, 'invalid type');
});

test('serialize handles cause chain', t => {
	const cause = new Error('root cause');
	const error = new Error('wrapper', {cause});
	const serialized = serialize(error);
	t.is(serialized.cause.name, 'Error');
	t.is(serialized.cause.message, 'root cause');
});

test('serialize handles deeply nested cause chain', t => {
	const root = new Error('root');
	const middle = new Error('middle', {cause: root});
	const top = new Error('top', {cause: middle});
	const serialized = serialize(top);
	t.is(serialized.cause.cause.message, 'root');
});

test('serialize returns non-Error values as-is', t => {
	t.is(serialize('string'), 'string');
	t.is(serialize(42), 42);
	t.is(serialize(null), null);
	t.is(serialize(undefined), undefined);
	t.deepEqual(serialize({key: 'value'}), {key: 'value'});
});

test('deserialize reconstructs Error', t => {
	const error = deserialize({name: 'Error', message: 'test'});
	t.true(error instanceof Error);
	t.is(error.message, 'test');
});

test('deserialize reconstructs TypeError', t => {
	const error = deserialize({name: 'TypeError', message: 'invalid'});
	t.true(error instanceof TypeError);
	t.is(error.message, 'invalid');
});

test('deserialize reconstructs RangeError', t => {
	const error = deserialize({name: 'RangeError', message: 'out of range'});
	t.true(error instanceof RangeError);
});

test('deserialize reconstructs ReferenceError', t => {
	const error = deserialize({name: 'ReferenceError', message: 'not defined'});
	t.true(error instanceof ReferenceError);
});

test('deserialize reconstructs SyntaxError', t => {
	const error = deserialize({name: 'SyntaxError', message: 'unexpected'});
	t.true(error instanceof SyntaxError);
});

test('deserialize restores stack', t => {
	const original = new Error('test');
	const serialized = serialize(original);
	const deserialized = deserialize(serialized);
	t.is(deserialized.stack, original.stack);
});

test('deserialize restores code', t => {
	const error = deserialize({name: 'Error', message: 'test', code: 'ERR_TEST'});
	t.is(error.code, 'ERR_TEST');
});

test('deserialize restores custom properties', t => {
	const error = deserialize({
		name: 'Error',
		message: 'test',
		statusCode: 500,
		path: '/api',
	});
	t.is(error.statusCode, 500);
	t.is(error.path, '/api');
});

test('deserialize handles cause chain', t => {
	const serialized = {
		name: 'Error',
		message: 'wrapper',
		cause: {
			name: 'TypeError',
			message: 'root cause',
		},
	};
	const error = deserialize(serialized);
	t.true(error.cause instanceof TypeError);
	t.is(error.cause.message, 'root cause');
});

test('deserialize returns non-error objects as-is', t => {
	t.is(deserialize('string'), 'string');
	t.is(deserialize(42), 42);
	t.is(deserialize(null), null);
	t.is(deserialize(undefined), undefined);
});

test('deserialize returns object without name as-is', t => {
	const result = deserialize({message: 'no name'});
	t.deepEqual(result, {message: 'no name'});
});

test('deserialize returns object without message as-is', t => {
	const result = deserialize({name: 'Error'});
	t.deepEqual(result, {name: 'Error'});
});

test('round-trip preserves error data', t => {
	const original = new TypeError('test error');
	original.code = 'ERR_CODE';
	original.custom = 'data';

	const deserialized = deserialize(serialize(original));
	t.is(deserialized.name, 'TypeError');
	t.is(deserialized.message, 'test error');
	t.is(deserialized.code, 'ERR_CODE');
	t.is(deserialized.custom, 'data');
	t.true(deserialized instanceof TypeError);
});

test('round-trip preserves cause chain', t => {
	const cause = new RangeError('out of range');
	const error = new Error('wrapper', {cause});

	const deserialized = deserialize(serialize(error));
	t.is(deserialized.message, 'wrapper');
	t.true(deserialized.cause instanceof RangeError);
	t.is(deserialized.cause.message, 'out of range');
});

test('unknown error name falls back to Error', t => {
	const error = deserialize({name: 'CustomError', message: 'custom'});
	t.true(error instanceof Error);
	t.is(error.message, 'custom');
});

test('serialized result is JSON-serializable', t => {
	const error = new Error('test');
	error.code = 'ERR_TEST';
	const serialized = serialize(error);
	const json = JSON.stringify(serialized);
	const parsed = JSON.parse(json);
	t.is(parsed.name, 'Error');
	t.is(parsed.message, 'test');
	t.is(parsed.code, 'ERR_TEST');
});
