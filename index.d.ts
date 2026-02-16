export type SerializedError = {
	[key: string]: unknown;
	name: string;
	message: string;
	stack?: string;
	code?: string;
	cause?: SerializedError;
};

/**
Serialize an Error object to a plain object, preserving cause chains and custom properties.

@param error - The Error object to serialize.
@returns A plain object representation of the error, or the input as-is if not an Error.

@example
```
import {serialize} from 'error-serialize';

const error = new TypeError('Invalid input');
error.code = 'ERR_INVALID';

serialize(error);
//=> {name: 'TypeError', message: 'Invalid input', stack: '...', code: 'ERR_INVALID'}
```
*/
export function serialize(error: Error): SerializedError;
export function serialize(error: unknown): unknown;

/**
Deserialize a plain object back into an Error instance, reconstructing cause chains and custom properties.

@param object - The plain object to deserialize.
@returns A reconstructed Error instance, or the input as-is if not a valid error object.

@example
```
import {deserialize} from 'error-serialize';

const error = deserialize({
	name: 'TypeError',
	message: 'Invalid input',
	stack: '...',
});

error instanceof TypeError;
//=> true
```
*/
export function deserialize(object: SerializedError): Error;
export function deserialize(object: unknown): unknown;
