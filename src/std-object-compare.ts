/* eslint-disable no-console */
import QuickCompare from './compare';

import {
  type CompareItem,
  type StdObject,
  type StdObjectEntry,
  type KeyIndexValue,
  type IndexValueCompareOp,
  type ComparisonStatus,
} from './base-types';

import {
  actualType,
  typeIsStdObject,
  createComparison,
  spliceKeyIndexValues,
} from './util';

// compareOnMatchedKeysOnly`: true

const stdObjectReducer = (keySet: Set<string>, item: StdObject) => (acc: Array<KeyIndexValue>, key: string, index: number) => {
  if (!keySet.has(key)) {
    acc.push({ key, indexValue: { index, value: item[key] as CompareItem } });
  }
  return acc;
};

export const alignStdObjects = (leftItem: StdObject, rightItem: StdObject) => {
  const leftKeys = Object.keys(leftItem);
  const rightKeys = Object.keys(rightItem);
  const rightKeyMap = new Map(rightKeys.map((k, i) => [k, i]));
  const sameKeySet = new Set(leftKeys.filter((k) => rightKeyMap.has(k)));

  const corresponding = leftKeys.reduce((acc, key, leftIndex) => {
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

  const leftOnly = leftKeys.reduce(stdObjectReducer(sameKeySet, leftItem), []);
  const rightOnly = rightKeys.reduce(stdObjectReducer(sameKeySet, rightItem), []);

  return { leftOnly, rightOnly, corresponding };
};

export class StdObjectCompare extends QuickCompare {
  // Incomplete - should not be specific to StdObjects

  public constructor() {
    super({ compare: 'General' });
    // incomplete
  }

  compare(leftItem: CompareItem, rightItem: CompareItem) {
    const baseResult = super.compare(leftItem, rightItem);
    if (baseResult.status !== undefined) {
      return baseResult;
    }

    const leftType = actualType(leftItem);
    const rightType = actualType(rightItem);

    if (!typeIsStdObject(leftType) || !typeIsStdObject(rightType)) {
      // (incomplete) - punt
      return baseResult;
    }

    const left: Array<StdObjectEntry> = [];
    const leftSame: Array<StdObjectEntry> = [];
    const rightSame: Array<StdObjectEntry> = [];
    const right: Array<StdObjectEntry> = [];

    const {
      leftOnly,
      rightOnly,
      corresponding,
    } = alignStdObjects(leftItem as StdObject, rightItem as StdObject);

    let status: ComparisonStatus;

    corresponding.forEach(({ key, leftIndexValue, rightIndexValue }) => {
      const { index: leftIndex, value: leftValue } = leftIndexValue;
      const { index: rightIndex, value: rightValue } = rightIndexValue;

      spliceKeyIndexValues(leftOnly, leftIndex).forEach(({ key: leftKey, indexValue: { index, value } }) => {
        left[index] = [leftKey, value];
      });

      spliceKeyIndexValues(rightOnly, rightIndex).forEach(({ key: rightKey, indexValue: { index, value } }) => {
        right[index] = [rightKey, value];
      });

      if (left.length || right.length) {
        status = false;
      }

      const cmpResult = this.compare(leftValue, rightValue);
      if (cmpResult.status === false) {
        left[leftIndex] = [key, leftValue];
        right[rightIndex] = [key, rightValue];
      } else {
        leftSame[leftIndex] = [key, leftValue];
        rightSame[rightIndex] = [key, rightValue];
      }

      if (status === undefined) {
        status = cmpResult.status;
      }
    });

    return createComparison(status, { diff: { left, right }, same: { left: leftSame, right: rightSame } });
  }
}
