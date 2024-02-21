import type { CompareItem, CompareStatus } from './base-types';
import {
  actualType,
  typeIsSupported,
  typeIsPrimitive,
} from './util';

export const GeneralComparer = (leftItem: CompareItem, rightItem: CompareItem) : CompareStatus => {
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

  if (typeIsPrimitive(leftType) && typeIsPrimitive(rightType)) {
    // "General": abstract == true
    // eslint-disable-next-line eqeqeq
    if (leftItem == rightItem) {
      return true;
    }
    return false;
  }

  return undefined;
};

export const StrictComparer = (leftItem: CompareItem, rightItem: CompareItem) : CompareStatus => {
  // always check for strict match
  if (leftItem === rightItem) {
    return true;
  }

  return undefined;
};
