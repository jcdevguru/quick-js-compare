import type Compare from '@compare';

import { commonSetElements } from '@lib/util';

import type {
  SetObject
} from '@lib/types';

import type { CompareResult, ComparisonStatus, ValueResults } from '@compare/types';

import { valueToValueResult } from '@compare/util';
import { type StockSubResultSetter } from '.';

export const strict = (left: SetObject, right: SetObject, instance: Compare, updateSubResult: StockSubResultSetter): ComparisonStatus => {
  const subResult: CompareResult = {};

  const sameSet = commonSetElements(left, right);
  const leftDiff = Array.from(left).filter(value => !sameSet.has(value)).map(v => valueToValueResult(v)) as ValueResults;
  const rightDiff = Array.from(right).filter(value => !sameSet.has(value)).map(v => valueToValueResult(v)) as ValueResults;
  const same = Array.from(sameSet).map(v => valueToValueResult(v)) as ValueResults;
  const comparisonStatus = !leftDiff.length && !rightDiff.length;

  if (!comparisonStatus) {
    subResult.left = leftDiff;
    subResult.right = rightDiff;
  }

  if (same.length > 0) {
    subResult.leftSame = same;
    subResult.rightSame = same;
  }

  setSubResult(subResult);

  return comparisonStatus;
}

export const sizeOnly = (left: SetObject, right: SetObject): ComparisonStatus => {
  return left.size === right.size;
}

export const valuesOnly = (
  left: SetObject, right: SetObject, instance: Compare, updateSubResult: StockSubResultSetter
): ComparisonStatus => {
  // Incomplete
  return strict(left, right, instance, updateSubResult);
}

