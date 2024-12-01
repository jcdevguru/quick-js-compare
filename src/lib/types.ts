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

// -------------------------------------------------------------------------------------------------
// Types we support for comparison and rendering
type ValueBase = NonNullable<unknown>;

export type Primitive = ValueBase & (string | number | boolean | undefined | symbol | bigint | null | undefined);
export type MapKey = ValueBase & (string | number | symbol);

export type StdObject = Record<string, ValueBase>;
export type MapObject = Map<MapKey, ValueBase>;
export type ArrayObject = Array<ValueBase>;
export type SetObject = Set<ValueBase>;

// Contains multiple values, accessed via numeric index
export type IndexedObject = StdObject | MapObject | ArrayObject;

// Contains multiple values, accessed via keys
export type KeyedObject = StdObject | MapObject;

// Contains multiple values, can be accessed in groups
export type CollectionObject = ArrayObject | SetObject;

export type ReferenceObject = IndexedObject | KeyedObject | CollectionObject;

export type Value = ValueBase & (Primitive | ReferenceObject);

export type StdObjectEntry = [keyof StdObject, Value];

export type Status = boolean | undefined;
