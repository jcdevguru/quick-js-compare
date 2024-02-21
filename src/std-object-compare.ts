/* eslint-disable no-console */
import QuickCompare from './compare';

import type {
  CompareItem,
  CompareResult,
  StdObject,
  StdObjectEntry,
} from './base-types';

import {
  actualType,
  typeIsStdObject,
  isMatching,
  genResult,
} from './util';

import {
  AppOptions,
} from './option-types';

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

interface KeyIndexValueCompareResult {
  left: Array<KeyIndexValue>
  right: Array<KeyIndexValue>
  same: Array<IndexValueCompareOp>
}

// compareOnMatchedKeysOnly`: true

const stdObjectReducer = (keySet: Set<string>, item: StdObject) => (acc: Array<KeyIndexValue>, key: string, index: number) => {
  if (!keySet.has(key)) {
    acc.push({ key, indexValue: { index, value: item[key] as CompareItem } });
  }
  return acc;
};

export const alignStdObjects = (leftItem: StdObject, rightItem: StdObject): KeyIndexValueCompareResult => {
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

export class StdObjectCompare extends QuickCompare {
  // Incomplete - should not be specific to StdObjects

  public constructor() {
    super('General' as Partial<AppOptions>);
    // incomplete
  }

  compare(leftItem: CompareItem, rightItem: CompareItem): CompareResult {
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

    const leftEntries: Array<StdObjectEntry> = [];
    const rightEntries: Array<StdObjectEntry> = [];

    const {
      left: leftOnly,
      right: rightOnly,
      same,
    } = alignStdObjects(leftItem as StdObject, rightItem as StdObject);

    same.forEach(({ key, leftIndexValue, rightIndexValue }) => {
      const { index: leftIndex, value: leftValue } = leftIndexValue;
      const { index: rightIndex, value: rightValue } = rightIndexValue;

      const uniqueKeyOps: Array<[Array<KeyIndexValue>, number, Array<StdObjectEntry>]> = [
        [leftOnly, leftIndex, leftEntries],
        [rightOnly, rightIndex, rightEntries],
      ];

      uniqueKeyOps.forEach(([kivs, stopIndex, entries]) => {
        const toAssign = entries;
        spliceFrom(kivs, stopIndex).forEach(({ key: uniqueKey, indexValue: { index, value } }) => {
          toAssign[index] = [uniqueKey, value];
        });
      });

      const cmpResult = this.compare(leftValue, rightValue);
      if (!isMatching(cmpResult)) {
        leftEntries[leftIndex] = [key, cmpResult.left];
        rightEntries[rightIndex] = [key, cmpResult.right];
      }
    });

    let left = null;
    let right = null;

    const status = !(leftOnly.length || rightOnly.length || leftEntries.length || rightEntries.length);

    if (!status) {
      left = Object.fromEntries([...Object.values(leftEntries), ...leftOnly.map(kiv2soe)]);
      right = Object.fromEntries([...Object.values(rightEntries), ...rightOnly.map(kiv2soe)]);
    }

    return genResult(left, right, status);
  }
}
