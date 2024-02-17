/* eslint-disable no-console */
import type {
  CompareItem,
  CompareResult,
  StdObject,
  StdObjectEntry,
} from './base-types';

import {
  typeIsPrimitive,
  actualType,
  typeIsStdObject,
  typeIsSupported,
} from './compare-utils';

interface IndexValue {
  index: number
  value: CompareItem
}

interface KeyIndexValue {
  key: string
  indexValue: IndexValue
}

interface IndexValueCompareOp {
  key: string
  leftIndexValue: IndexValue
  rightIndexValue: IndexValue
}

interface KeyIndexValueCompareResult extends CompareResult {
  left: Array<KeyIndexValue>
  right: Array<KeyIndexValue>
  same: Array<IndexValueCompareOp>
}

interface RefSets {
  left: Set<CompareItem>
  right: Set<CompareItem>
}

// compareOnMatchedKeysOnly`: true

const compareResult = (left: CompareItem, right: CompareItem, same?: CompareItem): CompareResult => ({
  left,
  right,
  ...(same && { same }),
});

const matchResult = compareResult(null, null);
const isMatching = ({ left, right }: CompareResult) => left === null && right === null;

const stdObjectReducer = (keySet: Set<string>, item: StdObject) => (acc: Array<KeyIndexValue>, key: string, index: number) => {
  if (!keySet.has(key)) {
    acc.push({ key, indexValue: { index, value: item[key] as CompareItem } });
  }
  return acc;
};

export const compareStdObjectsByKey = (leftItem: StdObject, rightItem: StdObject): KeyIndexValueCompareResult => {
  const leftKeys = Object.keys(leftItem);
  const rightKeys = Object.keys(rightItem);
  const rightKeyMap = new Map(rightKeys.map((k, i) => [k, i]));
  const sameKeySet = new Set(leftKeys.filter((k) => rightKeyMap.has(k)));

  const same = leftKeys.reduce((acc, key, leftIndex) => {
    const rightIndex = rightKeyMap.get(key);
    if (rightIndex !== undefined) {
      acc.push({
        key,
        leftIndexValue: { index: leftIndex, value: leftItem[key] as CompareItem },
        rightIndexValue: { index: rightIndex, value: rightItem[key] as CompareItem },
      });
    }
    return acc;
  }, [] as Array<IndexValueCompareOp>);

  const left = leftKeys.reduce(stdObjectReducer(sameKeySet, leftItem), []);
  const right = rightKeys.reduce(stdObjectReducer(sameKeySet, rightItem), []);

  return { left, right, same };
};

const kiv2soe = ({ key, indexValue: { value } }: KeyIndexValue): StdObjectEntry => [key, value];

const spliceFrom = (source: Array<KeyIndexValue>, toIndex: number): Array<KeyIndexValue> => {
  const limit = source.findIndex(({ indexValue: { index } }) => index >= toIndex);
  const spliceLen = limit === -1 ? source.length + 1 : limit;
  return source.splice(0, spliceLen);
};

export const mkComparer = () => {
  const refSets: RefSets = {
    left: new Set<CompareItem>(),
    right: new Set<CompareItem>(),
  };

  const generalCompare = (leftItem: CompareItem, rightItem: CompareItem) : CompareResult => {
    // always check for strict match
    if (leftItem === rightItem) {
      return matchResult;
    }

    const leftType = actualType(leftItem);
    const rightType = actualType(rightItem);

    // if we can't support the comparison, don't try
    if (!typeIsSupported(leftType) || !typeIsSupported(rightType)) {
      return matchResult;
    }

    if (typeIsPrimitive(leftType) && typeIsPrimitive(rightType)) {
      // "general": abstract == true
      // eslint-disable-next-line eqeqeq
      if (leftItem == rightItem) {
        return matchResult;
      }
      return compareResult(leftItem, rightItem);
    }

    // mismatched types with at least one non-primitive values
    if (leftType !== rightType) {
      return compareResult(leftItem, rightItem);
    }

    if (!typeIsPrimitive(leftType)) {
      refSets.left.add(leftItem);
    }

    if (!typeIsPrimitive(rightType)) {
      refSets.right.add(rightItem);
    }

    const result = matchResult;

    if (typeIsStdObject(leftType)) {
      // assumed both are StdObject because we won't get here if types do not match
      const leftEntries: Array<StdObjectEntry> = [];
      const rightEntries: Array<StdObjectEntry> = [];

      const {
        left: leftOnly,
        right: rightOnly,
        same,
      } = compareStdObjectsByKey(leftItem as StdObject, rightItem as StdObject);

      same.forEach(({ key, leftIndexValue, rightIndexValue }) => {
        const { index: leftIndex, value: leftValue } = leftIndexValue;
        const { index: rightIndex, value: rightValue } = rightIndexValue;

        if (leftOnly.length) {
          spliceFrom(leftOnly, leftIndex).forEach(({ key: leftKey, indexValue: { index, value } }) => {
            leftEntries[index] = [leftKey, value];
          });
        }

        if (rightOnly.length) {
          spliceFrom(rightOnly, rightIndex).forEach(({ key: rightKey, indexValue: { index, value } }) => {
            rightEntries[index] = [rightKey, value];
          });
        }

        if (refSets.left.has(leftValue) || refSets.right.has(rightValue)) {
          // do not compare if reference already has been processed
          // within object (circular reference)
          return;
        }
        const cmpResult = generalCompare(leftValue, rightValue);
        if (!isMatching(cmpResult)) {
          leftEntries[leftIndex] = [key, cmpResult.left];
          rightEntries[rightIndex] = [key, cmpResult.right];
        }
      });

      result.left = Object.fromEntries([...Object.values(leftEntries), ...leftOnly.map(kiv2soe)]);
      result.right = Object.fromEntries([...Object.values(rightEntries), ...rightOnly.map(kiv2soe)]);
    }

    refSets.left.delete(leftItem);
    refSets.right.delete(rightItem);

    return result;
  };
  return generalCompare;
};
