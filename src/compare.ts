import {
  actualType,
  type StdObject,
  type KeyCompareResult,
  type ObjCompareResult,
  type NonPrimitive,
} from './types';

export const comparePrimitivesStrict = (a: unknown, b: unknown) => a === b;
// eslint-disable-next-line eqeqeq
export const comparePrimitivesAbstract = (a: unknown, b: unknown) => a == b;

export const compareObjectsReference = (a: NonPrimitive, b: NonPrimitive) => a !== b;

// compareObject
// -------------
const sparseIndexes = (arr: Array<unknown>) => Object
  .values(arr.map((v, i, a) => (v === undefined ? a[i] : i)) as Array<number>);

// option: keyOnly, keyValue
export const findMissingKeys = (base: StdObject, comparator: StdObject): Array<string> => {
  const comparatorKeySet = new Set(Object.keys(comparator));
  return Object.keys(base).map((v, i, arr) => (comparatorKeySet.has(v) ? arr[i] : v));
};

export const compareKeysByName = (leftOp: StdObject, rightOp: StdObject): KeyCompareResult => {
  const left = Object.values(findMissingKeys(leftOp, rightOp));
  const right = Object.values(findMissingKeys(rightOp, leftOp));
  const status = !left.length && !right.length;
  return { left, right, status };
};

// option: keyOrder
export const findUnmatchedKeys = (base: StdObject, comparator: StdObject): Array<string> => {
  const unmatchedKeys = findMissingKeys(base, comparator);
  const indicesToCompare = sparseIndexes(unmatchedKeys);
  const baseKeys = Object.keys(base);
  const comparatorKeys = Object.keys(comparator);
  let ci = 0;
  indicesToCompare.every((baseIndex) => {
    if (ci >= comparatorKeys.length) {
      return false;
    }
    const baseKey = baseKeys[baseIndex];
    if (baseKey !== comparatorKeys[ci]) {
      unmatchedKeys[baseIndex] = baseKey;
    }
    ci += 1;
    return true;
  });
  return unmatchedKeys;
};

export const compareKeysByNameOrder = (leftOp: StdObject, rightOp: StdObject): KeyCompareResult => {
  const left = Object.values(findUnmatchedKeys(leftOp, rightOp));
  const right = Object.values(findUnmatchedKeys(rightOp, leftOp));
  const status = !left.length && !right.length;
  return { left, right, status };
};

// option: keyValueOrder
// export const compareObjects = (leftOp: StdObject, rightOp: StdObject): ObjCompareResult => {
//   const leftUnmatched = findUnmatchedKeys(leftOp, rightOp);
//   const rightUnmatched = findUnmatchedKeys(rightOp, leftOp);
//   const leftIndices = sparseIndexes(leftUnmatched);
//   const rightIndices = sparseIndexes(rightUnmatched);
//   return { left, right, status };
// };

// // // // option: keyValue
// // export const findUnmatchedKeyValues = (base: StdObject, comparator: StdObject): StdObject => {
// //   const unmatchedKeyBlocks = findUnmatchedKeyBlocks(base, comparator);
// //   const baseKeys = Object.keys(base);
// //   const comparatorKeys = Object.keys(comparator);
// //   return [
// //     ...baseKeys.filter((k, i) => k !== comparatorKeys[i]),
// //     ...baseKeys.slice(comparatorKeys.length),
// //   ];
// // };
