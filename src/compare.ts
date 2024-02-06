import {
  actualType,
  type StdObject,
  type KeyCompareResult,
  type ObjCompareResult,
  type NonPrimitive,
  type ArraySegment,
} from './types';

export const comparePrimitivesStrict = (a: unknown, b: unknown) => a === b;
// eslint-disable-next-line eqeqeq
export const comparePrimitivesAbstract = (a: unknown, b: unknown) => a == b;

export const compareObjectsReference = (a: NonPrimitive, b: NonPrimitive) => a !== b;

// compareObject
// -------------

// option: keyOnly, keyValue
export const findUnmatchedKeyBlocks = (base: StdObject, comparator: StdObject): Array<ArraySegment> => {
  const comparatorKeySet = new Set(Object.keys(comparator));
  let addBucket = true;
  const rVal = Object.keys(base)
    .reduce((acc, k, idx) => {
      if (comparatorKeySet.has(k)) {
        addBucket = true;
        return acc;
      }
      if (addBucket) {
        acc.push([idx, 0]);
        addBucket = false;
      }
      acc[acc.length - 1][1] += 1;
      return acc;
    }, [] as Array<ArraySegment>);
  return rVal;
};

const blocksToKeys = (base: StdObject, blocks: Array<ArraySegment>): Array<string> => {
  const keys = Object.keys(base);
  return blocks.map(([index, len]) => keys.slice(index, index + len - 1)).flat();
};

export const compareKeysByName = (leftOp: StdObject, rightOp: StdObject): KeyCompareResult => {
  const left = blocksToKeys(leftOp, findUnmatchedKeyBlocks(leftOp, rightOp));
  const right = blocksToKeys(rightOp, findUnmatchedKeyBlocks(rightOp, leftOp));
  const status = !left.length && !right.length;
  return { left, right, status };
};

// option: keyOrder
// export const findUnmatchedKeys = (base: StdObject, comparator: StdObject): Array<string> => {
//   const unmatchedKeyBlocks = findUnmatchedKeyBlocks(base, comparator);

//   const baseKeys = Object.keys(base);
//   const comparatorKeys = Object.keys(comparator);
//   const result = [];
//   let baseIndex = 0;
//   let blockIndex = 0;

// };

// export const compareKeysByNameOrder = (leftOp: StdObject, rightOp: StdObject): KeyCompareResult => {
//   const left = findUnmatchedKeys(leftOp, rightOp);
//   const right = findUnmatchedKeys(rightOp, leftOp);
//   const status = !left.length && !right.length;
//   return { left, right, status };
// };

// option: keyValueOrder
export const compareObjects = (leftOp: StdObject, rightOp: StdObject): ObjCompareResult => {
  const keyComparison = compareKeysByNameOrder(leftOp, rightOp);
  const unmatchedRightKeySet = new Set(keyComparison.left);
  const unmatchedLeftKeySet = new Set(keyComparison.right);
  let { status } = keyComparison;

  const leftItr = Object.keys(leftOp)[Symbol.iterator]();
  const rightItr = Object.keys(rightOp)[Symbol.iterator]();

  let leftIteration = leftItr.next();
  let rightIteration = rightItr.next();
  let leftKey: string;
  let rightKey: string;

  const left: StdObject = {};
  const right: StdObject = {};

  while (!leftIteration.done && !rightIteration.done) {
    leftKey = leftIteration.value;
    rightKey = rightIteration.value;

    while (!leftIteration.done && unmatchedRightKeySet.has(leftKey)) {
      left[leftKey] = leftOp[leftKey];
      leftIteration = leftItr.next();
      if (!leftIteration.done) {
        leftKey = leftIteration.value;
      }
    }

    while (!rightIteration.done && unmatchedLeftKeySet.has(rightKey)) {
      right[rightKey] = rightOp[rightKey];
      rightIteration = rightItr.next();
      if (!rightIteration.done) {
        rightKey = rightIteration.value;
      }
    }

    if (!leftIteration.done && !rightIteration.done) {
      let matching = false;
      if (leftKey === rightKey) {
        const leftVal = leftOp[leftKey];
        const rightVal = rightOp[rightKey];

        matching = leftVal === rightVal;
        if (!matching) {
          switch (actualType(leftVal)) {
            case 'object':
              matching = compareObjects(leftVal as StdObject, rightVal as StdObject).status;
              break;
            default:
              // incomplete
              matching = false;
          }
        }
      }

      if (!matching) {
        left[leftKey] = leftOp[leftKey];
        right[rightKey] = rightOp[rightKey];
        status = false;
      }

      leftIteration = leftItr.next();
      rightIteration = rightItr.next();
    }
  }

  while (!leftIteration.done) {
    leftKey = leftIteration.value;
    left[leftKey] = leftOp[leftKey];
    leftIteration = leftItr.next();
  }

  while (!rightIteration.done) {
    rightKey = rightIteration.value;
    right[rightKey] = rightOp[rightKey];
    rightIteration = rightItr.next();
  }
  return { left, right, status };
};

// // option: keyValue
// export const findUnmatchedKeyValues = (base: StdObject, comparator: StdObject): StdObject => {
//   const unmatchedKeyBlocks = findUnmatchedKeyBlocks(base, comparator);
//   const baseKeys = Object.keys(base);
//   const comparatorKeys = Object.keys(comparator);
//   return [
//     ...baseKeys.filter((k, i) => k !== comparatorKeys[i]),
//     ...baseKeys.slice(comparatorKeys.length),
//   ];
// };
