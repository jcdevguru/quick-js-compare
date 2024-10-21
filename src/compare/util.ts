import {
  type ComparisonResult,
  type Status,
  type ComparisonResultArray,
  type Value,
  type KeyIndexValue,
  type StdObjectEntry,
  type StdObject,
  type ReferenceObject,
  type ComparisonResultObject,
  ComparisonResultArrayIndex,
} from './types';

// Utility methods for handling comparisons at runtime

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
  'Object',
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

export const valIsReference = (v: unknown): v is ReferenceObject => typeIsReference(actualType(v));

export const createComparisonResult = (
  status: Status,
  {
    diff, same,
  } : Partial<{ diff: ComparisonResultObject, same: ComparisonResultObject }> = {},
): ComparisonResult => {
  const {
    Left, LeftSame, RightSame, Right,
  } = ComparisonResultArrayIndex;
  const result = new Array<Value>(4) as ComparisonResultArray;
  if (diff) {
    result[Left] = diff.left;
    result[Right] = diff.right;
  }
  if (same) {
    result[LeftSame] = same.left;
    result[RightSame] = same.right;
  }
  return { result, status };
};

export const spliceKeyIndexValues = (kivs: KeyIndexValue[], stopIndex: number) : Array<KeyIndexValue> => {
  const limit = kivs.findIndex(({ indexValue: { index } }) => index >= stopIndex);
  const spliceLen = limit === -1 ? kivs.length + 1 : limit;
  return kivs.splice(0, spliceLen);
};

export const sparseEntriesToStdObject = (entries: Array<StdObjectEntry | undefined>): StdObject => {
  const condensedArray = Object.values(entries) as Array<StdObjectEntry>;
  return Object.fromEntries(condensedArray.map(
    ([s, v]: StdObjectEntry) => [s, (Array.isArray(v) ? sparseEntriesToStdObject(v as Array<StdObjectEntry>) : v)],
  ));
};
