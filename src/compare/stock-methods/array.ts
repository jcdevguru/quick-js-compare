import { actualType, type ArrayObject } from '@lib/types';
import type { CompareResult, ComparisonStatus, ValueResults } from '@compare/types';
import type Compare from '@compare';
import { valueToValueResult } from '@compare/util';

export const sizeOnly = (left: ArrayObject, right: ArrayObject): ComparisonStatus => {
  return left.length === right.length;
}

const sliceValuesToValueResults = (values: ArrayObject, start: number): ValueResults => 
  values.slice(start).map((value, i) => valueToValueResult(value, { index: start + i }));

export const strict = (
  left: ArrayObject, right: ArrayObject,
  instance: Compare,
  updateSubResult: (result: CompareResult) => void
): ComparisonStatus => {
  const minLength = Math.min(left.length, right.length);
  let status: ComparisonStatus = true;

  if (minLength === 0) {
    if (left.length > 0) {
      updateSubResult({
        left: left.map((value, i) => valueToValueResult(value, { index: i })),
        right: [],
      });
      status = false;
    } else if (right.length > 0) {
      updateSubResult({
        left: [],
        right: right.map((value, i) => valueToValueResult(value, { index: i })),
      });
      status = false;
    } else {
      updateSubResult({
        leftSame: [],
        rightSame: [],
      });
    }
    return status;
  }

  for (let i = 0; i < minLength; i++) {
    const leftValue = left[i];
    const rightValue = right[i];
    
    if (leftValue === rightValue) {
      updateSubResult({
        leftSame: [valueToValueResult(leftValue, { index: i })],
        rightSame: [valueToValueResult(rightValue, { index: i })],
      });
      continue;
    }

    if (actualType(leftValue) !== actualType(rightValue)) {
      updateSubResult({
        left: [valueToValueResult(leftValue, { index: i })],
        right: [valueToValueResult(rightValue, { index: i })],
      });
      continue;
    }
    
    instance.addSubCompare(leftValue, rightValue);
  }

  if (minLength < left.length) {
    updateSubResult({
      left: sliceValuesToValueResults(left, minLength)
    });
    status = false;
  } else if (minLength < right.length) {
    updateSubResult({
      right: sliceValuesToValueResults(right, minLength)
    });
    status = false;
  }

  // Only check subResult if we haven't already found differences
  if (status && instance.subResult) {
    status = !instance.subResult.left && !instance.subResult.right;
  }

  return status;
}
