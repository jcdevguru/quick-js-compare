import type {
  Scalar,
  MapObject,
  Value,
  StdObject,
} from '../lib/types';

import { type Option } from '../lib/option';

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
  ...scalarTypes,
  ...objectTypes,
]);

export type SupportedType = (typeof supportedTypes extends Set<infer T> ? T : never);

export type ScalarType = (typeof scalarTypes extends Set<infer T> ? T : never);
export type ReferenceType = (typeof referenceTypes extends Set<infer T> ? T : never);

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
  return scalarTypes.has(t) ? t : (v?.constructor.name || t);
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

export interface CompareFunc {
  (left: Value, right: Value, options: Option): ComparisonResult;
};

export interface ComparedItem {
  typeName: SupportedType,
  value: Value,
  comparisonResult?: ComparisonResult,
};

export interface IndexedItem extends ComparedItem {
  index: number
};

export interface KeyedObjectItem<K extends Scalar> extends IndexedItem {
  key: K
};

export type StdObjectItem = KeyedObjectItem<keyof StdObject>;
export type MapObjectItem = KeyedObjectItem<keyof MapObject>;
export type ArrayObjectItem = IndexedItem;

export interface Comparison<T extends ComparedItem = ComparedItem> {
  leftOnly: Array<T>,
  left: Array<T>,
  leftSame: Array<T>,
  rightSame: Array<T>,
  right: Array<T>,
  rightOnly: Array<T>,
};

// Returned from .compare()
export type ComparisonResult = Partial<Comparison>;

// type of .compare()