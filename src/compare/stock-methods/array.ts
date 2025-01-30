
import type Compare from '@compare';

import { 
  type ArrayObject
} from '@lib/types';

import type {
  ComparisonStatus
} from '@compare/types';

export const sizeOnly = (left: ArrayObject, right: ArrayObject): ComparisonStatus => {
  return left.length === right.length;
}

export const strict = (
  left: ArrayObject, right: ArrayObject,
  instance: Compare): ComparisonStatus => {
  const minLength = Math.min(left.length, right.length);
  let status: ComparisonStatus = true;

  // if (minLength === 0) {
  //   if (left.length > 0) {
  //     updateSubResult({
  //       left: left.map((value, i) => valueToArrayValueResult(value, i)),
  //       right: [],
  //     });
  //     status = false;
  //   } else if (right.length > 0) {
  //     updateSubResult({
  //       left: [],
  //       right: right.map((value, i) => valueToArrayValueResult(value, i)),
  //     });
  //     status = false;
  //   } else {
  //     updateSubResult({
  //       leftSame: [],
  //       rightSame: [],
  //     });
  //   }
  //   return status;
  // }

  // for (let i = 0; i < minLength; i++) {
  //   const leftValue = left[i];
  //   const rightValue = right[i];
    
  //   if (leftValue === rightValue && isScalar(leftValue)) {
  //     updateSubResult({
  //       leftSame: [valueToArrayValueResult(leftValue, i)],
  //       rightSame: [valueToArrayValueResult(rightValue, i)],
  //     });
  //     continue;
  //   }

  //   if (actualType(leftValue) !== actualType(rightValue)) {
  //     updateSubResult({
  //       left: [valueToArrayValueResult(leftValue, i)],
  //       right: [valueToArrayValueResult(rightValue, i)],
  //     });
  //     continue;
  //   }
    
  //   instance.addSubCompare(leftValue, rightValue);
  // }

  // if (minLength < left.length) {
  //   updateSubResult({
  //     left: sliceValuesToValueResults(left, minLength)
  //   });
  //   status = false;
  // } else if (minLength < right.length) {
  //   updateSubResult({
  //     right: sliceValuesToValueResults(right, minLength)
  //   });
  //   status = false;
  // }

  // // Only check subResult if we haven't already found differences
  // if (status && instance.subResult) {
  //   status = !instance.subResult.left && !instance.subResult.right;
  // }

  return status;
}
