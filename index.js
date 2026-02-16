const errorConstructors = {
	Error,
	TypeError,
	RangeError,
	ReferenceError,
	SyntaxError,
	URIError,
	EvalError,
};

function getErrorConstructor(name) {
	return errorConstructors[name] ?? Error;
}

export function serialize(error) {
	if (!(error instanceof Error)) {
		return error;
	}

	const serialized = {
		name: error.name,
		message: error.message,
		stack: error.stack,
	};

	if (error.code !== undefined) {
		serialized.code = error.code;
	}

	if (error.cause !== undefined) {
		serialized.cause = serialize(error.cause);
	}

	for (const key of Object.keys(error)) {
		if (!(key in serialized)) {
			serialized[key] = error[key];
		}
	}

	return serialized;
}

export function deserialize(object) {
	if (typeof object !== 'object' || object === null || !object.name || !object.message) {
		return object;
	}

	const ErrorConstructor = getErrorConstructor(object.name);
	const error = new ErrorConstructor(object.message);

	if (object.stack !== undefined) {
		error.stack = object.stack;
	}

	if (object.code !== undefined) {
		error.code = object.code;
	}

	if (object.cause !== undefined) {
		error.cause = deserialize(object.cause);
	}

	for (const key of Object.keys(object)) {
		if (!['name', 'message', 'stack', 'code', 'cause'].includes(key)) {
			error[key] = object[key];
		}
	}

	return error;
}
