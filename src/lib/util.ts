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

export const validateObject = (
  obj: unknown,
  validators: Record<string, (v: unknown) => boolean>,
  minNumberOfKeys: number = 0,
): boolean => {
  if (!isStandardObject(obj)) {
    return false;
  }

  const objKeys = Object.keys(obj);
  const validKeySet = new Set(Object.keys(validators));
  const unknownKeys = objKeys.filter((k) => !validKeySet.has(k));

  if (unknownKeys.length) {
    throw new Error(`property ${unknownKeys.join(',')} unknown`);
  }

  if (objKeys.length < minNumberOfKeys) {
    throw new Error(`need at least ${minNumberOfKeys} of ${[...validKeySet].join(',')}`);
  }

  const invalidSettings = Object.entries(validators).reduce((acc: Array<string>, [setting, check]) => {
    if (obj[setting] === undefined) {
      return acc;
    }
    if (!check(obj[setting])) {
      return [...acc, setting];
    }
    return acc;
  }, []);

  if (invalidSettings.length) {
    throw new Error(`fields ${invalidSettings.join(',')} contain invalid values`);
  }

  return true;
};

export const validateMinimalObject = (
  obj: unknown,
  validators: Record<string, (v: unknown) => boolean>
) => validateObject(obj, validators, 1);

// Helper function to define the union and type guard with caching
export const defineUnionForType = <T extends string[]>(...values: T) => {
  const set = new Set(values);
  return {
    type: values,
    is: (value: string): value is T[number] => set.has(value),
  } as { type: T; is: (value: string) => value is T[number] };
};
