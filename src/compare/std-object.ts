import CoreCompare from '.';

import type {
  Value,
  ComparisonResult,
  StdObject,
  StdObjectEntry,
  KeyIndexValue,
  IndexValueCompareOp,
  IndexValue,
} from './types';

import {
  actualType,
  typeIsStdObject,
  hasDifferences,
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
    super(options);
  }

  compare(left: Value, right: Value) : ComparisonResult {
    const baseResult = super.compare(left, right);
    if (hasDifferences(baseResult)) {
      return baseResult;
    }

    const leftType = actualType(left);
    const rightType = actualType(right);

    if (!typeIsStdObject(leftType) || !typeIsStdObject(rightType)) {
      // (incomplete) - punt
      return baseResult;
    }

    const result: ComparisonResult<Array<StdObjectEntry>> = {};

    const {
      leftOnly,
      rightOnly,
      corresponding,
    } = alignStdObjects(left as StdObject, right as StdObject);

    if (leftOnly.length > 0) {
      result.leftOnly = [];
    }

    if (rightOnly.length > 0) {
      result.rightOnly = [];
    }

    if (corresponding.length > 0) {
      result.left = [];
      result.right = [];

      corresponding.forEach(({ key, leftIndexValue, rightIndexValue }) => {
        const r = this.compare(leftIndexValue.value, rightIndexValue.value);
        if (r.left) {
          result.left![leftIndexValue.index] = [key, r.left];
        }
        if (r.right) {
          result.right![rightIndexValue.index] = [key, r.right];
        }
      });
    }

    if (leftOnly.length > 0) {
      result.leftOnly = [];
      leftOnly.forEach(({ key: leftKey, indexValue: { index, value } }) => {
        result.leftOnly![index] = [leftKey, value];
      });
    }

    if (rightOnly.length > 0) {
      result.rightOnly = [];
      rightOnly.forEach(({ key: rightKey, indexValue: { index, value } }) => {
        result.rightOnly![index] = [rightKey, value];
      });
    }

    return result;
  }
}
