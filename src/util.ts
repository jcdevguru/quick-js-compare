// Utility types
// An array-like type (tuple) that must contain exactly N elements
// e.g.,
// type TupleOf<int, 4> -> [int, int, int, int]
export type TupleOf<T, N extends number, A extends unknown[] = []> = A extends { length: N } ? A : TupleOf<T, N, [...A, T]>;

// Generic type for any object that matches an enum
export type EnumLike<T> = Record<string | number | symbol, T>;

// Generic type for any object that requires one of an element
export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> & Partial<Omit<T, K>> }> = Partial<T> & U[keyof U];

// Generic type for non-empty array
export type NonEmptyArray<T> = [T, ...T[]];

// Utility methods

// Returns args together in an array, if not already so
// toArray(1, 2, 3) -> [1, 2, 3]
// toArray(['a', 'b', 'c']) -> ['a', 'b', 'c']
// toArray(['a'], 1, 'one') -> [['a'], 1, 'one']
// toArray() -> []
export const toArray = (...v: Array<unknown>) => [...v].flat();

// Tests if item is an enum element - e.g.,
//   enum foo { a, b };
//   isEnumMember('a', foo) -> true
//   isEnumMember('c', foo) -> false
// Caution: this implementation will match on number as index
// unless explicit mappings assigned, e.g.,
//   enum bar { a = 'a', b = 'b' };
//   isEnumMember(1, foo) -> true   // corresponds with 'b'
//   isEnumMember(1, bar) -> false  // no integer mapping
export const isEnumMember = <E>(
  value: unknown, enumArg: EnumLike<E>,
): value is E => (Object.values(enumArg) as unknown[]).includes(value);

// True when argument represents non-null 'Record' object.
// Will be false with an array, set, map, etc.
export const isStandardObject = (v: unknown): v is object => v?.constructor.name === 'Object';

// Type and exception-safe conversions of any JS value to a string, if conversion
// is natural.  Will not show data contained in objects. Allows fallback for
// more sophisticated mappings.  When all else fails, return empty string.
export const anyToString = (v: unknown, fallback?: (v: unknown) => string): string => {
  let s;
  try {
    s = v?.constructor.name || `${v}`;
  } catch (err) {
    if (fallback) {
      s = fallback(v);
    }
  } finally {
    if (typeof s !== 'string') {
      s = '';
    }
  }
  return s;
};
