import type {
  Primitive,
  StdObjectEntry,
  MapObject,
  SetObject,
  Value,
  StdObject,
} from '../lib/types';

import { type Option } from '../lib/option';

// Primitive types in ES2020+ as string.
// 'null' is excluded because 'typeof'
// returns 'object' on null value.
// supported types only here
const primitiveTypes = new Set([
  'string',
  'number',
  'boolean',
  'undefined',
  'symbol',
  'bigint',
]);

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
]);

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
  ...primitiveTypes,
  ...objectTypes,
]);

export type SupportedType = (typeof supportedTypes extends Set<infer T> ? T : never);

// Note 't' in argument should be return from 'actualType()', not value of 'typeof'
export const typeIsSupported = (t: string): boolean => supportedTypes.has(t);
export const typeIsObject = (t: string): boolean => objectTypes.has(t);
export const typeIsGenericObject = (t: string): boolean => t === 'object';
export const typeIsPrimitive = (t: string) : boolean => primitiveTypes.has(t);
export const typeIsStdObject = (t: string) : boolean => t === 'Object';
export const typeIsKeyedObject = (t: string) : boolean => keyedTypes.has(t);
export const typeIsFunction = (t: string) : boolean => functionTypes.has(t);
export const typeIsReference = (t: string) : boolean => referenceTypes.has(t);

export const actualType = (v: unknown): string => {
  const t = typeof v;
  return primitiveTypes.has(t) ? t : (v?.constructor.name || t);
};

const unsupportedType = 'UnsupportedType';

export type UnsupportedType = typeof unsupportedType;

export const deriveValueType = (v: unknown): string => {
  let t = actualType(v);
  if (typeIsStdObject(t)) {
    t = 'StdObject';
  }

  if (!typeIsSupported(t)) {
    return unsupportedType;
  }
  return t;
};

export type PrimitiveCompareFunc = CompareFunc<Primitive>;
export type StdObjectCompareFunc = CompareFunc<StdObjectEntry>;
export type MapObjectCompareFunc = CompareFunc<MapObject>;
export type SetObjectCompareFunc = CompareFunc<SetObject>;

export interface Comparison<T extends Value = Value> {
  leftOnly: T,
  left: T,
  leftSame: T,
  rightSame: T,
  right: T,
  rightOnly: T,
}

export type ComparisonResult<T extends Value = Value> = Partial<Comparison<T>>;

export interface CompareFunc<T extends Value = Value> {
  (left: T, right: T, options: Option): ComparisonResult<T>;
}

// for objects with enumerable values
export interface IndexValue {
  index: number
  value: Value
}

export interface KeyIndexValue {
  key: string
  indexValue: IndexValue
}

export interface IndexValueCompareOp {
  key: string
  leftIndexValue: IndexValue
  rightIndexValue: IndexValue
}

