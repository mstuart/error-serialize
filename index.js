const errorConstructors = {
  Error,
  EvalError,
  RangeError,
  ReferenceError,
  SyntaxError,
  TypeError,
  URIError,
};

function getErrorConstructor(name) {
  return Object.hasOwn(errorConstructors, name)
    ? errorConstructors[name]
    : Error;
}

export function serialize(error) {
  if (!(error instanceof Error)) {
    return error;
  }

  const serialized = {
    message: error.message,
    name: error.name,
    stack: error.stack,
  };

  if (error.code !== undefined) {
    serialized.code = error.code;
  }

  if (error.cause !== undefined) {
    serialized.cause = serialize(error.cause);
  }

  for (const key of Object.keys(error)) {
    if (!Object.hasOwn(serialized, key)) {
      Object.defineProperty(serialized, key, {
        configurable: true,
        enumerable: true,
        value: error[key],
        writable: true,
      });
    }
  }

  return serialized;
}

export function deserialize(object) {
  if (
    typeof object !== "object" ||
    object === null ||
    typeof object.name !== "string" ||
    typeof object.message !== "string"
  ) {
    return object;
  }

  const ErrorConstructor = getErrorConstructor(object.name);
  const error = new ErrorConstructor(object.message);
  if (error.name !== object.name) {
    Object.defineProperty(error, "name", {
      configurable: true,
      value: object.name,
      writable: true,
    });
  }

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
    if (!["name", "message", "stack", "code", "cause"].includes(key)) {
      Object.defineProperty(error, key, {
        configurable: true,
        enumerable: true,
        value: object[key],
        writable: true,
      });
    }
  }

  return error;
}
