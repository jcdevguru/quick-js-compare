// Utility methods

// Returns args together in an array, if not already so
// toArray(1, 2, 3) -> [1, 2, 3]
// toArray(['a', 'b', 'c']) -> ['a', 'b', 'c']
// toArray(['a'], 1, 'one') -> [['a'], 1, 'one']
// toArray() -> []
export const toArray = (...v: Array<unknown>) => [...v].flat();

// True when argument represents non-null 'Record' object.
// Will be false with an array, set, map, etc.
export const isStandardObject = (v: unknown): v is Record<string, unknown> => v?.constructor.name === 'Object';


export const verifyObject = (
  obj: unknown,
  validators: Record<string, (v: unknown) => boolean>,
  skipUndefined: boolean,
  errs?: Array<string>,
): boolean => {
  if (!isStandardObject(obj)) {
    return false;
  }
  const objKeys = Object.keys(obj);
  const validKeySet = new Set(Object.keys(validators));
  const unknownKeys = objKeys.filter((k) => !validKeySet.has(k));

  if (unknownKeys.length) {
    errs?.push(...unknownKeys.map((k) => `property ${k} unknown`));
    return false;
  }

  if (!objKeys.length) {
    errs?.push(`need at least one of ${[...validKeySet].join(', ')}`);
    return false;
  }

  const invalidSettings = Object.entries(validators).reduce((acc, [setting, check]) => {
    if (skipUndefined && obj[setting] === undefined) {
      return acc;
    }
    if (!check(obj[setting])) {
      return [...acc, setting];
    }
    return acc;
  }, [] as Array<string>);

  if (invalidSettings.length) {
    errs?.push(...invalidSettings.map((s) => `field ${s} has invalid value`));
    return false;
  }

  return true;
};
