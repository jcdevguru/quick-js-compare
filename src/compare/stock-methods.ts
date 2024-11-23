import type { Value } from '../lib/types';
import {
  actualType,
  typeIsSupported,
  typeIsPrimitive,
  type ComparisonResult
} from './types';

import { hasDifferences } from './util';

export const ExactComparer = (leftValue: Value, rightValue: Value) : ComparisonResult => {
  // always check for strict match
  if (leftValue === rightValue) {
    return { leftSame: leftValue, rightSame: rightValue };
  }

  const leftType = actualType(leftValue);
  const rightType = actualType(rightValue);

  // if we can't support the comparison, don't try
  if (!typeIsSupported(leftType) || !typeIsSupported(rightType)) {
    return {};
  }

  if (leftType !== rightType || typeIsPrimitive(leftType)) {
    return { left: leftValue, right: rightValue };
  }

  return {};
};

export const GeneralComparer = (leftValue: Value, rightValue: Value) : ComparisonResult => {
  // always check for strict match
  const st = ExactComparer(leftValue, rightValue);
  // incomplete
  if (hasDifferences(st) && leftValue === rightValue) {
    return { leftSame: leftValue, rightSame: rightValue };
  }

  return st;
};
