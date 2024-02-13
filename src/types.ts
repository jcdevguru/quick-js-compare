/* eslint-disable no-use-before-define */

// TypeScript declarations for transpilations
export type StdObject = Record<string, unknown>;
export type MapObject = Map<unknown, unknown>;
export type SparseArray<T> = Array<T | undefined>;
export type KeyedObject = StdObject | MapObject;
export type Primitive = string | number | boolean | undefined | null | symbol | bigint;
export type NonPrimitive = StdObject | Set<unknown> | Map<unknown, unknown> | Array<unknown> | Date;
export type CompareItem = Primitive | NonPrimitive;
export type Collection = Array<CompareItem> | Set<CompareItem>;
export type ResultItem = Primitive | StdObject | Array<CompareItem>;

export type StdObjectEntry = [keyof StdObject, unknown];
export type StdObjectEntries = Array<StdObjectEntry>;
export type SparseStdObjectEntries = SparseArray<StdObjectEntry>;

export type CompareFunc<T> = (baseItem: T, otherItem: T, options?: AppOptions) => boolean;
export type PrimitiveCompareFunc = CompareFunc<Primitive>;
export type StdObjectCompareFunc = CompareFunc<StdObjectEntry>;
export type MapObjectCompareFunc = CompareFunc<MapObject>;
export type CollectionCompareFunc = CompareFunc<Collection>;

export interface CompareResult {
  left: ResultItem
  right: ResultItem
}

export interface StdObjectCompareResult extends CompareResult {
  left: StdObject,
  right: StdObject
}

export interface CompareOptions {
  compareValue: 'strict' | 'abstract' | 'ignore' | PrimitiveCompareFunc
  compareObject: 'reference' | 'keyValueOrder' | 'keyValue' | 'keyOrder' | 'keyOnly' | 'valueOnly' | 'ignore' | StdObjectCompareFunc
  compareCollection: 'reference' | 'valueOrder' | 'valueOnly' | 'sizeOnly' | 'ignore' | CollectionCompareFunc
}

export type RenderFunc = (result: CompareResult) => unknown;

export interface RenderOptions {
  jsMapAsObject: boolean
  jsSetAsArray: boolean
  maxDepth: number
  includeSame: boolean
  debug: boolean
}

export type SummaryCompareFunc =
  (baseItem: ResultItem, otherItem: ResultItem) => CompareResult;

export interface AppOptions {
  compare: 'Strict' | 'Equivalent' | Partial<CompareOptions> | SummaryCompareFunc
  render: 'StatusOnly' | 'Standard' | Partial<RenderOptions> | RenderFunc
}

// Methods for run-time handling of data types

// Primitive types in ES2020+ as string.
// 'null' is excluded because 'typeof'
// returns 'object' on null value.
const primitiveTypeOfs = new Set([
  'string',
  'number',
  'boolean',
  'undefined',
  'symbol',
  'bigint',
]);

const simpleTypeOfs = new Set([
  ...primitiveTypeOfs,
  'function',
]);

const isSimpleTypeOf = (t: string): boolean => simpleTypeOfs.has(t);

export const isSimpleType = (v: unknown): boolean => isSimpleTypeOf(typeof v);
export const isPrimitiveType = (v: unknown) : boolean => primitiveTypeOfs.has(typeof v);

export const actualType = (v: unknown): string => {
  const t = typeof v;
  return (isSimpleTypeOf(t) && t) || (!v && 'null') || v?.constructor.name || t;
};
