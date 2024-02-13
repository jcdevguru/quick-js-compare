import {
  type StdObject,
  type NonPrimitive,
  type StdObjectCompareFunc,
  type CompareResult,
  type StdObjectCompareResult,
  type StdObjectEntry,
  type SparseStdObjectEntries,
  type StdObjectEntries,
} from './types';

export const comparePrimitivesStrict = (a: unknown, b: unknown) => a === b;
// eslint-disable-next-line eqeqeq
export const comparePrimitivesAbstract = (a: unknown, b: unknown) => a == b;

export const compareObjectsReference = (a: NonPrimitive, b: NonPrimitive) => a !== b;

// compareObject
// -------------

// option: keyOnly, keyValue

export const indexesToUnmatchedByKey = (baseItem: StdObjectEntries, otherItem: StdObjectEntries): Array<number> => {
  const otherKeySet = new Set(Object.keys(otherItem));
  return Object.keys(baseItem).reduce((arr, k, i) => (otherKeySet.has(k) ? arr : [...arr, i]), [] as Array<number>);
};

export const unmatchedKeys = (baseItem: StdObjectEntries, otherItem: StdObjectEntries): Array<string> => {
  const otherKeySet = new Set(Object.keys(otherItem));
  return Object.keys(baseItem).filter(otherKeySet.has);
};

export const defaultCompareKeys = (leftItems: StdObjectEntries, rightItems: StdObjectEntries): CompareResult => {
  const left = unmatchedKeys(leftItems, rightItems);
  const right = unmatchedKeys(rightItems, leftItems);
  return { left, right };
};

export const compareKey = (baseEntry: StdObjectEntry, otherEntry: StdObjectEntry) => baseEntry[0] === otherEntry[0];
export const compareValue = (baseEntry: StdObjectEntry, otherEntry: StdObjectEntry) => baseEntry[1] === otherEntry[1];

// option: keyOrder, keyValueOrder, ValueOrder
export const compareStdObject = (leftItem: StdObject, rightItem: StdObject, ignoreDistinctKeys: boolean, comparers: Array<StdObjectCompareFunc>): StdObjectCompareResult => {
  const leftEntries = Object.entries(leftItem);
  const rightEntries = Object.entries(rightItem);
  const stop = Math.min(leftEntries.length, rightEntries.length);
  leftEntries.slice()
};

// option: keyOrder
export const compareKeysInOrder = (leftOp: StdObjectEntries, rightOp: StdObjectEntries): CompareResult => {
  const { left, right } = compareStdObject(leftOp, rightOp, [compareKey]);
  return { left: Object.keys(left), right: Object.keys(right) };
};

// option: keyValueOrder
export const compareKeyValuesInOrder = (leftOp: StdObjectEntries, rightOp: StdObjectEntries): CompareResult => {
  const { left, right } = compareStdObject(leftOp, rightOp, [compareKey, compareValue]);
  return { left, right };
};

// // // // option: keyValue
// // export const findUnmatchedKeyValues = (baseItem: StdObject, otherItem: StdObject): StdObject => {
// //   const unmatchedKeyBlocks = findUnmatchedKeyBlocks(baseItem, otherItem);
// //   const baseKeys = Object.keys(baseItem);
// //   const comparatorKeys = Object.keys(otherItem);
// //   return [
// //     ...baseKeys.filter((k, i) => k !== comparatorKeys[i]),
// //     ...baseKeys.slice(comparatorKeys.length),
// //   ];
// // };
