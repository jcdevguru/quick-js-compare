import type {
  StdObjectEntry,
  StdObject,
  ReferenceObject,
} from '../lib/types';

import {
  typeIsReference,
  actualType,
  type Comparison,
} from './types';

// Utility methods for handling comparisons at runtime

export const valIsReference = (v: unknown): v is ReferenceObject => typeIsReference(actualType(v));

// // Remove and return all KeyIndexValues with index less than stopIndex
// // Assumes that the array is sorted by index in ascending order
// export const spliceKeyIndexValues = (kivs: KeyIndexValue[], stopIndex: number) : Array<KeyIndexValue> => {
//   const limit = kivs.findIndex(({ indexValue: { index } }) => index >= stopIndex);
//   const spliceLen = limit === -1 ? kivs.length + 1 : limit;
//   return kivs.splice(0, spliceLen);
// };

// Convert an array of sparse entries to a standard object
export const sparseEntriesToStdObject = (entries: Array<StdObjectEntry | undefined>): StdObject => {
  const condensedArray = Object.values(entries) as Array<StdObjectEntry>;
  return Object.fromEntries(condensedArray.map(
    ([s, v]: StdObjectEntry) => [s, (Array.isArray(v) ? sparseEntriesToStdObject(v as Array<StdObjectEntry>) : v)],
  ));
};

export const hasDifferences = (result: Partial<Comparison>): boolean =>
  Boolean(result.leftOnly) || Boolean(result.left) || Boolean(result.right) || Boolean(result.rightOnly);
