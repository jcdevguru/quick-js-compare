import type { Value } from '../lib/types';
import {
  typeIsSupported,
  typeIsScalar,
  type ComparisonResult
} from './types';

import { hasDifferences, valueToComparedItem } from './util';

export const ExactComparer = (leftValue: Value, rightValue: Value) : ComparisonResult => {
  // always check for strict match

  const leftItem = valueToComparedItem(leftValue);
  const rightItem = valueToComparedItem(rightValue);

  const leftType = leftItem.typeName;
  const rightType = rightItem.typeName;

  // if we can't support the comparison, don't try
  if (!typeIsSupported(leftType) || !typeIsSupported(rightType)) {
    return {};
  }

  if (leftValue === rightValue) {
    return { leftSame: [leftItem], rightSame: [rightItem] };
  }

  if (leftType !== rightType || typeIsScalar(leftType)) {
    return { left: [leftItem], right: [rightItem] };
  }

  return {};
};

export const GeneralComparer = (leftValue: Value, rightValue: Value) : ComparisonResult => {
  // always check for strict match
  const st = ExactComparer(leftValue, rightValue);
  if (!hasDifferences(st)) {
    return st;
  }

  // incomplete
  const result: ComparisonResult = {};
  if (st.leftOnly) {
    result.leftOnly = st.leftOnly;
  }
  
  if (st.rightOnly) {
    result.rightOnly = st.rightOnly;
  }

  if (st.left && st.right) {
    if (leftValue == rightValue) {
      result.leftSame = st.left;
      result.rightSame = st.right;
    } else {
      result.left = st.left;
      result.right = st.right;
    }
  }

  return result;
};
