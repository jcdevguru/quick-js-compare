import CoreCompare from '.';

import {
  type ComparisonResult,
  type Value,
  type ComparisonResultObject,
  type StdObject,
  type StdObjectEntry,
  type KeyIndexValue,
  type IndexValueCompareOp,
  type Status,
  ComparisonResultArrayIndex,
  IndexValue,
} from './types';

import {
  actualType,
  typeIsStdObject,
  createComparisonResult,
  spliceKeyIndexValues,
} from './util';

import { OptionObject } from '../lib/option';

const ivp = (index: number, value: unknown): IndexValue => ({ index, value: value as Value });

const kivp = (key: string, index: number, value: unknown): KeyIndexValue => ({ key, indexValue: ivp(index, value) });

const stdObjectReducer = (keySet: Set<string>, obj: StdObject) => (acc: Array<KeyIndexValue>, key: string, index: number) => {
  if (!keySet.has(key)) {
    acc.push(kivp(key, index, obj[key]));
  }
  return acc;
};

export const alignStdObjects = (left: StdObject, right: StdObject) => {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  const rightKeyMap = new Map(rightKeys.map((k, i) => [k, i]));
  const sameKeySet = new Set(leftKeys.filter((k) => rightKeyMap.has(k)));

  const corresponding = leftKeys.reduce((acc: Array<IndexValueCompareOp>, key: string, leftIndex: number) => {
    const rightIndex = rightKeyMap.get(key);
    if (rightIndex !== undefined) {
      acc.push({
        key,
        leftIndexValue: ivp(leftIndex, left[key]),
        rightIndexValue: ivp(rightIndex, right[key]),
      });
    }
    return acc;
  }, []);

  const leftOnly = leftKeys.reduce(stdObjectReducer(sameKeySet, left), []);
  const rightOnly = rightKeys.reduce(stdObjectReducer(sameKeySet, right), []);

  return { leftOnly, rightOnly, corresponding };
};

export class StdObjectCompare extends CoreCompare {

  public constructor(options?: OptionObject) {
    super(options ?? { compare: 'Exact', render: 'Standard' });
  }

  compare(left: Value, right: Value) : ComparisonResult {
    const baseResult = super.compare(left, right);
    if (baseResult.status !== undefined) {
      return baseResult;
    }

    const leftType = actualType(left);
    const rightType = actualType(right);

    if (!typeIsStdObject(leftType) || !typeIsStdObject(rightType)) {
      // (incomplete) - punt
      return baseResult;
    }

    const diff: ComparisonResultObject<Array<StdObjectEntry>> = { left: [], right: [] };
    const same: ComparisonResultObject<Array<StdObjectEntry>> = { left: [], right: [] };

    const {
      Left,
      LeftSame,
      RightSame,
      Right,
    } = ComparisonResultArrayIndex;

    const {
      leftOnly,
      rightOnly,
      corresponding,
    } = alignStdObjects(left as StdObject, right as StdObject);

    let status: Status;

    corresponding.forEach(({ key, leftIndexValue, rightIndexValue }) => {
      const { index: cLeftIndex, value: cLeftValue } = leftIndexValue;
      const { index: cRightIndex, value: cRightValue } = rightIndexValue;

      spliceKeyIndexValues(leftOnly, cLeftIndex).forEach(({ key: leftKey, indexValue: { index, value } }) => {
        diff.left[index] = [leftKey, value];
      });

      spliceKeyIndexValues(rightOnly, cRightIndex).forEach(({ key: rightKey, indexValue: { index, value } }) => {
        diff.right[index] = [rightKey, value];
      });

      if (diff.left.length || diff.right.length) {
        status = false;
      }

      const cmpResult = this.compare(cLeftValue, cRightValue);

      if (cmpResult.result[Left]) {
        diff.left[cLeftIndex] = [key, cmpResult.result[Left]];
      }
      if (cmpResult.result[LeftSame]) {
        same.left[cLeftIndex] = [key, cmpResult.result[LeftSame]];
      }
      if (cmpResult.result[RightSame]) {
        same.right[cRightIndex] = [key, cmpResult.result[RightSame]];
      }
      if (cmpResult.result[Right]) {
        diff.right[cRightIndex] = [key, cmpResult.result[Right]];
      }

      if (status !== false && cmpResult.status !== undefined) {
        status = cmpResult.status;
      }
    });

    leftOnly.forEach(({ key: leftKey, indexValue: { index, value } }) => {
      diff.left[index] = [leftKey, value];
    });

    rightOnly.forEach(({ key: rightKey, indexValue: { index, value } }) => {
      diff.right[index] = [rightKey, value];
    });

    return createComparisonResult(status, { diff, same });
  }
}
