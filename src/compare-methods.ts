import type { Value, Status } from './compare-types';
import {
  actualType,
  typeIsSupported,
  typeIsPrimitive,
} from './compare-util';

export const ExactComparer = (leftValue: Value, rightValue: Value) : Status => {
  // always check for strict match
  if (leftValue === rightValue) {
    return true;
  }

  const leftType = actualType(leftValue);
  const rightType = actualType(rightValue);

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

export const GeneralComparer = (leftValue: Value, rightValue: Value) : Status => {
  // always check for strict match
  const st = ExactComparer(leftValue, rightValue);
  if (!st) {
     
    return leftValue == rightValue;
  }

  return st;
};
