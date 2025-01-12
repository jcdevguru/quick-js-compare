import type { MinimalConfigOptions } from '@lib/option';
import type { ArrayObject } from '@lib/types';
import { verifyCompare, compareTestLabel } from '@test/util';

describe('array comparisons (strict)', () => {
  const options: MinimalConfigOptions = { compare: { compareArray: 'strict' } };

  test(compareTestLabel('empty arrays', options), () => {
    verifyCompare([], [], options, true, {
      sameValues: []
    });
  });

  test(compareTestLabel('one empty array vs non-empty', options), () => {
    const left: ArrayObject = [];
    const right: ArrayObject = [1, 2, 3];
    verifyCompare(left, right, options, false, {
      leftValues: left,
      rightValues: right
    });
  });

  test(compareTestLabel('matching arrays of numbers', options), () => {
    const left: ArrayObject = [1, 2, 3];
    const right: ArrayObject = [...left];
    verifyCompare(left, right, options, true, {
      sameValues: left
    });
  });

  test(compareTestLabel('arrays with type mismatch', options), () => {
    const testValues = [1, 2, 3];
    const left = [...testValues];
    const right: Array<number|string> = [...testValues];
    right[1] = `${right[1]}`;
    verifyCompare(left, right, options, false, {
      sameValues: [testValues[0], testValues[2]],
      leftValues: [left[1]],
      rightValues: [right[1]]
    });
  });

  test(compareTestLabel('arrays of different lengths', options), () => {
    const testValues = [1, 2, 3];
    const left = [...testValues, 4];
    const right = [...testValues];
    verifyCompare(left, right, options, false, {
      sameValues: testValues,
      leftValues: [left[3]],
      rightValues: []
    });
  });

  test(compareTestLabel('arrays with different values', options), () => {
    const testValues = [1, 2, 3];
    const left = [...testValues];
    const right = [...testValues];
    right[1] = 5;
    verifyCompare(left, right, options, false, {
      sameValues: [testValues[0], testValues[2]],
      leftValues: [left[1]],
      rightValues: [right[1]]
    });
  });
}); 