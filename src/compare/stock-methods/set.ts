import Compare from '..';

import {
  type Value,
  SetObject,
} from '../../lib/types';

import type { ComparisonStatus } from '../types';

import {
  isCompareScalarToken,
  isCompareConfigOptions,
} from '../types/config';

import { valueToValueResult } from '../util';

export const valuesOnly = (left: SetObject, right: SetObject, compareInstance: Compare): ComparisonStatus => {
  const compareOptions = compareInstance.compareOptions;
  if (
    isCompareConfigOptions(compareOptions) &&
    isCompareScalarToken(compareOptions.compareScalar) &&
    compareOptions.compareScalar === 'strict'
  ) {
    const sameSet = new Set<Value>();
    const [largerSet, smallerSet] = left.size > right.size ? [left, right] : [right, left];
    for (const v of smallerSet) {
      if (largerSet.has(v)) {
        sameSet.add(v);
      }
    }
    const leftDiff = Array.from(left).filter(value => !sameSet.has(value)).map(v => valueToValueResult(v));
    const rightDiff = Array.from(right).filter(value => !sameSet.has(value)).map(v => valueToValueResult(v));
    const same = Array.from(left).filter(value => sameSet.has(value)).map(v => valueToValueResult(v));
    let comparisonStatus = undefined;
    if (leftDiff.length > 0) {
      comparisonStatus = false;
    }
    if (rightDiff.length > 0) {
      comparisonStatus = false;
    }
    if (same.length > 0) {
      comparisonStatus = comparisonStatus ?? true;
    }
    return comparisonStatus;
  }

  // Incomplete
  return false;
}

export const sizeOnly = (left: SetObject, right: SetObject): ComparisonStatus => {
  return left.size === right.size;
}

export const strict = (left: SetObject, right: SetObject): ComparisonStatus => {
  // Incomplete
  return left === right;
}
