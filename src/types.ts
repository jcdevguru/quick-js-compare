/* eslint-disable no-use-before-define */

// TypeScript declarations for transpilations
export type StdObject = Record<string, unknown>;

export type Primitive = string | number | boolean | undefined | null | symbol | bigint;
export type NonPrimitive = Exclude<unknown, Primitive>;
export type DiffValue = NonPrimitive | Primitive;
export type CompareElement = Primitive | NonPrimitive;

export interface CompareResult {
  left: DiffValue
  right: DiffValue
  status: boolean
}

export interface ObjCompareResult extends CompareResult {
  left: StdObject
  right: StdObject
}

export interface KeyCompareResult extends CompareResult {
  left: Array<string>
  right: Array<string>
}

export type CollectionType = Array<CompareElement> | Set<CompareElement>;

export type PrimitiveCompareFunction =
  (subject: Primitive, toCompareWith: Primitive, options?: AppOptions) => boolean;

export type ObjectCompareFunction =
  (subject: NonPrimitive, toCompareWith: NonPrimitive, options?: AppOptions) => CompareResult;

export type CollectionCompareFunction =
  (subject: CollectionType, toCompareWith: CollectionType, options?: AppOptions) => CompareResult;

export interface CompareOptions {
  compareValue: 'strict' | 'abstract' | 'ignore' | PrimitiveCompareFunction
  compareObject: 'reference' | 'keyValueOrder' | 'keyValue' | 'keyOrder' | 'keyOnly' | 'valueOnly' | 'ignore' | ObjectCompareFunction
  compareCollection: 'reference' | 'valueOrder' | 'valueOnly' | 'sizeOnly' | 'ignore' | CollectionCompareFunction
}

export type RenderFunction = (result: CompareResult) => unknown;

export interface RenderOptions {
  jsMapAsObject: boolean
  jsSetAsArray: boolean
  maxDepth: number
  includeSame: boolean
  debug: boolean
}

export type CompareFunction =
  (base: CompareElement, comparator: CompareElement) => CompareResult;

export interface AppOptions {
  compare: 'Strict' | 'Equivalent' | Partial<CompareOptions> | CompareFunction
  render: 'StatusOnly' | 'Standard' | Partial<RenderOptions> | RenderFunction
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
