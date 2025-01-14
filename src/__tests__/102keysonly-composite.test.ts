// These tests that are for validations and functions of
// compare options provided through the top-level function

import { type MinimalConfigOptions } from '@lib/option';
import { verifyCompare, compareTestLabel } from '@test/util';

describe('set comparisons', () => {
  const options: MinimalConfigOptions = { compare: { compareSet: 'strict' } };
  test(compareTestLabel('mismatching set of integers (strict)', options), () => {
    verifyCompare(
      new Set([1, 2, 3]), 
      new Set([1, 2, 4]), 
      options,
      false,
      {
        same: [1, 2],
        left: [3],
        right: [4]
      }
    );
  });
  
  test(compareTestLabel('matching set of integers (valuesOnly)', options), () => {
    verifyCompare(
      new Set([1, 2, 3]), 
      new Set([1, 2, 3]), 
      options,
      true,
      {
        same: [1, 2, 3]
      }
    );
  });
});

describe('map comparisons', () => {
  const leftMap = new Map([
    ['a', 1], ['b', 2], ['c', 3]
  ]);
  const rightMap = new Map([
    ['a', 1], ['b', 2], ['d', 3]
  ]);

  const options: MinimalConfigOptions = { compare: { compareMap: 'keysOnly' } };
  test(compareTestLabel('mismatching maps (keysOnly)', options), () => {
    verifyCompare(
      leftMap, 
      rightMap, 
      options,
      false,
      {
        same: ['a', 'b'],
        left: ['c'],
        right: ['d']
      }
    );
  });

  const matchingMap1 = new Map([['a', 1], ['b', 2]]);
  const matchingMap2 = new Map([['a', 10], ['b', 12]]);
  test(compareTestLabel('matching maps (keysOnly)', options), () => {
    verifyCompare(
      matchingMap1, 
      matchingMap2, 
      options,
      true,
      {
        same: ['a', 'b']
      }
    );
  });
});
