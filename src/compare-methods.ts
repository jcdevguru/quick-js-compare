import type { CompareItem, ComparisonStatus } from './base-types';
import {
  actualType,
  typeIsSupported,
  typeIsPrimitive,
} from './util';

export const StrictComparer = (leftItem: CompareItem, rightItem: CompareItem) : ComparisonStatus => {
  // always check for strict match
  if (leftItem === rightItem) {
    return true;
  }

  const leftType = actualType(leftItem);
  const rightType = actualType(rightItem);

  // if we can't support the comparison, don't try
  if (!typeIsSupported(leftType) || !typeIsSupported(rightType)) {
    return undefined;
  }

  if (leftType !== rightType) {
    return false;
  }

  if (typeIsPrimitive(leftType)) {
    return false;
  }

  return undefined;
};

export const GeneralComparer = (leftItem: CompareItem, rightItem: CompareItem) : ComparisonStatus => {
  // always check for strict match
  const st = StrictComparer(leftItem, rightItem);
  if (!st) {
    // eslint-disable-next-line eqeqeq
    return leftItem == rightItem;
  }

  return st;
};
