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

// Add this type helper
export type SetToUnion<T> = T extends Set<infer U> ? U : never;

// -------------------------------------------------------------------------------------------------
// Types we support for comparison and rendering


// Scalar types in ES2020+, as string tokens.
// 'null' is excluded because 'typeof'
// returns 'object' on null value.
// supported types only here
const scalarTypes = new Set([
  'string',
  'number',
  'boolean',
  'undefined',
  'symbol',
  'bigint',
]);
export type Scalar = string | number | boolean | undefined | symbol | bigint;

// Works with [...]
const collectionTypes = new Set([
  'Array',
  'Set',
  'Map',
]);

// Has multiple retrievable through key
const keyedTypes = new Set([
  'StdObject',
  'Array',
  'Map',
]);

const referenceTypes = new Set([
  ...collectionTypes,
  ...keyedTypes,
] as const);

const objectTypes = new Set([
  ...referenceTypes,
  'String',
  'Number',
  'Boolean',
  'Symbol',
  'Map',
  'Set',
]);

const functionTypes = new Set([
  'Function',
  'function',
]);

const supportedTypes = new Set([
  ...scalarTypes,
  ...objectTypes,
]);

export type SupportedType = SetToUnion<typeof supportedTypes>;

// Note 't' in argument should be return from 'actualType()', not value of 'typeof'
export const typeIsSupported = (t: string): boolean => supportedTypes.has(t);
export const typeIsObject = (t: string): boolean => objectTypes.has(t);
export const typeIsGenericObject = (t: string): boolean => t === 'object';
export const typeIsScalar = (t: string) : boolean => scalarTypes.has(t);
export const typeIsStdObject = (t: string) : boolean => t === 'Object';
export const typeIsKeyedObject = (t: string) : boolean => keyedTypes.has(t);
export const typeIsFunction = (t: string) : boolean => functionTypes.has(t);
export const typeIsReference = (t: string) : boolean => referenceTypes.has(t);

export const actualType = (v: unknown): string => {
  const t = typeof v;
  switch (t) {
    case 'object':
    case 'function':
      return v?.constructor.name || t;
  }
  return t;
};

export type MapKey = string | number | symbol;

export type StdObject = {
    [key: string]: Value;
};

export type MapObject = Map<MapKey, Value>;
export type ArrayObject = Array<Value>;
export type SetObject = Set<Value>;

// Contains multiple values, accessed via numeric index
export type IndexedObject = StdObject | MapObject | ArrayObject;

// Contains multiple values, accessed via keys
export type KeyedObject = StdObject | MapObject;

// Contains multiple values, can be accessed in groups
export type CollectionObject = ArrayObject | SetObject;

export type Reference = IndexedObject | KeyedObject | CollectionObject;

export type Value = Scalar | Reference;

export type StdObjectEntry = [keyof StdObject, Value];

export type Status = boolean | undefined;

export const deriveType = (v: unknown): string => {
  let t = actualType(v);
  if (typeIsStdObject(t)) {
    t = 'StdObject';
  }

  if (!typeIsSupported(t)) {
    return 'UnsupportedType';
  }
  return t;
};
