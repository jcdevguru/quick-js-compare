import { defineUnionForType } from './util';

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

// Scalar types in ES2020+
const scalarTypeUnion = defineUnionForType(
  'string',
  'number',
  'boolean',
  'undefined',
  'bigint',
  'null',
  'Date'
);
export type ScalarType = typeof scalarTypeUnion.type[number];

const collectionTypeUnion = defineUnionForType('Array', 'Set', 'Map');
export type CollectionType = typeof collectionTypeUnion.type[number];

const keyedObjectTypeUnion = defineUnionForType('Array', 'Map', 'StdObject');
export type KeyedObjectType = typeof keyedObjectTypeUnion.type[number];

export type StdObjectType = 'StdObject';
export type ArrayType = 'Array';
export type SetType = 'Set';
export type MapType = 'Map';

const functionTypeUnion = defineUnionForType('function', 'Function');
export type FunctionType = typeof functionTypeUnion.type[number];

const indexedObjectTypeUnion = defineUnionForType('Array', 'Map', 'StdObject', ...functionTypeUnion.type);
export type IndexedObjectType = typeof indexedObjectTypeUnion.type[number];

const compositeTypeUnion = defineUnionForType(...[...collectionTypeUnion.type, ...keyedObjectTypeUnion.type, ...functionTypeUnion.type]);
export type CompositeType = typeof compositeTypeUnion.type[number];

export type SupportedType = ScalarType | CompositeType;

// Note 't' in argument should be return from 'actualType()', not value of 'typeof'

export const actualType = (v: unknown): string => {
  const t = typeof v as string;
  if (t === 'object') {
    if (!v) {
      return 'null';
    }
    let n = v?.constructor.name;
    if (n === 'Object') {
      n = 'StdObject';
    } else if (isSupportedType(n)) {
      return n;
    }
  }
  return t;
};

export const isScalarType = (v: string): v is ScalarType => scalarTypeUnion.is(v);
export const isStdObjectType   = (v: string): v is StdObjectType => v === 'StdObject';
export const isArrayType = (v: string): v is ArrayType => v === 'Array';
export const isSetType = (v: string): v is SetType => v === 'Set';
export const isMapType = (v: string): v is MapType => v === 'Map';
export const isKeyedObjectType = (v: string): v is KeyedObjectType => keyedObjectTypeUnion.is(v);
export const isIndexedObjectType = (v: string): v is IndexedObjectType => indexedObjectTypeUnion.is(v);
export const isCollectionType = (v: string): v is CollectionType => collectionTypeUnion.is(v);
export const isFunctionType = (v: string): v is FunctionType => functionTypeUnion.is(v);
export const isCompositeType = (v: string): v is CompositeType => compositeTypeUnion.is(v);
export const isSupportedType = (v: string): v is SupportedType => isScalarType(v) || isCompositeType(v);

export type MapKey = string | number | symbol;

export type StdObject = {
    [key: string]: Value;
};

export type Scalar = string | number | boolean | bigint | null | undefined | symbol | Date;
export type MapObject = Map<MapKey, Value>;
export type ArrayObject = Array<Value>;
export type SetObject = Set<Value>;
export type FunctionObject = (...args: unknown[]) => unknown;

// Contains multiple values, accessed via numeric index
export type IndexedObject = StdObject | MapObject | ArrayObject | FunctionObject;

// Contains multiple values, accessed via keys
export type KeyedObject = StdObject | MapObject | FunctionObject;

// Contains multiple values, can be accessed in groups
export type CollectionObject = ArrayObject | SetObject;

export type Composite = IndexedObject | KeyedObject | CollectionObject | FunctionObject | Iterable<Value>;

export type Value = Scalar | Composite;

export type Reference = Composite;

export type StdObjectEntry = [keyof StdObject, Value];

export const isScalar = (v: unknown): v is Scalar => isScalarType(actualType(v));
export const isStdObject = (v: unknown): v is StdObject => isStdObjectType(actualType(v));
export const isArrayObject = (v: unknown): v is ArrayObject => isArrayType(actualType(v));
export const isSetObject = (v: unknown): v is SetObject => isSetType(actualType(v));
export const isMapObject = (v: unknown): v is MapObject => isMapType(actualType(v));
export const isKeyedObject = (v: unknown): v is KeyedObject => isKeyedObjectType(actualType(v));
export const isCollection = (v: unknown): v is CollectionObject => isCollectionType(actualType(v));
export const isFunctionObject = (v: unknown): v is FunctionObject => isFunctionType(actualType(v));
export const isIndexedObject = (v: unknown): v is IndexedObject => isIndexedObjectType(actualType(v));
export const isComposite = (v: unknown): v is Composite => isCompositeType(actualType(v));
export const isReference = (v: unknown): v is Reference => isComposite(v);
export const isValue = (v: unknown): v is Value => isScalar(v) || isComposite(v);
export const isSupported = isValue;

export type RefSet = WeakSet<Composite>;
