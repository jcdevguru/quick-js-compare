import Compare from '..';

import {
  type Value,
  isSetObject,
} from '../../lib/types';

import type { ComparisonStatus } from '../types';

import {
  isCompareScalarToken,
  isCompareConfigOptions,
} from '../types/config';

import { valueToValueResult } from '../util';

export const valuesOnly = (left: Value, right: Value, compareInstance: Compare): ComparisonStatus => {
  if (!isSetObject(left) || !isSetObject(right)) {
    throw new Error('Values must be Sets');
  }
  const compareOptions = compareInstance.compareOptions;
  const scalarIsStrict = isCompareConfigOptions(compareOptions) &&
    isCompareScalarToken(compareOptions.compareScalar) &&
    compareOptions.compareScalar === 'strict';
  if (scalarIsStrict) {
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
