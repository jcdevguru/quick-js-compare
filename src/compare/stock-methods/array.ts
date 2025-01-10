import type { ArrayObject } from '@lib/types';
import type { ComparisonStatus } from '@compare/types';

export const sizeOnly = (left: ArrayObject, right: ArrayObject): ComparisonStatus => {
  return left.length === right.length;
}

export const strict = (left: ArrayObject, right: ArrayObject): ComparisonStatus => {
  // Incomplete
  return left === right;
}
